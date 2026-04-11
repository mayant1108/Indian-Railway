import { getMailer } from "../config/mailer.js";

export const sendBookingConfirmationEmail = async ({ booking, user }) => {
  const recipient = booking.contact?.email || user?.email;

  if (!recipient) {
    return null;
  }

  const transporter = await getMailer();
  const passengerSummary = booking.passengers
    .map(
      (passenger) =>
        `<li>${passenger.name} (${passenger.age}/${passenger.gender}) - ${passenger.seatNumber}</li>`
    )
    .join("");

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: recipient,
    subject: `Booking Confirmed - PNR ${booking.pnr}`,
    text: `Your booking for ${booking.trainName} (${booking.trainNumber}) on ${booking.journeyDate} is confirmed. PNR: ${booking.pnr}.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #0f172a;">
        <h2 style="margin-bottom: 8px;">Booking Confirmed</h2>
        <p style="margin-top: 0;">Your railway ticket has been booked successfully.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;">
          <p><strong>PNR:</strong> ${booking.pnr}</p>
          <p><strong>Train:</strong> ${booking.trainName} (${booking.trainNumber})</p>
          <p><strong>Journey:</strong> ${booking.source} to ${booking.destination}</p>
          <p><strong>Date:</strong> ${booking.journeyDate}</p>
          <p><strong>Class:</strong> ${booking.selectedClass}</p>
          <p><strong>Total Fare:</strong> INR ${booking.totalFare}</p>
          <ul>${passengerSummary}</ul>
        </div>
      </div>
    `,
  });
};
