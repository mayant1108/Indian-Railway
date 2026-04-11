import { ArrowRightLeft, CalendarDays, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";

const today = new Date().toISOString().slice(0, 10);

export const SearchForm = ({
  initialValues = { source: "", destination: "", date: today },
  onSearch,
  stations = [],
  compact = false,
}) => {
  const [formState, setFormState] = useState(initialValues);

  useEffect(() => {
    setFormState(initialValues);
  }, [initialValues.source, initialValues.destination, initialValues.date]);

  const updateField = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const swapStations = () => {
    setFormState((current) => ({
      ...current,
      source: current.destination,
      destination: current.source,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch({
      source: formState.source.trim(),
      destination: formState.destination.trim(),
      date: formState.date,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`glass-card animate-fade-up ${
        compact ? "p-4 sm:p-5" : "p-6 sm:p-7"
      }`}
    >
      <div className={`grid gap-4 ${compact ? "lg:grid-cols-[1fr_64px_1fr_220px]" : "lg:grid-cols-[1fr_76px_1fr_220px]"}`}>
        <div>
          <label className="field-label" htmlFor="source">
            Origin
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-brand-blue" />
            <input
              id="source"
              list="station-list"
              className="field-input pl-12"
              placeholder="Mumbai Central"
              value={formState.source}
              onChange={(event) => updateField("source", event.target.value)}
            />
          </div>
        </div>

        <div className="flex items-end justify-center">
          <button
            type="button"
            onClick={swapStations}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-brand-mist text-brand-blue transition hover:-translate-y-0.5 hover:border-brand-blue/30"
            aria-label="Swap source and destination"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </button>
        </div>

        <div>
          <label className="field-label" htmlFor="destination">
            Destination
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-brand-blue" />
            <input
              id="destination"
              list="station-list"
              className="field-input pl-12"
              placeholder="New Delhi"
              value={formState.destination}
              onChange={(event) => updateField("destination", event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="journey-date">
            Journey Date
          </label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-brand-blue" />
            <input
              id="journey-date"
              type="date"
              min={today}
              className="field-input pl-12"
              value={formState.date}
              onChange={(event) => updateField("date", event.target.value)}
            />
          </div>
        </div>
      </div>

      <datalist id="station-list">
        {stations.map((station) => (
          <option key={station} value={station} />
        ))}
      </datalist>

      <div className="mt-5 flex justify-end">
        <button type="submit" className="primary-button gap-2">
          <Search className="h-4 w-4" />
          Search Trains
        </button>
      </div>
    </form>
  );
};
