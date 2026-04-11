export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const formatDateLong = (dateString) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));

export const formatDuration = (minutes = 0) => {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!hours) {
    return `${remainder}m`;
  }

  if (!remainder) {
    return `${hours}h`;
  }

  return `${hours}h ${remainder}m`;
};

export const formatPassengerSummary = (passengers = []) =>
  passengers.map((passenger) => `${passenger.name} (${passenger.seatNumber})`).join(", ");
