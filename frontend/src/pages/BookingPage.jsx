import { CreditCard, Mail, Phone, ShieldCheck, TicketCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Loader } from "../components/ui/Loader.jsx";
import { useAlerts } from "../context/AlertContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api, getErrorMessage } from "../lib/api.js";
import { formatCurrency, formatDateLong } from "../lib/formatters.js";

const createPassenger = (seatNumber) => ({
  name: "",
  age: "",
  gender: "Male",
  berthPreference: "No preference",
  seatNumber,
});

const openRazorpayCheckout = ({ order, trainName, user, contact }) =>
  new Promise((resolve, reject) => {
    if (!window.Razorpay || order.provider !== "razorpay") {
      reject(new Error("Razorpay checkout is unavailable in this environment."));
      return;
    }

    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: Math.round(order.amount * 100),
      currency: order.currency,
      name: "RailwayHub",
      description: `${trainName} booking`,
      order_id: order.orderId,
      prefill: {
        name: user?.name || "",
        email: contact.email || user?.email || "",
        contact: contact.phone || user?.phone || "",
      },
      theme: {
        color: "#0f4c81",
      },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment was cancelled.")),
      },
    });

    razorpay.open();
  });

export const BookingPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addAlert } = useAlerts();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("dummy");
  const [contact, setContact] = useState({
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [passengers, setPassengers] = useState([]);

  const source = searchParams.get("source") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";
  const classCode = searchParams.get("classCode") || "";
  const selectedSeats = (searchParams.get("seats") || "")
    .split(",")
    .map((seat) => seat.trim())
    .filter(Boolean);

  useEffect(() => {
    setContact({
      email: user?.email || "",
      phone: user?.phone || "",
    });
  }, [user?.email, user?.phone]);

  useEffect(() => {
    setPassengers((currentPassengers) =>
      selectedSeats.map((seat, index) => ({
        ...(currentPassengers[index] || createPassenger(seat)),
        seatNumber: seat,
      }))
    );
  }, [selectedSeats.join(",")]);

  useEffect(() => {
    if (!id || !source || !destination || !date || !classCode) {
      return;
    }

    const loadBookingDetails = async () => {
      setLoading(true);

      try {
        const response = await api.get(`/trains/${id}`, {
          params: {
            source,
            destination,
            journeyDate: date,
            classCode,
          },
        });

        setDetails(response.data.data);
      } catch (error) {
        setDetails(null);
        addAlert({
          type: "error",
          title: "Unable to load booking details",
          message: getErrorMessage(error),
        });
      } finally {
        setLoading(false);
      }
    };

    loadBookingDetails();
  }, [id, source, destination, date, classCode]);

  const updatePassenger = (index, field, value) => {
    setPassengers((currentPassengers) =>
      currentPassengers.map((passenger, passengerIndex) =>
        passengerIndex === index ? { ...passenger, [field]: value } : passenger
      )
    );
  };

  const validatePassengers = () => {
    const hasEmptyFields = passengers.some(
      (passenger) =>
        !passenger.name.trim() || !passenger.age || !passenger.gender.trim()
    );

    if (hasEmptyFields) {
      throw new Error("Please complete each passenger's name, age, and gender.");
    }
  };

  const finalizeBooking = async (paymentPayload = null, methodOverride = paymentMethod) => {
    const response = await api.post("/booking/create", {
      trainId: id,
      journeyDate: date,
      source,
      destination,
      classCode,
      passengers,
      selectedSeatNumbers: selectedSeats,
      paymentMethod: methodOverride,
      paymentPayload,
      contact,
    });

    return response.data.data.booking;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedSeats.length) {
      addAlert({
        type: "warning",
        title: "Seats missing",
        message: "Please return to the seat map and choose seats before booking.",
      });
      return;
    }

    try {
      validatePassengers();
      setSubmitting(true);

      let booking = null;

      if (paymentMethod === "razorpay") {
        const orderResponse = await api.post("/booking/payment-order", {
          trainId: id,
          journeyDate: date,
          source,
          destination,
          classCode,
          passengerCount: selectedSeats.length,
        });
        const order = orderResponse.data.data.paymentOrder;

        if (order.provider !== "razorpay") {
          addAlert({
            type: "info",
            title: "Dummy payment in use",
            message: "Razorpay keys are not configured, so we completed the booking in test mode.",
          });
          booking = await finalizeBooking(null, "dummy");
        } else {
          const paymentPayload = await openRazorpayCheckout({
            order,
            trainName: details?.train?.name || "Railway booking",
            user,
            contact,
          });

          booking = await finalizeBooking(paymentPayload, "razorpay");
        }
      } else {
        booking = await finalizeBooking();
      }

      setConfirmedBooking(booking);
      addAlert({
        type: "success",
        title: "Booking confirmed",
        message: `Your PNR is ${booking.pnr}.`,
      });
    } catch (error) {
      addAlert({
        type: "error",
        title: "Booking failed",
        message: getErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedSeats.length) {
    return (
      <EmptyState
        title="Seat selection is required"
        description="Choose your seats first, then return here to enter passenger details and complete the booking."
        action={
          <Link
            to={`/trains/${id}/seats?${new URLSearchParams({ source, destination, date, classCode, passengers: "1" }).toString()}`}
            className="primary-button"
          >
            Back to seats
          </Link>
        }
      />
    );
  }

  if (loading) {
    return (
      <div className="glass-card py-20">
        <Loader label="Preparing your booking review" size="lg" />
      </div>
    );
  }

  if (!details) {
    return (
      <EmptyState
        title="Booking details could not be loaded"
        description="This route may no longer be available, or the seat/class selection is out of date."
        action={
          <Link to="/" className="primary-button">
            Search again
          </Link>
        }
      />
    );
  }

  if (confirmedBooking) {
    return (
      <div className="glass-card mx-auto max-w-3xl p-8 sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <TicketCheck className="h-10 w-10" />
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
            Booking Confirmed
          </p>
          <h1 className="section-title mt-3">Your journey is locked in</h1>
          <p className="section-copy mt-4">
            PNR <span className="font-bold text-brand-ink">{confirmedBooking.pnr}</span> has been
            generated for {confirmedBooking.trainName}.
          </p>
        </div>
        <div className="mt-8 grid gap-4 rounded-[30px] bg-brand-mist/60 p-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Route</p>
            <p className="mt-2 text-lg font-bold text-brand-ink">
              {confirmedBooking.source} to {confirmedBooking.destination}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Travel date</p>
            <p className="mt-2 text-lg font-bold text-brand-ink">{formatDateLong(confirmedBooking.journeyDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Seats</p>
            <p className="mt-2 text-lg font-bold text-brand-ink">{confirmedBooking.seatNumbers.join(", ")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total fare</p>
            <p className="mt-2 text-lg font-bold text-brand-ink">{formatCurrency(confirmedBooking.totalFare)}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/my-bookings" className="primary-button">
            View my bookings
          </Link>
          <Link to="/" className="secondary-button">
            Book another train
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">
              Passenger Details
            </p>
            <h1 className="section-title mt-2">Complete your booking</h1>
          </div>
          <div className="rounded-full bg-brand-mist px-4 py-2 text-sm font-semibold text-brand-navy">
            {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {passengers.map((passenger, index) => (
            <section key={passenger.seatNumber} className="rounded-[28px] border border-slate-200 bg-white/90 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Passenger {index + 1}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-brand-ink">{passenger.seatNumber}</h2>
                </div>
                <div className="rounded-full bg-brand-mist px-3 py-1 text-sm font-semibold text-brand-blue">
                  {details.selectedClass.code}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">Full name</label>
                  <input
                    className="field-input"
                    value={passenger.name}
                    onChange={(event) => updatePassenger(index, "name", event.target.value)}
                    placeholder="Passenger name"
                  />
                </div>
                <div>
                  <label className="field-label">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    className="field-input"
                    value={passenger.age}
                    onChange={(event) => updatePassenger(index, "age", event.target.value)}
                    placeholder="28"
                  />
                </div>
                <div>
                  <label className="field-label">Gender</label>
                  <select
                    className="field-input"
                    value={passenger.gender}
                    onChange={(event) => updatePassenger(index, "gender", event.target.value)}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Berth preference</label>
                  <select
                    className="field-input"
                    value={passenger.berthPreference}
                    onChange={(event) => updatePassenger(index, "berthPreference", event.target.value)}
                  >
                    <option>No preference</option>
                    <option>Lower</option>
                    <option>Middle</option>
                    <option>Upper</option>
                    <option>Side Lower</option>
                    <option>Side Upper</option>
                    <option>Window</option>
                    <option>Aisle</option>
                  </select>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white/90 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">
            Contact & Payment
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-brand-blue" />
                <input
                  type="email"
                  className="field-input pl-12"
                  value={contact.email}
                  onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="field-label">Phone number</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-brand-blue" />
                <input
                  className="field-input pl-12"
                  value={contact.phone}
                  onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="9876543210"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("dummy")}
              className={`rounded-[24px] border p-4 text-left transition ${
                paymentMethod === "dummy" ? "border-brand-navy bg-brand-navy text-white" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Dummy payment</p>
                  <p className={`text-sm ${paymentMethod === "dummy" ? "text-white/70" : "text-slate-500"}`}>
                    Instant test-mode confirmation
                  </p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("razorpay")}
              className={`rounded-[24px] border p-4 text-left transition ${
                paymentMethod === "razorpay" ? "border-brand-navy bg-brand-navy text-white" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Razorpay test mode</p>
                  <p className={`text-sm ${paymentMethod === "razorpay" ? "text-white/70" : "text-slate-500"}`}>
                    Uses Razorpay if keys are configured
                  </p>
                </div>
              </div>
            </button>
          </div>
        </section>

        <button type="submit" className="primary-button mt-8 w-full" disabled={submitting}>
          {submitting ? "Processing booking..." : "Confirm booking"}
        </button>
      </form>

      <aside className="glass-card h-fit p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">
          Fare Summary
        </p>
        <div className="mt-5 rounded-[28px] bg-brand-mist/60 p-5">
          <p className="text-sm text-slate-500">{details.train.trainNumber}</p>
          <h2 className="mt-1 text-2xl font-bold text-brand-ink">{details.train.name}</h2>
          <p className="mt-3 text-sm text-slate-600">
            {details.segment.source} to {details.segment.destination}
          </p>
          <p className="mt-1 text-sm text-slate-600">{formatDateLong(date)}</p>
        </div>

        <div className="mt-6 space-y-4 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Class</span>
            <span className="font-semibold text-brand-ink">{details.selectedClass.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Seats</span>
            <span className="font-semibold text-brand-ink">{selectedSeats.join(", ")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Passengers</span>
            <span className="font-semibold text-brand-ink">{selectedSeats.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Base total</span>
            <span className="font-semibold text-brand-ink">
              {formatCurrency(details.pricing.farePerPassenger * selectedSeats.length)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Convenience fee</span>
            <span className="font-semibold text-brand-ink">
              {formatCurrency(details.pricing.pricingBreakdown.convenienceFee)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Service fee</span>
            <span className="font-semibold text-brand-ink">
              {formatCurrency(details.pricing.pricingBreakdown.serviceFee)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-base font-semibold text-brand-ink">Grand total</span>
            <span className="text-2xl font-bold text-brand-navy">
              {formatCurrency(
                details.pricing.farePerPassenger * selectedSeats.length +
                  details.pricing.pricingBreakdown.convenienceFee +
                  details.pricing.pricingBreakdown.serviceFee
              )}
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
};
