import { LockKeyhole, Mail, Phone, User2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAlerts } from "../context/AlertContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../lib/api.js";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
};

export const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addAlert } = useAlerts();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState(initialForm);

  const redirect = searchParams.get("redirect") || "/";

  const updateField = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login({
          email: formState.email,
          password: formState.password,
        });
      } else {
        await register(formState);
      }

      addAlert({
        type: "success",
        title: mode === "login" ? "Welcome back" : "Account created",
        message: "You're signed in and ready to book.",
      });
      navigate(redirect);
    } catch (error) {
      addAlert({
        type: "error",
        title: "Authentication failed",
        message: getErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="animate-fade-up rounded-[36px] bg-brand-navy p-8 text-white shadow-soft sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
          Passenger Access
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
          Secure login for bookings, payments, and trip history.
        </h1>
        <div className="mt-8 space-y-4 text-sm leading-6 text-white/75">
          <p>JWT-powered authentication for protected booking APIs and admin-only train management.</p>
          <p>Use the seeded demo accounts after running the backend seed script.</p>
          <div className="rounded-[28px] border border-white/15 bg-white/10 p-5">
            <p className="font-semibold text-white">Seeded accounts</p>
            <p className="mt-2">Admin: `admin@railwayhub.com` / `Admin@123`</p>
            <p>User: `user@railwayhub.com` / `User@123`</p>
          </div>
        </div>
      </section>

      <section className="glass-card p-6 sm:p-8">
        <div className="flex gap-3 rounded-full bg-brand-mist p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
              mode === "login" ? "bg-white text-brand-navy shadow" : "text-slate-600"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
              mode === "register" ? "bg-white text-brand-navy shadow" : "text-slate-600"
            }`}
          >
            Signup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {mode === "register" ? (
            <div>
              <label className="field-label">Full name</label>
              <div className="relative">
                <User2 className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-brand-blue" />
                <input
                  className="field-input pl-12"
                  value={formState.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Priya Sharma"
                />
              </div>
            </div>
          ) : null}

          <div>
            <label className="field-label">Email address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-brand-blue" />
              <input
                type="email"
                className="field-input pl-12"
                value={formState.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Password</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-brand-blue" />
              <input
                type="password"
                className="field-input pl-12"
                value={formState.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>

          {mode === "register" ? (
            <div>
              <label className="field-label">Phone number</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-brand-blue" />
                <input
                  className="field-input pl-12"
                  value={formState.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="9876543210"
                />
              </div>
            </div>
          ) : null}

          <button type="submit" className="primary-button w-full" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "login" ? "Login to continue" : "Create account"}
          </button>
        </form>
      </section>
    </div>
  );
};
