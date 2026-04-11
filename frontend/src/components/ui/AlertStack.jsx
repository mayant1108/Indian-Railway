import { AlertCircle, CheckCircle2, Info, X, ShieldAlert } from "lucide-react";
import { useAlerts } from "../../context/AlertContext.jsx";

const alertStyles = {
  success: {
    icon: CheckCircle2,
    container: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  error: {
    icon: AlertCircle,
    container: "border-rose-200 bg-rose-50 text-rose-900",
  },
  warning: {
    icon: ShieldAlert,
    container: "border-amber-200 bg-amber-50 text-amber-900",
  },
  info: {
    icon: Info,
    container: "border-sky-200 bg-sky-50 text-sky-900",
  },
};

export const AlertStack = () => {
  const { alerts, removeAlert } = useAlerts();

  if (!alerts.length) {
    return null;
  }

  return (
    <div className="fixed right-4 top-20 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {alerts.map((alert) => {
        const styles = alertStyles[alert.type] || alertStyles.info;
        const Icon = styles.icon;

        return (
          <div
            key={alert.id}
            className={`animate-fade-up rounded-3xl border px-4 py-4 shadow-soft ${styles.container}`}
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                {alert.title ? <p className="font-semibold">{alert.title}</p> : null}
                <p className="text-sm">{alert.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeAlert(alert.id)}
                className="rounded-full p-1 transition hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
