# Railway Reservation Website - Implementation Plan

## Step 1: Audit current codebase (frontend + backend)
- [ ] Search for existing API endpoints (auth, trains, bookings, admin)
- [ ] Search for existing frontend pages/components/routes
- [ ] Identify missing spec items (cancel ticket, download PDF, profile update, admin analytics/users/bookings, dark/light mode, QR generation, wishlist, news, chatbot)

## Step 2: Backend completion
- [ ] Ensure admin routes exist: /api/admin/users, /api/admin/bookings, /api/admin/stats
- [ ] Ensure booking routes exist: POST /api/bookings, GET /api/bookings/my, DELETE /api/bookings/:id
- [ ] Add controller for cancel booking + update booking status/payment
- [ ] Add profile update endpoints
- [ ] Add ticket PDF/QR generation endpoints/structure
- [ ] Wire payment gateway abstraction (Razorpay/Stripe structure)
- [ ] Add validation + consistent response shapes + error handling

## Step 3: Frontend completion
- [ ] Add missing pages: Profile, Cancel ticket, Ticket PDF download trigger, Admin Dashboard (analytics)
- [ ] Add dark/light mode toggle persisted
- [ ] Improve ProtectedRoute to cover role-based admin access
- [ ] Implement booking history UI improvements
- [ ] Add admin users/manage bookings UIs

## Step 4: Data seeding
- [ ] Ensure seed.js creates trains + admin + demo user
- [ ] Ensure admin can CRUD trains after seed

## Step 5: Smoke testing
- [ ] Run backend seed + backend server
- [ ] Run frontend dev server
- [ ] Validate auth → search → seats → booking → my bookings → cancel → admin dashboard

