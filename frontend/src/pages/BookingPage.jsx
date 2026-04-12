import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CreditCard, User, Mail, Phone, Shield, Check } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export const BookingPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const travelClass = searchParams.get("class");
  const seatCount = parseInt(searchParams.get("seats")) || 1;
  const date = searchParams.get("date");

  const [bookingData, setBookingData] = useState({
    passengers: Array.from({ length: seatCount }, () => ({
      name: "",
      age: "",
      gender: "male"
    })),
    contact: {
      email: "",
      phone: ""
    },
    payment: {
      method: "card",
      cardNumber: "",
      expiry: "",
      cvv: ""
    }
  });

  const handlePassengerChange = (idx, field, value) => {
    const updated = [...bookingData.passengers];
    updated[idx][field] = value;
    setBookingData({ ...bookingData, passengers: updated });
  };

  const handleBook = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "mock-token";
      
      await axios.post(
        `${API_URL}/booking`,
        {
          trainId: id,
          passengers: bookingData.passengers,
          travelClass,
          contactDetails: bookingData.contact
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStep(3); // Success
    } catch (error) {
      alert("Booking failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <div className="mb-8 flex items-center justify-between">
        {["Passenger Details", "Payment", "Confirmation"].map((s, i) => (
          <div key={i} className={`flex flex-col items-center ${step > i ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${step > i ? "bg-blue-600 text-white" : step === i + 1 ? "bg-blue-100 text-blue-600" : "bg-gray-200"}`}>
              {step > i + 1 ? <Check className="h-5 w-5" /> : i + 1}
            </div>
            <span className="text-xs font-medium">{s}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Passenger Details</h2>
            
            {bookingData.passengers.map((passenger, idx) => (
              <div key={idx} className="mb-6 rounded-xl bg-gray-50 p-4">
                <h3 className="mb-4 font-semibold text-gray-700">Passenger {idx + 1}</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5"
                        placeholder="Enter full name"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(idx, "name", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5"
                      placeholder="Age"
                      value={passenger.age}
                      onChange={(e) => handlePassengerChange(idx, "age", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
                    <div className="flex gap-4">
                      {["male", "female", "other"].map((g) => (
                        <label key={g} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`gender-${idx}`}
                            value={g}
                            checked={passenger.gender === g}
                            onChange={(e) => handlePassengerChange(idx, "gender", e.target.value)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="capitalize">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-gray-700">Contact Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5"
                      placeholder="your@email.com"
                      value={bookingData.contact.email}
                      onChange={(e) => setBookingData({...bookingData, contact: {...bookingData.contact, email: e.target.value}})}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5"
                      placeholder="+91 98765 43210"
                      value={bookingData.contact.phone}
                      onChange={(e) => setBookingData({...bookingData, contact: {...bookingData.contact, phone: e.target.value}})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Payment</h2>
          
          <div className="mb-6 flex gap-4">
            {["card", "upi", "netbanking"].map((method) => (
              <button
                key={method}
                onClick={() => setBookingData({...bookingData, payment: {...bookingData.payment, method}})}
                className={`flex-1 rounded-xl border-2 p-4 text-center font-medium capitalize transition ${
                  bookingData.payment.method === method
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                {method === "card" ? "Credit/Debit Card" : method === "upi" ? "UPI" : "Net Banking"}
              </button>
            ))}
          </div>

          {bookingData.payment.method === "card" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Expiry</label>
                  <input type="text" className="w-full rounded-xl border border-gray-300 px-4 py-2.5" placeholder="MM/YY" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">CVV</label>
                  <input type="text" className="w-full rounded-xl border border-gray-300 px-4 py-2.5" placeholder="123" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t pt-6">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">₹2,100</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleBook}
                disabled={loading}
                className="rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Pay & Book"}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
          <p className="mb-6 text-gray-600">Your tickets have been booked successfully.</p>
          
          <div className="mb-6 rounded-xl bg-blue-50 p-4">
            <p className="text-sm text-gray-600">PNR Number</p>
            <p className="text-3xl font-bold tracking-wider text-blue-900">ABC12345</p>
          </div>

          <button
            onClick={() => navigate("/my-bookings")}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700"
          >
            View My Bookings
          </button>
        </div>
      )}
    </div>
  );
};