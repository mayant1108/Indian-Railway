import { daysUntilJourney } from "../utils/date.js";
import { getTotalSeatsForClass } from "../utils/seatUtils.js";

const minimumSegmentFactor = 0.28;

const roundFare = (value) => Math.ceil(value / 5) * 5;

export const calculatePricing = ({
  train,
  trainClass,
  segmentDistance,
  journeyDate,
  bookedSeats = 0,
  passengerCount = 1,
}) => {
  const totalSeats = getTotalSeatsForClass(trainClass);
  const occupancyRatio = totalSeats > 0 ? bookedSeats / totalSeats : 0;
  const daysToJourney = daysUntilJourney(journeyDate);
  const segmentFactor = Math.max(
    segmentDistance / train.distanceKm,
    minimumSegmentFactor
  );

  let surgeMultiplier = 1;

  if (daysToJourney <= 2) {
    surgeMultiplier += 0.18;
  } else if (daysToJourney <= 7) {
    surgeMultiplier += 0.1;
  }

  if (occupancyRatio >= 0.8) {
    surgeMultiplier += 0.15;
  } else if (occupancyRatio >= 0.6) {
    surgeMultiplier += 0.08;
  } else if (occupancyRatio >= 0.4) {
    surgeMultiplier += 0.04;
  }

  const segmentBaseFare = Math.max(
    50,
    Math.round(trainClass.baseFare * segmentFactor)
  );
  const farePerPassenger = roundFare(segmentBaseFare * surgeMultiplier);
  const subtotal = farePerPassenger * passengerCount;
  const convenienceFee = passengerCount * 20;
  const serviceFee = Math.round(subtotal * 0.02);

  return {
    farePerPassenger,
    totalFare: subtotal + convenienceFee + serviceFee,
    occupancyRatio: Number(occupancyRatio.toFixed(2)),
    pricingBreakdown: {
      baseFare: segmentBaseFare,
      surgeMultiplier: Number(surgeMultiplier.toFixed(2)),
      convenienceFee,
      serviceFee,
    },
  };
};
