import { ArrowRight, ChevronLeft, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SeatSelection } from "../components/booking/SeatSelection.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Loader } from "../components/ui/Loader.jsx";
import { useAlerts } from "../context/AlertContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api, getErrorMessage } from "../lib/api.js";
import { formatCurrency, formatDateLong, formatDuration } from "../lib/formatters.js";

const clampPassengerCount = (value) => Math.max(1, Math.min(6, value));

export const SeatAvailabilityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addAlert } = useAlerts();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const source = searchParams.get("source") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";
  const classCode = searchParams.get("classCode") || "3A";
  const passengerCount = clampPassengerCount(Number(searchParams.get("passengers") || 1));

  useEffect(() => {
    if (!id || !source || !destination || !date) {
      return;
    }

    const loadTrainDetails = async () => {
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
        setSelectedSeats([]);
      } catch (error) {
        setDetails(null);
        addAlert({
          type: "error",
          title: "Unable to load seats",
          message: getErrorMessage(error),
        });
      } finally {
        setLoading(false);
      }
    };

    loadTrainDetails();
  }, [id, source, destination, date, classCode]);

  const updateQuery = (updates) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      nextParams.set(key, String(value));
    });

    setSearchParams(nextParams);
  };

  const handleSeatToggle = (seat) => {
    setSelectedSeats((currentSeats) => {
      if (currentSeats.includes(seat.seatNumber)) {
        return currentSeats.filter((currentSeat) => currentSeat !== seat.seatNumber);
      }

      if (currentSeats.length >= passengerCount) {
        addAlert({
          type: "warning",
          title: "Seat limit reached",
          message: `You can select up to ${passengerCount} seat${passengerCount > 1 ? "s" : ""}.`,
        });
        return currentSeats;
      }

      return [...currentSeats, seat.seatNumber];
    });
  };

  const handleContinue = () => {
    if (selectedSeats.length !== passengerCount) {
      addAlert({
        type: "warning",
        title: "Complete seat selection",
        message: `Please choose ${passengerCount} seat${passengerCount > 1 ? "s" : ""} before continuing.`,
      });
      return;
    }

    const params = new URLSearchParams({
      source,
      destination,
      date,
      classCode,
      passengers: String(passengerCount),
      seats: selectedSeats.join(","),
    });
    const target = `/booking/${id}?${params.toString()}`;

    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(target)}`);
      return;
    }

    navigate(target);
  };

  if (!source || !destination || !date) {
    return (
      <EmptyState
        title="Search details are missing"
        description="Return to the train search page and choose a route before checking seat availability."
        action={
          <Link to="/" className="primary-button">
            Search routes
          </Link>
        }
      />
    );
  }

  if (loading) {
    return (
      <div className="glass-card py-20">
        <Loader label="Loading coach layout and availability" size="lg" />
      </div>
    );
  }

  if (!details) {
    return (
      <EmptyState
        title="We couldn't load this train"
        description="The route may be unavailable for the selected date, or the train may have been removed."
        action={
          <Link
            to={`/trains?${new URLSearchParams({ source, destination, date }).toString()}`}
            className="secondary-button"
          >
            Back to train list
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to={`/trains?${new URLSearchParams({ source, destination, date }).toString()}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to train results
          </Link>
          <h1 className="section-title mt-3">{details.train.name}</h1>
          <p className="section-copy mt-2">
            {details.segment.source} to {details.segment.destination} on {formatDateLong(date)} •{" "}
            {formatDuration(details.segment.durationMinutes)}
          </p>
        </div>

        <div className="glass-card flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => updateQuery({ passengers: clampPassengerCount(passengerCount - 1) })}
            className="rounded-full border border-slate-200 p-2 text-slate-600"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Passengers</p>
            <p className="text-lg font-bold text-brand-ink">{passengerCount}</p>
          </div>
          <button
            type="button"
            onClick={() => updateQuery({ passengers: clampPassengerCount(passengerCount + 1) })}
            className="rounded-full border border-slate-200 p-2 text-slate-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-4">
        {details.availability.map((coachClass) => (
          <button
            key={coachClass.code}
            type="button"
            onClick={() => updateQuery({ classCode: coachClass.code })}
            className={`rounded-[26px] border p-5 text-left transition ${
              classCode === coachClass.code
                ? "border-brand-navy bg-brand-navy text-white"
                : "glass-card"
            }`}
          >
            <p
              className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                classCode === coachClass.code ? "text-white/70" : "text-slate-500"
              }`}
            >
              {coachClass.code}
            </p>
            <h2 className="mt-2 text-xl font-bold">{coachClass.name}</h2>
            <p className={`mt-3 text-sm ${classCode === coachClass.code ? "text-white/75" : "text-slate-500"}`}>
              {coachClass.seatsAvailable} of {coachClass.totalSeats} seats available
            </p>
            <p className="mt-4 text-2xl font-bold">{formatCurrency(coachClass.farePerPassenger)}</p>
          </button>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="glass-card p-5 sm:p-6">
          <SeatSelection
            seatMap={details.seatMap}
            selectedSeats={selectedSeats}
            maxSelectable={passengerCount}
            onToggle={handleSeatToggle}
          />
        </div>

        <aside className="glass-card h-fit p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">
            Booking Snapshot
          </p>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="rounded-[24px] bg-brand-mist/60 p-4">
              <p className="font-semibold text-brand-ink">{details.train.trainNumber}</p>
              <p className="mt-1 text-xl font-bold text-brand-ink">{details.train.name}</p>
            </div>
            <div className="flex items-center justify-between">
              <span>Route</span>
              <span className="font-semibold text-brand-ink">
                {details.segment.source} to {details.segment.destination}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Travel date</span>
              <span className="font-semibold text-brand-ink">{formatDateLong(date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Class</span>
              <span className="font-semibold text-brand-ink">{details.selectedClass.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Fare / passenger</span>
              <span className="font-semibold text-brand-ink">
                {formatCurrency(details.pricing.farePerPassenger)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimated total</span>
              <span className="text-lg font-bold text-brand-navy">
                {formatCurrency(
                  details.pricing.farePerPassenger * passengerCount +
                    details.pricing.pricingBreakdown.convenienceFee +
                    details.pricing.pricingBreakdown.serviceFee
                )}
              </span>
            </div>
          </div>

          <button type="button" onClick={handleContinue} className="primary-button mt-6 w-full gap-2">
            {isAuthenticated ? "Continue to booking" : "Login to continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </aside>
      </section>
    </div>
  );
};
