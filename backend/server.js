const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock Database
const trains = [
  {
    id: 1,
    trainNumber: "12951",
    trainName: "Rajdhani Express",
    from: "Mumbai Central",
    to: "New Delhi",
    departureTime: "16:35",
    arrivalTime: "08:35",
    duration: "16h 00m",
    price: { sleeper: 1200, ac3Tier: 2100, ac2Tier: 3100, acFirst: 5200 },
    availableSeats: { sleeper: 45, ac3Tier: 32, ac2Tier: 18, acFirst: 8 },
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1545987796-200677ee1011?w=800"
  },
  {
    id: 2,
    trainNumber: "12952",
    trainName: "Shatabdi Express",
    from: "New Delhi",
    to: "Bhopal",
    departureTime: "06:00",
    arrivalTime: "14:05",
    duration: "8h 05m",
    price: { sleeper: 800, ac3Tier: 1500, ac2Tier: 2200, acFirst: 3800 },
    availableSeats: { sleeper: 120, ac3Tier: 85, ac2Tier: 42, acFirst: 15 },
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800"
  },
  {
    id: 3,
    trainNumber: "12301",
    trainName: "Howrah Rajdhani",
    from: "New Delhi",
    to: "Howrah",
    departureTime: "16:55",
    arrivalTime: "10:00",
    duration: "17h 05m",
    price: { sleeper: 1350, ac3Tier: 2400, ac2Tier: 3500, acFirst: 5800 },
    availableSeats: { sleeper: 28, ac3Tier: 15, ac2Tier: 8, acFirst: 4 },
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1535535112387-56ffe8db21ff?w=800"
  },
  {
    id: 4,
    trainNumber: "12417",
    trainName: "Prayagraj Express",
    from: "Allahabad",
    to: "New Delhi",
    departureTime: "21:30",
    arrivalTime: "07:15",
    duration: "9h 45m",
    price: { sleeper: 650, ac3Tier: 1200, ac2Tier: 1800, acFirst: 3200 },
    availableSeats: { sleeper: 200, ac3Tier: 120, ac2Tier: 60, acFirst: 20 },
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1590089415225-401eb6b9b912?w=800"
  },
  {
    id: 5,
    trainNumber: "12627",
    trainName: "Karnataka Express",
    from: "Bangalore",
    to: "New Delhi",
    departureTime: "19:20",
    arrivalTime: "09:30",
    duration: "38h 10m",
    price: { sleeper: 950, ac3Tier: 1800, ac2Tier: 2800, acFirst: 4800 },
    availableSeats: { sleeper: 85, ac3Tier: 65, ac2Tier: 32, acFirst: 12 },
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1565693413579-8ff3fdc1b03b?w=800"
  }
];

let bookings = [];
let bookingIdCounter = 1000;

// API Routes

// Get all trains with search/filter
app.get('/api/trains', (req, res) => {
  const { from, to, date, class: travelClass } = req.query;
  
  let filteredTrains = [...trains];
  
  if (from) {
    filteredTrains = filteredTrains.filter(t => 
      t.from.toLowerCase().includes(from.toLowerCase())
    );
  }
  
  if (to) {
    filteredTrains = filteredTrains.filter(t => 
      t.to.toLowerCase().includes(to.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    count: filteredTrains.length,
    data: filteredTrains
  });
});

// Get single train details
app.get('/api/trains/:id', (req, res) => {
  const train = trains.find(t => t.id === parseInt(req.params.id));
  if (!train) {
    return res.status(404).json({ success: false, message: 'Train not found' });
  }
  res.json({ success: true, data: train });
});

// Book ticket
app.post('/api/bookings', (req, res) => {
  const { trainId, passengers, travelClass, contactDetails } = req.body;
  
  const train = trains.find(t => t.id === trainId);
  if (!train) {
    return res.status(404).json({ success: false, message: 'Train not found' });
  }
  
  // Check seat availability
  if (train.availableSeats[travelClass] < passengers.length) {
    return res.status(400).json({ 
      success: false, 
      message: 'Not enough seats available' 
    });
  }
  
  // Update available seats
  train.availableSeats[travelClass] -= passengers.length;
  
  // Calculate total price
  const totalPrice = train.price[travelClass] * passengers.length;
  
  const booking = {
    id: bookingIdCounter++,
    trainId,
    trainName: train.trainName,
    trainNumber: train.trainNumber,
    from: train.from,
    to: train.to,
    departureTime: train.departureTime,
    arrivalTime: train.arrivalTime,
    travelClass,
    passengers,
    contactDetails,
    totalPrice,
    status: 'CONFIRMED',
    pnr: Math.random().toString(36).substring(2, 10).toUpperCase(),
    bookingDate: new Date().toISOString()
  };
  
  bookings.push(booking);
  
  res.status(201).json({
    success: true,
    message: 'Booking confirmed',
    data: booking
  });
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
  res.json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// Get single booking
app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id === parseInt(req.params.id));
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  res.json({ success: true, data: booking });
});

// Cancel booking
app.delete('/api/bookings/:id', (req, res) => {
  const index = bookings.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  
  const booking = bookings[index];
  const train = trains.find(t => t.id === booking.trainId);
  
  // Restore seats
  if (train) {
    train.availableSeats[booking.travelClass] += booking.passengers.length;
  }
  
  bookings.splice(index, 1);
  
  res.json({
    success: true,
    message: 'Booking cancelled successfully'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Railway API is running' });
});

app.listen(PORT, () => {
  console.log(`🚂 Railway Server running on http://localhost:${PORT}`);
  console.log(`📊 Total Trains: ${trains.length}`);
  console.log(`🎫 Total Bookings: ${bookings.length}`);
});