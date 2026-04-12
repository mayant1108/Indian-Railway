import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock Database
const trains = [
  {
    id: 1,
    trainNumber: "12951",
    trainName: "Mumbai Rajdhani Express",
    from: "Mumbai Central",
    to: "New Delhi",
    departureTime: "16:35",
    arrivalTime: "08:35",
    duration: "16h 00m",
    distance: "1384 km",
    price: { sleeper: 1200, ac3Tier: 2100, ac2Tier: 3100, acFirst: 5200 },
    availableSeats: { sleeper: 45, ac3Tier: 32, ac2Tier: 18, acFirst: 8 },
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1545987796-200677ee1011?w=800",
    coaches: {
      sleeper: [{ coach: "S1", seats: 72, available: 12 }, { coach: "S2", seats: 72, available: 18 }, { coach: "S3", seats: 72, available: 15 }],
      ac3Tier: [{ coach: "B1", seats: 64, available: 8 }, { coach: "B2", seats: 64, available: 12 }, { coach: "B3", seats: 64, available: 12 }],
      ac2Tier: [{ coach: "A1", seats: 46, available: 5 }, { coach: "A2", seats: 46, available: 13 }],
      acFirst: [{ coach: "H1", seats: 18, available: 8 }]
    }
  },
  {
    id: 2,
    trainNumber: "12952",
    trainName: "New Delhi Shatabdi Express",
    from: "New Delhi",
    to: "Bhopal",
    departureTime: "06:00",
    arrivalTime: "14:05",
    duration: "8h 05m",
    distance: "702 km",
    price: { sleeper: 800, ac3Tier: 1500, ac2Tier: 2200, acFirst: 3800 },
    availableSeats: { sleeper: 120, ac3Tier: 85, ac2Tier: 42, acFirst: 15 },
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800",
    coaches: {
      sleeper: [{ coach: "S1", seats: 72, available: 40 }, { coach: "S2", seats: 72, available: 45 }, { coach: "S3", seats: 72, available: 35 }],
      ac3Tier: [{ coach: "B1", seats: 64, available: 25 }, { coach: "B2", seats: 64, available: 30 }, { coach: "B3", seats: 64, available: 30 }],
      ac2Tier: [{ coach: "A1", seats: 46, available: 15 }, { coach: "A2", seats: 46, available: 27 }],
      acFirst: [{ coach: "H1", seats: 18, available: 15 }]
    }
  },
  {
    id: 3,
    trainNumber: "12301",
    trainName: "Howrah Rajdhani Express",
    from: "New Delhi",
    to: "Howrah",
    departureTime: "16:55",
    arrivalTime: "10:00",
    duration: "17h 05m",
    distance: "1447 km",
    price: { sleeper: 1350, ac3Tier: 2400, ac2Tier: 3500, acFirst: 5800 },
    availableSeats: { sleeper: 28, ac3Tier: 15, ac2Tier: 8, acFirst: 4 },
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1535535112387-56ffe8db21ff?w=800",
    coaches: {
      sleeper: [{ coach: "S1", seats: 72, available: 8 }, { coach: "S2", seats: 72, available: 12 }, { coach: "S3", seats: 72, available: 8 }],
      ac3Tier: [{ coach: "B1", seats: 64, available: 5 }, { coach: "B2", seats: 64, available: 5 }, { coach: "B3", seats: 64, available: 5 }],
      ac2Tier: [{ coach: "A1", seats: 46, available: 4 }, { coach: "A2", seats: 46, available: 4 }],
      acFirst: [{ coach: "H1", seats: 18, available: 4 }]
    }
  },
  {
    id: 4,
    trainNumber: "12417",
    trainName: "Prayagraj Express",
    from: "Allahabad Junction",
    to: "New Delhi",
    departureTime: "21:30",
    arrivalTime: "07:15",
    duration: "9h 45m",
    distance: "634 km",
    price: { sleeper: 650, ac3Tier: 1200, ac2Tier: 1800, acFirst: 3200 },
    availableSeats: { sleeper: 200, ac3Tier: 120, ac2Tier: 60, acFirst: 20 },
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1590089415225-401eb6b9b912?w=800",
    coaches: {
      sleeper: [{ coach: "S1", seats: 72, available: 50 }, { coach: "S2", seats: 72, available: 55 }, { coach: "S3", seats: 72, available: 50 }, { coach: "S4", seats: 72, available: 45 }],
      ac3Tier: [{ coach: "B1", seats: 64, available: 30 }, { coach: "B2", seats: 64, available: 30 }, { coach: "B3", seats: 64, available: 30 }, { coach: "B4", seats: 64, available: 30 }],
      ac2Tier: [{ coach: "A1", seats: 46, available: 15 }, { coach: "A2", seats: 46, available: 20 }, { coach: "A3", seats: 46, available: 25 }],
      acFirst: [{ coach: "H1", seats: 18, available: 20 }]
    }
  },
  {
    id: 5,
    trainNumber: "12627",
    trainName: "Karnataka Express",
    from: "Bangalore City",
    to: "New Delhi",
    departureTime: "19:20",
    arrivalTime: "09:30",
    duration: "38h 10m",
    distance: "2380 km",
    price: { sleeper: 950, ac3Tier: 1800, ac2Tier: 2800, acFirst: 4800 },
    availableSeats: { sleeper: 85, ac3Tier: 65, ac2Tier: 32, acFirst: 12 },
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1565693413579-8ff3fdc1b03b?w=800",
    coaches: {
      sleeper: [{ coach: "S1", seats: 72, available: 20 }, { coach: "S2", seats: 72, available: 25 }, { coach: "S3", seats: 72, available: 20 }, { coach: "S4", seats: 72, available: 20 }],
      ac3Tier: [{ coach: "B1", seats: 64, available: 15 }, { coach: "B2", seats: 64, available: 20 }, { coach: "B3", seats: 64, available: 15 }, { coach: "B4", seats: 64, available: 15 }],
      ac2Tier: [{ coach: "A1", seats: 46, available: 10 }, { coach: "A2", seats: 46, available: 12 }, { coach: "A3", seats: 46, available: 10 }],
      acFirst: [{ coach: "H1", seats: 18, available: 12 }]
    }
  }
];

