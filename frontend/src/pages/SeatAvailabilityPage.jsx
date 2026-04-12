import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Train, Users, Check, X, Armchair } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export const SeatAvailabilityPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const travelClass = searchParams.get("class") || "sleeper";
  const date = searchParams.get("date");

  useEffect(() => {
    fetchTrainDetails();
  }, [id]);

  const fetchTrainDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/trains/${id}`);
      setTrain(response.data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (coach, seatNumber) => {
    const seatId = `${coach}-${seatNumber}`;
    if (selectedSeats.find(s => s.id === seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
    } else if (selectedSeats.length < 6) {
      setSelectedSeats([...selectedSeats, { id: seatId, coach, seatNumber }]);
    }
  };

  const handleBook = () => {
    navigate(`/booking/${id}?class=${travelClass}&seats=${selectedSeats.length}&date=${date}`);
  };

  const getSeatLayout = () => {
    // Generate mock seat layout based on class
    const rows = travelClass === 'sleeper' ? 8 : 6;
    const seatsPerRow = travelClass === 'sleeper' ? 8 : 4;
    
    return Array.from({ length: rows }, (_, row) => 
      Array.from({ length: seatsPerRow }, (_, seat) => ({
        number: `${row + 1}${String.fromCharCode(65 + seat)}`,
        available: Math.random() > 0.3,
        coach: travelClass === 'sleeper' ? 'S1' : travelClass === 'ac3Tier' ? 'B1' : 'A1'
      }))
    );
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  if (!train) return <div>Train not found</div>;

  const seatLayout = getSeatLayout();

  return (
    <div className="space-y-6">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to trains
      </button>

      <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Train className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{train.trainName}</h1>
        </div>
        <p className="text-blue-200">#{train.trainNumber} • {train.from} → {train.to}</p>
        <p className="mt-2 text-sm text-blue-200">Journey Date: {date}</p>
      </div>

      {/* Seat Selection */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Seat Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Select Seats - {travelClass.toUpperCase()}</h2>
            
            {/* Legend */}
            <div className="mb-6 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-green-500" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-300" />
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-blue-600" />
                <span>Selected</span>
              </div>
            </div>

            {/* Seat Grid */}
            <div className="space-y-3">
              {seatLayout.map((row, rowIdx) => (
                <div key={rowIdx} className="flex justify-center gap-2">
                  {row.map((seat, seatIdx) => {
                    const seatId = `${seat.coach}-${seat.number}`;
                    const isSelected = selectedSeats.find(s => s.id === seatId);
                    const isAvailable = seat.available;
                    
                    return (
                      <button
                        key={seatIdx}
                        disabled={!isAvailable}
                        onClick={() => toggleSeat(seat.coach, seat.number)}
                        className={`h-12 w-12 rounded-lg font-medium transition ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-lg"
                            : isAvailable
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {seat.number}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-md sticky top-4">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Booking Summary</h3>
            
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Selected Seats</span>
                <span className="font-medium">{selectedSeats.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price per seat</span>
                <span className="font-medium">₹{train.price[travelClass]}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">₹{train.price[travelClass] * selectedSeats.length}</span>
                </div>
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Selected:</p>
                {selectedSeats.map((seat) => (
                  <div key={seat.id} className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm">
                    <span>Coach {seat.coach} - Seat {seat.seatNumber}</span>
                    <button
                      onClick={() => toggleSeat(seat.coach, seat.seatNumber)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={selectedSeats.length === 0}
              className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white shadow-lg transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {selectedSeats.length > 0 ? `Book ${selectedSeats.length} Seat(s)` : "Select Seats to Book"}
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              Max 6 seats per booking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};