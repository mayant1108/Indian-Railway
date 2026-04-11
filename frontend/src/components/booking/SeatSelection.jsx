import { Armchair, CheckCircle2 } from "lucide-react";

const getSeatClassNames = (seat, isSelected) => {
  if (seat.status === "booked") {
    return "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400";
  }

  if (isSelected) {
    return "border-brand-navy bg-brand-navy text-white shadow-soft";
  }

  return "border-brand-blue/20 bg-white text-brand-navy hover:-translate-y-0.5 hover:border-brand-blue/40 hover:bg-brand-mist";
};

export const SeatSelection = ({
  seatMap = [],
  selectedSeats = [],
  maxSelectable = 1,
  onToggle,
}) => {
  const groupedByCoach = seatMap.reduce((accumulator, seat) => {
    if (!accumulator[seat.coach]) {
      accumulator[seat.coach] = [];
    }

    accumulator[seat.coach].push(seat);
    return accumulator;
  }, {});

  const coachEntries = Object.entries(groupedByCoach);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-mist px-4 py-2 font-semibold text-brand-navy">
          <Armchair className="h-4 w-4" />
          Select {maxSelectable} seat{maxSelectable > 1 ? "s" : ""}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-medium text-slate-600">
          <span className="h-3 w-3 rounded-full bg-white ring-2 ring-brand-blue/30" />
          Available
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-medium text-slate-600">
          <span className="h-3 w-3 rounded-full bg-brand-navy" />
          Selected
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-medium text-slate-600">
          <span className="h-3 w-3 rounded-full bg-slate-300" />
          Booked
        </span>
      </div>

      {selectedSeats.length ? (
        <div className="rounded-[22px] border border-brand-blue/20 bg-brand-mist/60 p-4">
          <p className="text-sm font-semibold text-brand-ink">Selected seats</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedSeats.map((seat) => (
              <span
                key={seat}
                className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-3 py-1 text-sm font-semibold text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                {seat}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-5">
        {coachEntries.map(([coach, seats]) => (
          <section key={coach} className="rounded-[28px] border border-slate-200 bg-white/90 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Coach
                </p>
                <h3 className="text-xl font-bold text-brand-ink">{coach}</h3>
              </div>
              <p className="text-sm text-slate-500">{seats.length} seats in this coach</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {seats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.seatNumber);

                return (
                  <button
                    key={seat.seatNumber}
                    type="button"
                    disabled={seat.status === "booked"}
                    onClick={() => onToggle(seat)}
                    className={`rounded-2xl border p-3 text-left transition ${getSeatClassNames(
                      seat,
                      isSelected
                    )}`}
                  >
                    <p className="font-bold">{seat.seatNumber}</p>
                    <p className="text-xs font-medium opacity-80">{seat.berthType}</p>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
