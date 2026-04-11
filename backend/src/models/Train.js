import mongoose from "mongoose";

const trainClassSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    coachCount: {
      type: Number,
      required: true,
      min: 1,
    },
    seatsPerCoach: {
      type: Number,
      required: true,
      min: 4,
    },
    baseFare: {
      type: Number,
      required: true,
      min: 50,
    },
  },
  { _id: false }
);

const routeStopSchema = new mongoose.Schema(
  {
    station: {
      type: String,
      required: true,
      trim: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    dayOffset: {
      type: Number,
      default: 0,
    },
    distanceFromOrigin: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const trainSchema = new mongoose.Schema(
  {
    trainNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    distanceKm: {
      type: Number,
      required: true,
      min: 1,
    },
    runsOn: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one operating day is required.",
      },
    },
    routeStops: {
      type: [routeStopSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 2,
        message: "At least two route stops are required.",
      },
    },
    classes: {
      type: [trainClassSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one class is required.",
      },
    },
    amenities: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Train = mongoose.model("Train", trainSchema);

