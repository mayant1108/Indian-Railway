import { ArrowRight, Clock3, MapPinned, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatCurrency, formatDuration } from "../../lib/formatters.js";

export const TrainCard = ({ train, search }) => {
  const navigate = useNavigate();

  const openSeatSelection = (classCode) => {
    const params = new URLSearchParams({
      source: search.source,
      destination: search.destination,
      date: search.date,
      classCode,
      passengers: "1",
    });

    navigate(`/trains/${train._id}/seats?${params.toString()}`);
  };

  return (
    <article className="glass-card overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">
                {train.trainNumber}
              </span>
              <h3 className="text-2xl font-bold text-brand-ink">{train.name}</h3>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-brand-blue" />
                {formatDuration(train.segment.durationMinutes)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-brand-blue" />
                {train.segment.distanceKm} km
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-blue" />
                {train.amenities.slice(0, 3).join(" • ")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-[24px] bg-brand-mist/70 p-4 text-center sm:min-w-[320px]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Depart
              </p>
              <p className="mt-1 text-xl font-bold text-brand-ink">{train.segment.departureTime}</p>
              <p className="text-sm text-slate-500">{train.segment.source}</p>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-brand-blue" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Arrive
              </p>
              <p className="mt-1 text-xl font-bold text-brand-ink">{train.segment.arrivalTime}</p>
              <p className="text-sm text-slate-500">{train.segment.destination}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 sm:px-7 lg:grid-cols-3">
        {train.classes.map((coachClass) => (
          <button
            key={coachClass.code}
            type="button"
            onClick={() => openSeatSelection(coachClass.code)}
            className={`rounded-[26px] border p-4 text-left transition ${
              coachClass.isAvailable
                ? "border-brand-blue/20 bg-white hover:-translate-y-0.5 hover:border-brand-blue/40 hover:bg-brand-mist/60"
                : "border-slate-200 bg-slate-50 opacity-70"
            }`}
            disabled={!coachClass.isAvailable}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {coachClass.code}
                </p>
                <h4 className="mt-1 text-lg font-bold text-brand-ink">{coachClass.name}</h4>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  coachClass.isAvailable
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {coachClass.isAvailable ? `${coachClass.seatsAvailable} seats left` : "Waitlist likely"}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-2xl font-bold text-brand-navy">
                {formatCurrency(coachClass.farePerPassenger)}
              </p>
              <span className="text-sm font-semibold text-brand-blue">
                {coachClass.isAvailable ? "View seats" : "Sold out"}
              </span>
            </div>
          </button>
        ))}
      </div>
    </article>
  );
};
