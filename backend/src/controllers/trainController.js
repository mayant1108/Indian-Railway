import { Train } from "../models/Train.js";
import {
  buildAvailabilitySummary,
  buildBookingQuote,
  getConfirmedBookingsForJourney,
  getRouteSegment,
  groupBookingsByTrain,
  normalizeStationName,
  trainRunsOnJourneyDate,
} from "../services/trainService.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { daysUntilJourney, isValidDateString } from "../utils/date.js";

const serializeTrain = (train) => ({
  _id: train._id,
  trainNumber: train.trainNumber,
  name: train.name,
  source: train.source,
  destination: train.destination,
  departureTime: train.departureTime,
  arrivalTime: train.arrivalTime,
  durationMinutes: train.durationMinutes,
  distanceKm: train.distanceKm,
  runsOn: train.runsOn,
  amenities: train.amenities,
});

const serializeRouteStop = (stop) => ({
  station: stop.station,
  arrivalTime: stop.arrivalTime,
  departureTime: stop.departureTime,
  dayOffset: stop.dayOffset,
  distanceFromOrigin: stop.distanceFromOrigin,
});

const sortResults = (results, sortBy = "departure", sortOrder = "asc") => {
  const direction = sortOrder === "desc" ? -1 : 1;

  return [...results].sort((left, right) => {
    if (sortBy === "duration") {
      return (left.segment.durationMinutes - right.segment.durationMinutes) * direction;
    }

    if (sortBy === "fare") {
      const leftFare = Math.min(
        ...left.classes.filter((item) => item.isAvailable).map((item) => item.farePerPassenger),
        Number.MAX_SAFE_INTEGER
      );
      const rightFare = Math.min(
        ...right.classes.filter((item) => item.isAvailable).map((item) => item.farePerPassenger),
        Number.MAX_SAFE_INTEGER
      );

      return (leftFare - rightFare) * direction;
    }

    if (sortBy === "availability") {
      const leftAvailability = left.classes.reduce(
        (count, item) => count + item.seatsAvailable,
        0
      );
      const rightAvailability = right.classes.reduce(
        (count, item) => count + item.seatsAvailable,
        0
      );

      return (leftAvailability - rightAvailability) * direction;
    }

    return left.segment.departureTime.localeCompare(right.segment.departureTime) * direction;
  });
};

export const listStations = asyncHandler(async (_req, res) => {
  const trains = await Train.find({}, { routeStops: 1, source: 1, destination: 1 }).lean();
  const stations = new Set();

  trains.forEach((train) => {
    stations.add(train.source);
    stations.add(train.destination);
    train.routeStops.forEach((stop) => stations.add(stop.station));
  });

  res.json({
    success: true,
    data: {
      stations: [...stations].sort((left, right) => left.localeCompare(right)),
    },
  });
});

export const searchTrains = asyncHandler(async (req, res) => {
  const { source, destination, date, classCode, sortBy, sortOrder } = req.query;

  if (!source || !destination || !date) {
    throw new ApiError(400, "Source, destination, and date are required.");
  }

  if (!isValidDateString(date)) {
    throw new ApiError(400, "Journey date must be in YYYY-MM-DD format.");
  }

  if (daysUntilJourney(date) < 0) {
    throw new ApiError(400, "Journey date cannot be in the past.");
  }

  if (normalizeStationName(source) === normalizeStationName(destination)) {
    throw new ApiError(400, "Source and destination must be different stations.");
  }

  const trains = await Train.find({}).sort({ trainNumber: 1 }).lean();
  const eligibleTrains = trains
    .map((train) => ({
      train,
      segment: getRouteSegment(train, source, destination),
    }))
    .filter(
      ({ train, segment }) => segment && trainRunsOnJourneyDate(train, date)
    );

  const bookings = await getConfirmedBookingsForJourney({
    trainIds: eligibleTrains.map(({ train }) => train._id),
    journeyDate: date,
  });
  const bookingsByTrain = groupBookingsByTrain(bookings);

  const results = eligibleTrains.map(({ train, segment }) => {
    const trainBookings = bookingsByTrain[String(train._id)] ?? [];
    const classes = buildAvailabilitySummary({
      train,
      segment,
      journeyDate: date,
      bookings: trainBookings,
    });

    return {
      ...serializeTrain(train),
      segment,
      classes,
      routeStops: train.routeStops.map(serializeRouteStop),
      availableClasses: classes.filter((item) => item.isAvailable).length,
    };
  });

  const filteredResults = classCode
    ? results.filter((train) =>
        train.classes.some(
          (item) => item.code === String(classCode).toUpperCase() && item.isAvailable
        )
      )
    : results;

  res.json({
    success: true,
    data: {
      trains: sortResults(filteredResults, sortBy, sortOrder),
      total: filteredResults.length,
      search: {
        source,
        destination,
        date,
        classCode: classCode ? String(classCode).toUpperCase() : null,
      },
    },
  });
});

export const getTrainDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { journeyDate, source, destination, classCode } = req.query;

  if (!journeyDate || !isValidDateString(journeyDate)) {
    throw new ApiError(400, "A valid journeyDate query parameter is required.");
  }

  if (daysUntilJourney(journeyDate) < 0) {
    throw new ApiError(400, "Journey date cannot be in the past.");
  }

  const train = await Train.findById(id).lean();

  if (!train) {
    throw new ApiError(404, "Train not found.");
  }

  if (!trainRunsOnJourneyDate(train, journeyDate)) {
    throw new ApiError(400, "This train is not available on the selected date.");
  }

  const segment = getRouteSegment(train, source, destination);

  if (!segment) {
    throw new ApiError(400, "The selected stations are not valid for this train.");
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
    passengerCount: 1,
    bookings,
  });

  if (!quote) {
    throw new ApiError(400, "Unable to build seat availability for this request.");
  }

  res.json({
    success: true,
    data: {
      train: {
        ...serializeTrain(train),
        routeStops: train.routeStops.map(serializeRouteStop),
        classes: train.classes,
      },
      segment,
      journeyDate,
      availability: buildAvailabilitySummary({
        train,
        segment,
        journeyDate,
        bookings,
      }),
      selectedClass: quote.trainClass,
      pricing: quote.pricing,
      seatMap: quote.seatMap,
    },
  });
});
