const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const getWeekdayName = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  return weekdayNames[date.getDay()];
};

export const daysUntilJourney = (dateString) => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const journeyDate = new Date(`${dateString}T00:00:00`);
  const diffMs = journeyDate.getTime() - startOfToday.getTime();

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const isValidDateString = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");

  if (!match) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

export const parseTimeToMinutes = (value) => {
  if (!/^\d{2}:\d{2}$/.test(value ?? "")) {
    return 0;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

export const calculateDurationBetweenStops = (sourceStop, destinationStop) => {
  const sourceMinutes =
    sourceStop.dayOffset * 24 * 60 + parseTimeToMinutes(sourceStop.departureTime);
  const destinationMinutes =
    destinationStop.dayOffset * 24 * 60 +
    parseTimeToMinutes(destinationStop.arrivalTime);

  return destinationMinutes - sourceMinutes;
};
