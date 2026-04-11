import { Pencil, PlusCircle, RefreshCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Loader } from "../components/ui/Loader.jsx";
import { useAlerts } from "../context/AlertContext.jsx";
import { api, getErrorMessage } from "../lib/api.js";

const defaultForm = {
  id: "",
  trainNumber: "",
  name: "",
  runsOn: "Mon,Tue,Wed,Thu,Fri,Sat,Sun",
  amenities: "WiFi,Charging Ports,Meals",
  routeStopsText: JSON.stringify(
    [
      {
        station: "Source Station",
        arrivalTime: "08:00",
        departureTime: "08:10",
        dayOffset: 0,
        distanceFromOrigin: 0,
      },
      {
        station: "Destination Station",
        arrivalTime: "14:30",
        departureTime: "14:40",
        dayOffset: 0,
        distanceFromOrigin: 420,
      },
    ],
    null,
    2
  ),
  classesText: JSON.stringify(
    [
      {
        code: "3A",
        name: "AC 3 Tier",
        coachCount: 4,
        seatsPerCoach: 64,
        baseFare: 1850,
      },
    ],
    null,
    2
  ),
};

const splitCsv = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const AdminPage = () => {
  const { addAlert } = useAlerts();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trains, setTrains] = useState([]);
  const [formState, setFormState] = useState(defaultForm);

  const loadTrains = async () => {
    setLoading(true);

    try {
      const response = await api.get("/admin/trains");
      setTrains(response.data.data.trains);
    } catch (error) {
      setTrains([]);
      addAlert({
        type: "error",
        title: "Unable to load admin inventory",
        message: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrains();
  }, []);

  const updateField = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormState(defaultForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        trainNumber: formState.trainNumber,
        name: formState.name,
        runsOn: splitCsv(formState.runsOn),
        amenities: splitCsv(formState.amenities),
        routeStops: JSON.parse(formState.routeStopsText),
        classes: JSON.parse(formState.classesText),
      };

      if (formState.id) {
        await api.put(`/admin/trains/${formState.id}`, payload);
      } else {
        await api.post("/admin/trains", payload);
      }

      addAlert({
        type: "success",
        title: formState.id ? "Train updated" : "Train created",
        message: "Inventory has been saved successfully.",
      });
      resetForm();
      await loadTrains();
    } catch (error) {
      addAlert({
        type: "error",
        title: "Unable to save train",
        message: getErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (train) => {
    setFormState({
      id: train._id,
      trainNumber: train.trainNumber,
      name: train.name,
      runsOn: train.runsOn.join(","),
      amenities: train.amenities.join(","),
      routeStopsText: JSON.stringify(train.routeStops, null, 2),
      classesText: JSON.stringify(train.classes, null, 2),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (trainId) => {
    const confirmed = window.confirm("Delete this train from the inventory?");

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/admin/trains/${trainId}`);
      addAlert({
        type: "success",
        title: "Train deleted",
        message: "The train has been removed from inventory.",
      });
      await loadTrains();
    } catch (error) {
      addAlert({
        type: "error",
        title: "Delete failed",
        message: getErrorMessage(error),
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">
          Admin Panel
        </p>
        <h1 className="section-title mt-2">Manage train inventory</h1>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">
              {formState.id ? "Edit train" : "Add new train"}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-brand-ink">
              {formState.id ? "Update schedule" : "Create schedule"}
            </h2>
          </div>
          <button type="button" onClick={resetForm} className="secondary-button gap-2">
            <RefreshCcw className="h-4 w-4" />
            Reset form
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Train number</label>
            <input
              className="field-input"
              value={formState.trainNumber}
              onChange={(event) => updateField("trainNumber", event.target.value)}
              placeholder="12952"
            />
          </div>
          <div>
            <label className="field-label">Train name</label>
            <input
              className="field-input"
              value={formState.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Mumbai Rajdhani Express"
            />
          </div>
          <div>
            <label className="field-label">Runs on</label>
            <input
              className="field-input"
              value={formState.runsOn}
              onChange={(event) => updateField("runsOn", event.target.value)}
              placeholder="Mon,Tue,Wed"
            />
          </div>
          <div>
            <label className="field-label">Amenities</label>
            <input
              className="field-input"
              value={formState.amenities}
              onChange={(event) => updateField("amenities", event.target.value)}
              placeholder="WiFi,Charging Ports"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="field-label">Route stops JSON</label>
            <textarea
              rows="14"
              className="field-input min-h-[320px] font-mono text-xs"
              value={formState.routeStopsText}
              onChange={(event) => updateField("routeStopsText", event.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Classes JSON</label>
            <textarea
              rows="14"
              className="field-input min-h-[320px] font-mono text-xs"
              value={formState.classesText}
              onChange={(event) => updateField("classesText", event.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="primary-button mt-6 gap-2" disabled={submitting}>
          <PlusCircle className="h-4 w-4" />
          {submitting ? "Saving..." : formState.id ? "Update train" : "Create train"}
        </button>
      </form>

      {loading ? (
        <div className="glass-card py-20">
          <Loader label="Loading inventory" size="lg" />
        </div>
      ) : (
        <div className="grid gap-5">
          {trains.map((train) => (
            <article key={train._id} className="glass-card p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">
                      {train.trainNumber}
                    </span>
                    <h3 className="text-2xl font-bold text-brand-ink">{train.name}</h3>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {train.source} to {train.destination} • {train.routeStops.length} stops •{" "}
                    {train.classes.map((coachClass) => coachClass.code).join(", ")}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">Runs on: {train.runsOn.join(", ")}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(train)}
                    className="secondary-button gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(train._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
