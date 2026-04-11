import { Booking } from "../models/Booking.js";
import { calculatePricing } from "./pricingService.js";
import { calculateDurationBetweenStops, getWeekdayName } from "../utils/date.js";
import { buildSeatLayout, getTotalSeatsForClass } from "../utils/seatUtils.js";

export const normalizeStationName = (value = "") =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

export const trainRunsOnJourneyDate = (train, journeyDate) =>
  train.runsOn.includes(getWeekdayName(journeyDate));

export const getRouteSegment = (train, source, destination) => {
  const requestedSource = normalizeStationName(source ?? train.source);
  const requestedDestination = normalizeStationName(destination ?? train.destination);
  const sourceIndex = train.routeStops.findIndex(
    (stop) => normalizeStationName(stop.station) === requestedSource
  );
  const destinationIndex = train.routeStops.findIndex(
    (stop) => normalizeStationName(stop.station) === requestedDestination
  );

  if (
    sourceIndex === -1 ||
    destinationIndex === -1 ||
    destinationIndex <= sourceIndex
  ) {
    return null;
  }

  const sourceStop = train.routeStops[sourceIndex];
  const destinationStop = train.routeStops[destinationIndex];

  return {
    source: sourceStop.station,
    destination: destinationStop.station,
    departureTime: sourceStop.departureTime,
    arrivalTime: destinationStop.arrivalTime,
    distanceKm:
      destinationStop.distanceFromOrigin - sourceStop.distanceFromOrigin,
    durationMinutes: calculateDurationBetweenStops(sourceStop, destinationStop),
    sourceStop,
    destinationStop,
  };
};

export const getConfirmedBookingsForJourney = async ({ trainIds, journeyDate }) => {
  if (!trainIds.length) {
    return [];
  }

  return Booking.find({
    train: { $in: trainIds },
    journeyDate,
    status: "confirmed",
  }).lean();
};

export const groupBookingsByTrain = (bookings) =>
  bookings.reduce((accumulator, booking) => {
    const key = String(booking.train);

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(booking);
    return accumulator;
  }, {});

export const getBookedSeatNumbers = (bookings, classCode) =>
  bookings
    .filter((booking) => booking.selectedClass === classCode)
    .flatMap((booking) => booking.seatNumbers);

export const buildAvailabilitySummary = ({
  train,
  segment,
  journeyDate,
  bookings,
}) =>
  train.classes.map((trainClass) => {
    const bookedSeatCount = bookings
      .filter((booking) => booking.selectedClass === trainClass.code)
      .reduce((count, booking) => count + booking.seatNumbers.length, 0);
    const totalSeats = getTotalSeatsForClass(trainClass);
    const pricing = calculatePricing({
      train,
      trainClass,
      segmentDistance: segment.distanceKm,
      journeyDate,
      bookedSeats: bookedSeatCount,
    });

    return {
      code: trainClass.code,
      name: trainClass.name,
      coachCount: trainClass.coachCount,
      seatsPerCoach: trainClass.seatsPerCoach,
      totalSeats,
      bookedSeats: bookedSeatCount,
      seatsAvailable: Math.max(totalSeats - bookedSeatCount, 0),
      farePerPassenger: pricing.farePerPassenger,
      occupancyRatio: pricing.occupancyRatio,
      pricingBreakdown: pricing.pricingBreakdown,
      isAvailable: totalSeats - bookedSeatCount > 0,
    };
  });

export const resolveTrainClass = (train, classCode) =>
  train.classes.find(
    (trainClass) => trainClass.code === (classCode ?? train.classes[0]?.code)
  );

export const buildSeatMap = ({ trainClass, bookedSeatNumbers = [] }) => {
  const bookedSeatSet = new Set(bookedSeatNumbers);

  return buildSeatLayout(trainClass).map((seat) => ({
    ...seat,
    status: bookedSeatSet.has(seat.seatNumber) ? "booked" : "available",
  }));
};

export const buildBookingQuote = ({
  train,
  journeyDate,
  source,
  destination,
  classCode,
  passengerCount,
  bookings,
}) => {
  const segment = getRouteSegment(train, source, destination);

  if (!segment) {
    return null;
  }

  const trainClass = resolveTrainClass(train, classCode);

  if (!trainClass) {
    return null;
  }

  const bookedSeatCount = bookings
    .filter((booking) => booking.selectedClass === trainClass.code)
    .reduce((count, booking) => count + booking.seatNumbers.length, 0);
  const pricing = calculatePricing({
    train,
    trainClass,
    segmentDistance: segment.distanceKm,
    journeyDate,
    bookedSeats: bookedSeatCount,
    passengerCount,
  });

  return {
    segment,
    trainClass,
    pricing,
    seatMap: buildSeatMap({
      trainClass,
      bookedSeatNumbers: getBookedSeatNumbers(bookings, trainClass.code),
    }),
  };
};
