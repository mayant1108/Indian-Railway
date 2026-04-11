import { Link } from "react-router-dom";

const footerLinks = [
  { to: "/", label: "Search" },
  { to: "/my-bookings", label: "Bookings" },
  { to: "/admin", label: "Admin" },
];

export const Footer = () => (
  <footer className="relative z-10 border-t border-white/70 bg-white/80 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div>
        <p className="font-display text-2xl text-brand-ink">RailwayHub</p>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Full-stack railway ticket booking with live seat availability, booking history,
          payment-ready checkout, and admin inventory control.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {footerLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-blue/30 hover:bg-brand-mist hover:text-brand-navy"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  </footer>
);
