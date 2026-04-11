import {
  CalendarClock,
  CreditCard,
  ShieldCheck,
  Sparkles,
  TicketCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchForm } from "../components/trains/SearchForm.jsx";
import { api } from "../lib/api.js";

const featureCards = [
  {
    icon: Sparkles,
    title: "Modern search flow",
    description: "Fast route lookup with elegant filters, pricing cards, and real seat maps.",
  },
  {
    icon: TicketCheck,
    title: "Real booking pipeline",
    description: "JWT auth, protected booking APIs, booking history, email confirmation, and PNR creation.",
  },
  {
    icon: CreditCard,
    title: "Payment-ready checkout",
    description: "Dummy payments out of the box with optional Razorpay test mode support.",
  },
  {
    icon: ShieldCheck,
    title: "Admin control center",
    description: "Manage train inventory, update routes, and keep schedules current from one place.",
  },
];

const popularRoutes = [
  ["Mumbai Central", "New Delhi"],
  ["New Delhi", "Varanasi Jn"],
  ["Howrah Jn", "Mumbai CSMT"],
  ["Chennai Egmore", "Tirunelveli"],
];

const getSuggestedDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().slice(0, 10);
};

export const HomePage = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);

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

  const handleSearch = ({ source, destination, date }) => {
    const params = new URLSearchParams({ source, destination, date });
    navigate(`/trains?${params.toString()}`);
  };

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="animate-fade-up rounded-[36px] bg-brand-navy px-6 py-8 text-white shadow-soft sm:px-8 sm:py-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
            <CalendarClock className="h-4 w-4" />
            Faster train booking for every route
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Book railway tickets with seat-level visibility and a smoother IRCTC-style flow.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
            Search by route and date, compare classes instantly, select seats visually, and
            manage bookings from one modern dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {popularRoutes.map(([source, destination]) => (
              <button
                key={`${source}-${destination}`}
                type="button"
                onClick={() =>
                  handleSearch({
                    source,
                    destination,
                    date: getSuggestedDate(),
                  })
                }
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {source} to {destination}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card flex flex-col justify-between gap-6 p-6 sm:p-7">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">
              Search Tickets
            </p>
            <h2 className="mt-2 font-display text-3xl text-brand-ink">Plan your next journey</h2>
          </div>
          <SearchForm
            compact
            stations={stations}
            initialValues={{
              source: "Mumbai Central",
              destination: "New Delhi",
              date: getSuggestedDate(),
            }}
            onSearch={handleSearch}
          />
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {featureCards.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              className="glass-card animate-fade-up p-6"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-mist text-brand-blue">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-brand-ink">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
};
