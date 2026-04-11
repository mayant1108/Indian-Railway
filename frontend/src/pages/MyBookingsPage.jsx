import { Calendar, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Loader } from "../components/ui/Loader.jsx";
import { useAlerts } from "../context/AlertContext.jsx";
import { api, getErrorMessage } from "../lib/api.js";
import {
  formatCurrency,
  formatDateLong,
  formatPassengerSummary,
} from "../lib/formatters.js";

export const MyBookingsPage = () => {
  const { addAlert } = useAlerts();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);

      try {
        const response = await api.get("/booking/user");
        setBookings(response.data.data.bookings);
      } catch (error) {
        setBookings([]);
        addAlert({
          type: "error",
          title: "Unable to load bookings",
          message: getErrorMessage(error),
        });
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  if (loading) {
    return (
      <div className="glass-card py-20">
        <Loader label="Loading your booking history" size="lg" />
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <EmptyState
        title="No bookings yet"
        description="Once you reserve your first trip, your tickets and PNR details will appear here."
        action={
          <Link to="/" className="primary-button">
            Search trains
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">
          Booking History
        </p>
        <h1 className="section-title mt-2">My tickets</h1>
      </div>

      <div className="space-y-5">
        {bookings.map((booking) => (
          <article key={booking._id} className="glass-card overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">
                      PNR {booking.pnr}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        booking.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-bold text-brand-ink">
                    {booking.trainName} ({booking.trainNumber})
                  </h2>
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="rounded-full bg-brand-mist px-4 py-2 font-semibold text-brand-navy">
                    {booking.selectedClass}
                  </div>
                  <div className="rounded-full bg-white px-4 py-2 font-semibold text-slate-600">
                    {formatCurrency(booking.totalFare)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 px-6 py-5 lg:grid-cols-3">
              <div className="rounded-[24px] bg-brand-mist/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Journey
                </p>
                <p className="mt-2 text-lg font-bold text-brand-ink">
                  {booking.source} to {booking.destination}
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4 text-brand-blue" />
                  {formatDateLong(booking.journeyDate)}
                </p>
              </div>

              <div className="rounded-[24px] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Passengers
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {formatPassengerSummary(booking.passengers)}
                </p>
              </div>

              <div className="rounded-[24px] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Payment
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Ticket className="h-4 w-4 text-brand-blue" />
                  {booking.payment.provider} • {booking.payment.status}
                </p>
                <p className="mt-2 text-sm text-slate-500">Seats: {booking.seatNumbers.join(", ")}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
