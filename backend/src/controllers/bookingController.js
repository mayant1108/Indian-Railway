import { Booking } from "../models/Booking.js";
import { Train } from "../models/Train.js";
import { sendBookingConfirmationEmail } from "../services/emailService.js";
import {
  buildBookingQuote,
  getConfirmedBookingsForJourney,
  trainRunsOnJourneyDate,
} from "../services/trainService.js";
import {
  createPaymentOrder,
  resolvePaymentDetails,
} from "../services/paymentService.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { daysUntilJourney, isValidDateString } from "../utils/date.js";
import { generatePnr } from "../utils/generatePnr.js";
import { makeSeatAllocationKey } from "../utils/seatUtils.js";

const passengerLimit = 6;

const serializeBooking = (booking) => ({
  _id: booking._id,
  pnr: booking.pnr,
  train: booking.train,
  trainNumber: booking.trainNumber,
  trainName: booking.trainName,
  journeyDate: booking.journeyDate,
  source: booking.source,
  destination: booking.destination,
  selectedClass: booking.selectedClass,
  passengers: booking.passengers,
  seatNumbers: booking.seatNumbers,
  totalFare: booking.totalFare,
  status: booking.status,
  payment: booking.payment,
  pricingBreakdown: booking.pricingBreakdown,
  contact: booking.contact,
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
});

const normalizePassenger = (passenger, seatNumber) => ({
  name: String(passenger.name ?? "").trim(),
  age: Number(passenger.age),
  gender: String(passenger.gender ?? "").trim(),
  berthPreference: String(passenger.berthPreference ?? "No preference").trim(),
  seatNumber,
});

const validateBookingInput = ({
  trainId,
  journeyDate,
  source,
  destination,
  classCode,
  passengers,
  selectedSeatNumbers,
}) => {
  if (!trainId || !journeyDate || !source || !destination || !classCode) {
    throw new ApiError(
      400,
      "trainId, journeyDate, source, destination, and classCode are required."
    );
  }

  if (!isValidDateString(journeyDate)) {
    throw new ApiError(400, "journeyDate must be in YYYY-MM-DD format.");
  }

  if (daysUntilJourney(journeyDate) < 0) {
    throw new ApiError(400, "Journey date cannot be in the past.");
  }

  if (!Array.isArray(passengers) || passengers.length === 0) {
    throw new ApiError(400, "At least one passenger is required.");
  }

  if (passengers.length > passengerLimit) {
    throw new ApiError(400, `A maximum of ${passengerLimit} passengers is allowed per booking.`);
  }

  if (!Array.isArray(selectedSeatNumbers) || selectedSeatNumbers.length !== passengers.length) {
    throw new ApiError(
      400,
      "selectedSeatNumbers must be provided and match the passenger count."
    );
  }
};

const getQuoteForRequest = async ({
  trainId,
  journeyDate,
  source,
  destination,
  classCode,
  passengerCount,
}) => {
  const train = await Train.findById(trainId).lean();

  if (!train) {
    throw new ApiError(404, "Train not found.");
  }

  if (!trainRunsOnJourneyDate(train, journeyDate)) {
    throw new ApiError(400, "This train does not operate on the selected date.");
  }

  const bookings = await getConfirmedBookingsForJourney({
    trainIds: [train._id],
    journeyDate,
  });
  const quote = buildBookingQuote({
    train,
    journeyDate,
    source,
    destination,
    classCode,
    passengerCount,
    bookings,
  });

  if (!quote) {
    throw new ApiError(400, "Unable to prepare a booking quote for this request.");
  }

  return {
    train,
    bookings,
    quote,
  };
};

