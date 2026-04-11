const berthPatterns = {
  SL: ["LB", "MB", "UB", "LB", "MB", "UB", "SL", "SU"],
  "3A": ["LB", "MB", "UB", "LB", "MB", "UB", "SL", "SU"],
  "2A": ["LB", "UB", "LB", "UB", "SL", "SU"],
  "1A": ["LB", "UB", "LB", "UB"],
  CC: ["W", "A", "A", "A", "W"],
};

const coachPrefixes = {
  SL: "S",
  "3A": "B",
  "2A": "A",
  "1A": "H",
  CC: "C",
};

export const getTotalSeatsForClass = (trainClass) =>
  trainClass.coachCount * trainClass.seatsPerCoach;

export const buildSeatLayout = (trainClass) => {
  const pattern = berthPatterns[trainClass.code] ?? berthPatterns.SL;
  const coachPrefix = coachPrefixes[trainClass.code] ?? "X";
  const seats = [];

  for (let coachIndex = 1; coachIndex <= trainClass.coachCount; coachIndex += 1) {
    for (
      let seatIndex = 1;
      seatIndex <= trainClass.seatsPerCoach;
      seatIndex += 1
    ) {
      const berthType = pattern[(seatIndex - 1) % pattern.length];
      const seatNumber = `${coachPrefix}${coachIndex}-${String(seatIndex).padStart(
        2,
        "0"
      )}`;

      seats.push({
        seatNumber,
        coach: `${coachPrefix}${coachIndex}`,
        berthType,
        index: seatIndex,
      });
    }
  }

  return seats;
};

export const makeSeatAllocationKey = ({
  trainId,
  journeyDate,
  classCode,
  seatNumber,
}) => `${trainId}:${journeyDate}:${classCode}:${seatNumber}`;

