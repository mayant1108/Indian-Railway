import { SearchX, SlidersHorizontal } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SearchForm } from "../components/trains/SearchForm.jsx";
import { TrainCard } from "../components/trains/TrainCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Loader } from "../components/ui/Loader.jsx";
import { useAlerts } from "../context/AlertContext.jsx";
import { api, getErrorMessage } from "../lib/api.js";

const getLowestAvailableFare = (train) => {
  const fares = train.classes
    .filter((coachClass) => coachClass.isAvailable)
    .map((coachClass) => coachClass.farePerPassenger);
  return fares.length ? Math.min(...fares) : Number.MAX_SAFE_INTEGER;
};

export const TrainListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addAlert } = useAlerts();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trains, setTrains] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("departure");
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [maxFare, setMaxFare] = useState("");
  const deferredSearchText = useDeferredValue(searchText);

  const source = searchParams.get("source") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";

  useEffect(() => {
    const loadStations = async () => {
      try {
        const response = await api.get("/trains/stations");
        setStations(response.data.data.stations);
      } catch {
        setStations([]);
      }
    };

    loadStations();
  }, []);

  useEffect(() => {
    if (!source || !destination || !date) {
      return;
    }

    const loadTrains = async () => {
      setLoading(true);

      try {
        const response = await api.get("/trains/search", {
          params: {
            source,
            destination,
            date,
          },
        });

        setTrains(response.data.data.trains);
      } catch (error) {
        setTrains([]);
        addAlert({
          type: "error",
          title: "Search failed",
          message: getErrorMessage(error),
        });
      } finally {
        setLoading(false);
      }
    };

    loadTrains();
  }, [source, destination, date]);

  const handleSearch = ({ source: nextSource, destination: nextDestination, date: nextDate }) => {
    const params = new URLSearchParams({
      source: nextSource,
      destination: nextDestination,
      date: nextDate,
    });
    navigate(`/trains?${params.toString()}`);
  };

  if (!source || !destination || !date) {
    return (
      <EmptyState
        title="Start with a route search"
        description="Pick your source, destination, and travel date to see matching trains and class availability."
        action={
          <Link to="/" className="primary-button">
            Go to Home
          </Link>
        }
      />
    );
  }

  let filteredTrains = trains.filter((train) => {
    const trainMatchesText = `${train.trainNumber} ${train.name}`
      .toLowerCase()
      .includes(deferredSearchText.toLowerCase());
    const classMatches =
      classFilter === "ALL" ||
      train.classes.some(
        (coachClass) =>
          coachClass.code === classFilter && (!onlyAvailable || coachClass.isAvailable)
      );
    const fareMatches = !maxFare || getLowestAvailableFare(train) <= Number(maxFare);
    const availabilityMatches =
      !onlyAvailable || train.classes.some((coachClass) => coachClass.isAvailable);

    return trainMatchesText && classMatches && fareMatches && availabilityMatches;
  });

  filteredTrains = [...filteredTrains].sort((left, right) => {
    if (sortBy === "fare") {
      return getLowestAvailableFare(left) - getLowestAvailableFare(right);
    }

    if (sortBy === "duration") {
      return left.segment.durationMinutes - right.segment.durationMinutes;
    }

    return left.segment.departureTime.localeCompare(right.segment.departureTime);
  });

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="animate-fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">
            Results
          </p>
          <h1 className="section-title mt-2">
            {source} to {destination}
          </h1>
          <p className="section-copy mt-3">
            Compare classes, filter by availability, and jump straight into seat selection for{" "}
            <span className="font-semibold text-brand-ink">{date}</span>.
          </p>
        </div>
        <SearchForm
          compact
          stations={stations}
          initialValues={{ source, destination, date }}
          onSearch={handleSearch}
        />
      </section>

      <section className="glass-card flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {loading ? "Loading trains..." : `${filteredTrains.length} trains matched your filters.`}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <input
            className="field-input"
            placeholder="Train name or number"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <select
            className="field-input"
            value={classFilter}
            onChange={(event) => setClassFilter(event.target.value)}
          >
            <option value="ALL">All classes</option>
            <option value="SL">Sleeper</option>
            <option value="3A">3A</option>
            <option value="2A">2A</option>
            <option value="1A">1A</option>
            <option value="CC">CC</option>
          </select>
          <select className="field-input" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="departure">Sort by departure</option>
            <option value="duration">Sort by duration</option>
            <option value="fare">Sort by fare</option>
          </select>
          <input
            type="number"
            min="0"
            className="field-input"
            placeholder="Max fare"
            value={maxFare}
            onChange={(event) => setMaxFare(event.target.value)}
          />
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(event) => setOnlyAvailable(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
            />
            Show only available
          </label>
        </div>
      </section>

      {loading ? (
        <div className="glass-card py-20">
          <Loader label="Finding the best trains for your route" size="lg" />
        </div>
      ) : filteredTrains.length ? (
        <div className="space-y-5">
          {filteredTrains.map((train) => (
            <TrainCard key={train._id} train={train} search={{ source, destination, date }} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No trains matched those filters"
          description="Try another class, remove the fare limit, or search a different route and date."
          action={
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-mist px-4 py-2 text-sm font-semibold text-brand-navy">
              <SearchX className="h-4 w-4" />
              Nothing available right now
            </div>
          }
        />
      )}
    </div>
  );
};