export const createBookingOrder = asyncHandler(async (req, res) => {
  const {
    trainId,
    journeyDate,
    source,
    destination,
    classCode,
    passengerCount = 1,
  } = req.body;

  const { train, quote } = await getQuoteForRequest({
    trainId,
    journeyDate,
    source,
    destination,
    classCode,
    passengerCount: Number(passengerCount) || 1,
  });

  const paymentOrder = await createPaymentOrder({
    amount: quote.pricing.totalFare,
    receipt: `${train.trainNumber}-${Date.now()}`,
    notes: {
      trainId: String(train._id),
      journeyDate,
      classCode: quote.trainClass.code,
    },
  });

  res.json({
    success: true,
    data: {
      pricing: quote.pricing,
      paymentOrder,
    },
  });
});

export const createBooking = asyncHandler(async (req, res) => {
  const {
    trainId,
    journeyDate,
    source,
    destination,
    classCode,
    passengers,
    selectedSeatNumbers = req.body.seatNumbers,
    paymentMethod = "dummy",
    paymentPayload,
    contact = {},
  } = req.body;

  validateBookingInput({
    trainId,
    journeyDate,
    source,
    destination,
    classCode,
    passengers,
    selectedSeatNumbers,
  });

  const { train, quote } = await getQuoteForRequest({
    trainId,
    journeyDate,
    source,
    destination,
    classCode,
    passengerCount: passengers.length,
  });

  const availableSeatSet = new Set(
    quote.seatMap.filter((seat) => seat.status === "available").map((seat) => seat.seatNumber)
  );
  const normalizedSeatNumbers = selectedSeatNumbers.map((seatNumber) =>
    String(seatNumber).trim().toUpperCase()
  );

  if (new Set(normalizedSeatNumbers).size !== normalizedSeatNumbers.length) {
    throw new ApiError(400, "Each passenger must have a unique seat.");
  }

  normalizedSeatNumbers.forEach((seatNumber) => {
    if (!availableSeatSet.has(seatNumber)) {
      throw new ApiError(
        409,
        `Seat ${seatNumber} is unavailable. Please refresh and select a different seat.`
      );
    }
  });

  const normalizedPassengers = passengers.map((passenger, index) => {
    const normalizedPassenger = normalizePassenger(passenger, normalizedSeatNumbers[index]);

    if (!normalizedPassenger.name || !normalizedPassenger.gender || !normalizedPassenger.age) {
      throw new ApiError(400, "Passenger name, age, and gender are required.");
    }

    if (normalizedPassenger.age < 1 || normalizedPassenger.age > 120) {
      throw new ApiError(400, "Passenger age must be between 1 and 120.");
    }

    return normalizedPassenger;
  });

  const payment = resolvePaymentDetails({
    paymentMethod,
    paymentPayload,
    expectedAmount: quote.pricing.totalFare,
  });

  const booking = await Booking.create({
    pnr: generatePnr(),
    user: req.user._id,
    train: train._id,
    trainNumber: train.trainNumber,
    trainName: train.name,
    journeyDate,
    source: quote.segment.source,
    destination: quote.segment.destination,
    selectedClass: quote.trainClass.code,
    passengers: normalizedPassengers,
    seatNumbers: normalizedSeatNumbers,
    seatAllocationKeys: normalizedSeatNumbers.map((seatNumber) =>
      makeSeatAllocationKey({
        trainId: train._id,
        journeyDate,
        classCode: quote.trainClass.code,
        seatNumber,
      })
    ),
    totalFare: quote.pricing.totalFare,
    payment,
    pricingBreakdown: quote.pricing.pricingBreakdown,
    contact: {
      email: contact.email || req.user.email,
      phone: contact.phone || req.user.phone,
    },
  });

  try {
    await sendBookingConfirmationEmail({
      booking,
      user: req.user,
    });
  } catch (error) {
    console.error("Booking confirmation email failed:", error.message);
  }

  res.status(201).json({
    success: true,
    message: "Booking confirmed successfully.",
    data: {
      booking: serializeBooking(booking),
    },
  });
});

export const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: {
      bookings: bookings.map(serializeBooking),
    },
  });
});
