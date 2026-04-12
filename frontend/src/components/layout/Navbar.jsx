import { Menu, Ticket, TrainFront, UserCircle2, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navigationLinks = [
  { to: "/", label: "Search Trains" },
  { to: "/my-bookings", label: "My Bookings", auth: true },
  { to: "/admin", label: "Admin Panel", admin: true },
];

const navLinkClassName = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? "bg-brand-mist text-brand-navy" : "text-slate-600 hover:bg-white hover:text-brand-navy"
  }`;

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const links = navigationLinks.filter((link) => {
    if (link.admin) {
      return isAdmin;
    }

    if (link.auth) {
      return isAuthenticated;
    }

    return true;
  });

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
            <TrainFront className="h-6 w-6" />

          </div>
          <div>
            <p className="font-display text-xl font-bold text-slate-900">RailwayHub</p>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">
              Smart Ticketing

            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClassName}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 rounded-full bg-teal-50 px-4 py-2">
                <UserCircle2 className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
              </div>
              <button type="button" onClick={handleLogout} className="secondary-button">
                Logout
              </button>
            </>
          ) : (
              <Link to="/auth" className="primary-button gap-2">
                <Ticket className="h-4 w-4" />
                Login / Signup
              </Link>

          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="rounded-2xl border border-slate-200 bg-white p-3 text-brand-navy lg:hidden"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navLinkClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="secondary-button mt-2 w-full"
              >
                Logout
              </button>
            ) : (
              <Link to="/auth" className="primary-button mt-2 w-full" onClick={() => setIsMenuOpen(false)}>
                Login / Signup
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};