let bookings = [];
let bookingIdCounter = 1000;
const users = [{ id: 1, email: "admin@railway.com", password: "admin123", name: "Admin User", isAdmin: true }];

// Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  // Mock token validation
  req.user = { id: 1, email: "user@example.com", name: "Test User" };
  next();
};

const adminMiddleware = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};

// Routes

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Railway Booking API is running', timestamp: new Date().toISOString() });
});

// Get all trains with search
app.get('/api/trains', (req, res) => {
  const { from, to, date, class: travelClass } = req.query;
  let filteredTrains = [...trains];
  
  if (from) {
    filteredTrains = filteredTrains.filter(t => 
      t.from.toLowerCase().includes(from.toLowerCase()) ||
      t.trainName.toLowerCase().includes(from.toLowerCase())
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

// Get single train with seat details
app.get('/api/trains/:id', (req, res) => {
  const train = trains.find(t => t.id === parseInt(req.params.id));
  if (!train) {
    return res.status(404).json({ success: false, message: 'Train not found' });
  }
  res.json({ success: true, data: train });
});

// Get seat availability for specific train
app.get('/api/trains/:id/seats', (req, res) => {
  const train = trains.find(t => t.id === parseInt(req.params.id));
  if (!train) {
    return res.status(404).json({ success: false, message: 'Train not found' });
  }
  
  const { class: travelClass } = req.query;
  let seatData = train.coaches;
  
  if (travelClass && train.coaches[travelClass]) {
    seatData = { [travelClass]: train.coaches[travelClass] };
  }
  
  res.json({
    success: true,
    data: {
      trainId: train.id,
      trainName: train.trainName,
      trainNumber: train.trainNumber,
      from: train.from,
      to: train.to,
      coaches: seatData
    }
  });
});

// Book ticket
app.post('/api/booking', authMiddleware, async (req, res) => {
  const { trainId, passengers, travelClass, coach, seats, contactDetails } = req.body;
  
  const train = trains.find(t => t.id === parseInt(trainId));
  if (!train) {
    return res.status(404).json({ success: false, message: 'Train not found' });
  }
  
  // Check seat availability
  if (train.availableSeats[travelClass] < passengers.length) {
    return res.status(400).json({ 
      success: false, 
      message: 'Not enough seats available in this class' 
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
    duration: train.duration,
    travelClass,
    coach: coach || 'Auto',
    seats: seats || passengers.map((_, i) => `${travelClass === 'sleeper' ? 'S' : travelClass === 'ac3Tier' ? 'B' : travelClass === 'ac2Tier' ? 'A' : 'H'}${Math.floor(Math.random() * 10 + 1)}${String.fromCharCode(65 + Math.floor(Math.random() * 4))}${Math.floor(Math.random() * 6 + 1)}`),
    passengers: passengers.map((p, i) => ({ ...p, seatNumber: seats?.[i] || `Auto-${i+1}` })),
    contactDetails,
    totalPrice,
    status: 'CONFIRMED',
    pnr: Math.random().toString(36).substring(2, 10).toUpperCase(),
    bookingDate: new Date().toISOString(),
    userId: req.user.id
  };
  
  bookings.push(booking);
  
  res.status(201).json({
    success: true,
    message: 'Booking confirmed successfully',
    data: booking
  });
});

// Get user's bookings
app.get('/api/booking/my-bookings', authMiddleware, (req, res) => {
  const userBookings = bookings.filter(b => b.userId === req.user.id);
  res.json({
    success: true,
    count: userBookings.length,
    data: userBookings
  });
});

// Cancel booking
app.delete('/api/booking/:id', authMiddleware, (req, res) => {
  const index = bookings.findIndex(b => b.id === parseInt(req.params.id) && b.userId === req.user.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  
  const booking = bookings[index];
  const train = trains.find(t => t.id === parseInt(booking.trainId));
  
  // Restore seats
  if (train) {
    train.availableSeats[booking.travelClass] += booking.passengers.length;
  }
  
  booking.status = 'CANCELLED';
  
  res.json({
    success: true,
    message: 'Booking cancelled successfully',
    data: booking
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin },
      token: 'mock-jwt-token-' + user.id
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }
  
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    isAdmin: false
  };
  
  users.push(newUser);
  
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: { id: newUser.id, name: newUser.name, email: newUser.email, isAdmin: false },
      token: 'mock-jwt-token-' + newUser.id
    }
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// Admin routes
app.get('/api/admin/dashboard', authMiddleware, adminMiddleware, (req, res) => {
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.status === 'CONFIRMED' ? b.totalPrice : 0), 0);
  const activeUsers = users.length;
  
  res.json({
    success: true,
    data: {
      stats: {
        totalBookings,
        totalRevenue,
        activeUsers,
        totalTrains: trains.length
      },
      recentBookings: bookings.slice(-10).reverse(),
      trains: trains
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚂 Railway Server running on http://localhost:${PORT}`);
  console.log(`📊 Total Trains: ${trains.length}`);
  console.log(`👥 Total Users: ${users.length}`);
  console.log(`🎫 Total Bookings: ${bookings.length}`);
});