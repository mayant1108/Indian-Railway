import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Train, Clock, MapPin, Star, ArrowRight, Filter, Calendar } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export const TrainListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    date: searchParams.get("date") || new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTrains();
  }, [filters.from, filters.to]);

  const fetchTrains = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/trains`, {
        params: { from: filters.from, to: filters.to }
      });
      setTrains(response.data.data);
    } catch (error) {
      console.error("Error fetching trains:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ from: filters.from, to: filters.to, date: filters.date });
    fetchTrains();
  };

  const getClassLabel = (cls) => {
    const labels = {
      sleeper: "Sleeper (SL)",
      ac3Tier: "AC 3 Tier (3A)",
      ac2Tier: "AC 2 Tier (2A)",
      acFirst: "AC First Class (1A)"
    };
    return labels[cls] || cls;
  };

  const getClassColor = (cls) => {
    const colors = {
      sleeper: "bg-green-100 text-green-800",
      ac3Tier: "bg-blue-100 text-blue-800",
      ac2Tier: "bg-purple-100 text-purple-800",
      acFirst: "bg-orange-100 text-orange-800"
    };
    return colors[cls] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">From Station</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Mumbai Central"
                value={filters.from}
                onChange={(e) => setFilters({...filters, from: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">To Station</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="New Delhi"
                value={filters.to}
                onChange={(e) => setFilters({...filters, to: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="date"
                className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-2.5 font-semibold text-white shadow-md transition hover:bg-blue-700"
            >
              Modify Search
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : trains.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-md">
          <Train className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900">No trains found</h3>
          <p className="mt-2 text-gray-600">Try different stations or dates</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {trains.length} Trains Found
            </h2>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter & Sort
            </button>
          </div>

          {trains.map((train) => (
            <div
              key={train.id}
              className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-xl"
            >
              <div className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  {/* Train Info */}
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900">{train.trainName}</h3>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                        #{train.trainNumber}
                      </span>
                      <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                        <Star className="h-4 w-4 fill-yellow-600" />
                        {train.rating}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{train.departureTime}</p>
                        <p className="text-sm text-gray-600">{train.from}</p>
                      </div>
                      <div className="flex flex-col items-center px-4">
                        <p className="text-xs font-medium text-gray-500">{train.duration}</p>
                        <div className="my-2 flex w-24 items-center gap-1">
                          <div className="h-0.5 flex-1 bg-gray-300" />
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-green-600">{train.distance}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{train.arrivalTime}</p>
                        <p className="text-sm text-gray-600">{train.to}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      {train.days.map((day) => (
                        <span
                          key={day}
                          className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Class Selection */}
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {Object.entries(train.price).map(([cls, price]) => {
                      const available = train.availableSeats[cls];
                      return (
                        <button
                          key={cls}
                          onClick={() => navigate(`/trains/${train.id}/seats?class=${cls}&date=${filters.date}`)}
                          className={`relative rounded-xl border-2 p-4 text-left transition hover:border-blue-500 hover:shadow-md ${
                            available < 10 ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
                          }`}
                        >
                          <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getClassColor(cls)}`}>
                            {getClassLabel(cls).split(' ')[0]}
                          </span>
                          <p className="text-lg font-bold text-gray-900">₹{price}</p>
                          <p className={`text-xs font-medium ${available < 10 ? "text-red-600" : "text-green-600"}`}>
                            {available} seats left
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};