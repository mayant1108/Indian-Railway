import { Train } from "../models/Train.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateDurationBetweenStops } from "../utils/date.js";

const normalizeStringArray = (value) =>
  (Array.isArray(value) ? value : [])
    .map((item) => String(item).trim())
    .filter(Boolean);

const normalizeRouteStops = (value) => {
  if (!Array.isArray(value) || value.length < 2) {
    throw new ApiError(400, "routeStops must contain at least two stops.");
  }

  return value.map((stop) => ({
    station: String(stop.station ?? "").trim(),
    arrivalTime: String(stop.arrivalTime ?? "").trim(),
    departureTime: String(stop.departureTime ?? "").trim(),
    dayOffset: Number(stop.dayOffset ?? 0),
    distanceFromOrigin: Number(stop.distanceFromOrigin ?? 0),
  }));
};

const normalizeClasses = (value) => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ApiError(400, "classes must contain at least one class.");
  }

  return value.map((trainClass) => ({
    code: String(trainClass.code ?? "").trim().toUpperCase(),
    name: String(trainClass.name ?? "").trim(),
    coachCount: Number(trainClass.coachCount ?? 0),
    seatsPerCoach: Number(trainClass.seatsPerCoach ?? 0),
    baseFare: Number(trainClass.baseFare ?? 0),
  }));
};

const normalizeTrainPayload = (payload) => {
  const routeStops = normalizeRouteStops(payload.routeStops);
  const classes = normalizeClasses(payload.classes);
  const firstStop = routeStops[0];
  const lastStop = routeStops[routeStops.length - 1];
  const calculatedDuration = calculateDurationBetweenStops(firstStop, lastStop);
  const calculatedDistance = lastStop.distanceFromOrigin - firstStop.distanceFromOrigin;

  return {
    trainNumber: String(payload.trainNumber ?? "").trim().toUpperCase(),
    name: String(payload.name ?? "").trim(),
    source: String(payload.source ?? firstStop.station).trim(),
    destination: String(payload.destination ?? lastStop.station).trim(),
    departureTime: String(payload.departureTime ?? firstStop.departureTime).trim(),
    arrivalTime: String(payload.arrivalTime ?? lastStop.arrivalTime).trim(),
    durationMinutes: Number(payload.durationMinutes ?? calculatedDuration),
    distanceKm: Number(payload.distanceKm ?? calculatedDistance),
    runsOn: normalizeStringArray(payload.runsOn),
    routeStops,
    classes,
    amenities: normalizeStringArray(payload.amenities),
  };
};

export const listAdminTrains = asyncHandler(async (_req, res) => {
  const trains = await Train.find({}).sort({ createdAt: -1 }).lean();

  res.json({
    success: true,
    data: {
      trains,
    },
  });
});

export const createTrain = asyncHandler(async (req, res) => {
  const trainPayload = normalizeTrainPayload(req.body);

  if (!trainPayload.trainNumber || !trainPayload.name || trainPayload.runsOn.length === 0) {
    throw new ApiError(400, "trainNumber, name, and runsOn are required.");
  }

  const train = await Train.create(trainPayload);

  res.status(201).json({
    success: true,
    message: "Train created successfully.",
    data: {
      train,
    },
  });
});

export const updateTrain = asyncHandler(async (req, res) => {
  const trainPayload = normalizeTrainPayload(req.body);
  const train = await Train.findByIdAndUpdate(req.params.id, trainPayload, {
    new: true,
    runValidators: true,
  });

  if (!train) {
    throw new ApiError(404, "Train not found.");
  }

  res.json({
    success: true,
    message: "Train updated successfully.",
    data: {
      train,
    },
  });
});

export const deleteTrain = asyncHandler(async (req, res) => {
  const train = await Train.findByIdAndDelete(req.params.id);

  if (!train) {
    throw new ApiError(404, "Train not found.");
  }

  res.json({
    success: true,
    message: "Train deleted successfully.",
  });
});
