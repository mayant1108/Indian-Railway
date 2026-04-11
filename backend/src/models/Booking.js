import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
    },
    gender: {
      type: String,
      required: true,
      trim: true,
    },
    berthPreference: {
      type: String,
      default: "No preference",
    },
    seatNumber: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    pnr: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    trainNumber: {
      type: String,
      required: true,
    },
    trainName: {
      type: String,
      required: true,
    },
    journeyDate: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    selectedClass: {
      type: String,
      required: true,
    },
    passengers: {
      type: [passengerSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one passenger is required.",
      },
    },
    seatNumbers: {
      type: [String],
      required: true,
    },
    seatAllocationKeys: {
      type: [String],
      required: true,
    },
    totalFare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    payment: {
      provider: {
        type: String,
        default: "dummy",
      },
      status: {
        type: String,
        default: "paid",
      },
      amount: Number,
      orderId: String,
      transactionId: String,
      paidAt: Date,
    },
    pricingBreakdown: {
      baseFare: Number,
      surgeMultiplier: Number,
      convenienceFee: Number,
      serviceFee: Number,
    },
    contact: {
      email: String,
      phone: String,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index(
  {
    user: 1,
    createdAt: -1,
  },
  {
    name: "user_booking_history_idx",
  }
);

bookingSchema.index(
  {
    seatAllocationKeys: 1,
  },
  {
    unique: true,
    name: "unique_seat_allocation_key_idx",
  }
);

bookingSchema.index(
  {
    train: 1,
    journeyDate: 1,
    selectedClass: 1,
    status: 1,
  },
  {
    name: "journey_class_status_idx",
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);
