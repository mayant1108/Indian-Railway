# 🚂 Railway Ticket Booking App (IRCTC Clone)

Full-stack app like IRCTC with React + Node/Express/MongoDB.

## Features
- ✅ Train search/filter/sort by route/date/class/fare
- ✅ Visual seat selection & availability
- ✅ User auth (JWT) + booking flow
- ✅ Payment (Razorpay test) + email confirmation
- ✅ My bookings + Admin panel (CRUD trains)
- ✅ Responsive Tailwind UI + smooth animations

## Quick Setup (Development)

### 1. MongoDB Atlas
- Create free cluster: [mongodb.com/atlas](https://mongodb.com/atlas)
- Get connection string → update `backend/.env` MONGODB_URI
```
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/railwaydb...
```

### 2. Start Backend
```bash
cd backend
npm install
npm run seed  # Seeds sample trains + demo users (admin@railwayhub.com/Admin@123)
npm run dev   # http://localhost:5000/api/health
```

Demo logins:
- Admin: admin@railwayhub.com / Admin@123 (`/admin`)
- User: user@railwayhub.com / User@123

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

### 4. Test Flow
1. Home → Search Mumbai → New Delhi → tomorrow
2. Pick train → Check seats → Login → Book (dummy payment)
3. My bookings → See PNR/ticket

## Root Commands (if package.json scripts added)
```bash
npm run dev:backend  # backend npm run dev
npm run dev:frontend # frontend npm run dev
npm run seed         # backend seed
```

## Deployment
- **Frontend**: Vercel/Netlify (build: `npm run build`)
- **Backend**: Railway/Render (env vars from .env)
- **DB**: MongoDB Atlas

## Optional Config
- **Razorpay**: Test keys in backend/.env → live payments
- **Email**: Gmail app password → confirmations work

## Tech Stack
```
Frontend: React 18 + Vite + Tailwind + React Router + Axios + Lucide Icons
Backend: Node/Express + Mongoose + JWT + Razorpay + Nodemailer
DB: MongoDB
Other: Seat logic, dynamic pricing, PNR generation
```

Built with ❤️ by BLACKBOXAI

