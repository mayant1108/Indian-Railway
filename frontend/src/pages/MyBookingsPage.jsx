import { useState, useEffect } from "react";
import axios from "axios";
import { Train, Calendar, MapPin, Clock, Download, X, Users, Ticket, CreditCard, AlertCircle, ChevronRight } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token") || "mock-token";
      const response = await axios.get(`${API_URL}/booking/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Backend shape: { success, data: { bookings } }
      setBookings(response.data?.data?.bookings ?? []);

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async () => {
    if (!bookingToCancel) return;
    
    try {
      const token = localStorage.getItem("token") || "mock-token";
      await axios.delete(`${API_URL}/booking/${bookingToCancel.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCancelModal(false);
      setBookingToCancel(null);
      fetchBookings();
    } catch (error) {
      alert("Cancellation failed");
    }
  };

  const downloadTicket = (booking) => {
    // Implement ticket download functionality
    console.log("Downloading ticket for:", booking.pnr);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <Train className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Bookings
              </h1>
              <p className="text-gray-600 mt-2">Manage and track your train journeys</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2">
              <Ticket className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-600">{bookings.length} Total Bookings</span>
            </div>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-2xl opacity-20"></div>
              <Train className="relative mx-auto mb-6 h-24 w-24 text-gray-300" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">Start your journey by searching for trains</p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Search Trains
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking, index) => (
              <div
                key={booking.id}
                className={`group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border ${
                  booking.status === "CANCELLED" ? "border-red-200 bg-gray-50" : "border-gray-100"
                }`}
                style={{ animationDelay: `${index * 100}ms`, animation: 'fadeInUp 0.5s ease-out' }}
              >
                {/* Status Bar */}
                <div className={`h-1 ${booking.status === "CONFIRMED" ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-red-400 to-red-600"}`}></div>
                
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content */}
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                            <Train className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{booking.trainName}</h3>
                            <p className="text-sm text-gray-500">Train #{booking.trainNumber}</p>
                          </div>
                        </div>
                        <span
                          className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                            booking.status === "CONFIRMED"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      {/* PNR Info */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-gray-600">PNR:</span>
                            <span className="font-mono font-bold text-blue-600 text-lg">{booking.pnr}</span>
                          </div>
                          <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-purple-600" />
                            <span className="text-sm text-gray-600">Booked on:</span>
                            <span className="font-medium text-gray-900">
                              {new Date(booking.bookingDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Journey Details */}
                      <div className="relative">
                        <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="flex-1 text-center">
                            <p className="text-2xl font-bold text-gray-900">{booking.departureTime}</p>
                            <p className="font-semibold text-gray-800 mt-1">{booking.from}</p>
                          </div>
                          <div className="flex-1 flex flex-col items-center">
                            <div className="relative w-full">
                              <div className="border-t-2 border-dashed border-gray-400 w-full"></div>
                              <Train className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-blue-600 bg-white px-1" />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Direct Journey</p>
                          </div>
                          <div className="flex-1 text-center">
                            <p className="text-2xl font-bold text-gray-900">{booking.arrivalTime}</p>
                            <p className="font-semibold text-gray-800 mt-1">{booking.to}</p>
                          </div>
                        </div>
                      </div>

                      {/* Passenger Details */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-700">Class: <span className="font-semibold">{booking.travelClass}</span></span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-gray-700">Passengers: <span className="font-semibold">{booking.passengers.length}</span></span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                          <MapPin className="h-4 w-4 text-orange-600" />
                          <span className="text-gray-700">Seats: <span className="font-semibold">{booking.seats?.join(", ")}</span></span>
                        </div>
                      </div>

                      {/* Passenger Names */}
                      {booking.passengers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {booking.passengers.map((passenger, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {passenger.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price and Actions */}
                    <div className="lg:w-64 flex flex-col justify-between gap-4">
                      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-4 text-white text-center">
                        <p className="text-sm opacity-90">Total Amount</p>
                        <p className="text-3xl font-bold">₹{booking.totalPrice}</p>
                        <p className="text-xs opacity-75 mt-1">Including taxes</p>
                      </div>

                      {booking.status === "CONFIRMED" && (
                        <div className="space-y-3">
                          <button
                            onClick={() => downloadTicket(booking)}
                            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300"
                          >
                            <Download className="h-4 w-4" />
                            Download Ticket
                          </button>
                          <button
                            onClick={() => {
                              setBookingToCancel(booking);
                              setShowCancelModal(true);
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-red-50 border-2 border-red-300 text-red-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-red-100 transition-all duration-300"
                          >
                            <X className="h-4 w-4" />
                            Cancel Booking
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scaleIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Booking</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel your booking for <span className="font-semibold">{bookingToCancel.trainName}</span>?
                <br />
                <span className="text-sm text-red-600">This action cannot be undone.</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setBookingToCancel(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Keep Booking
                </button>
                <button
                  onClick={cancelBooking}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};