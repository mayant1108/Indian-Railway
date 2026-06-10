import { Router } from "express";
import {
  cancelBooking,
  createBooking,
  createBookingOrder,
  getUserBookings,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

// Booking history
router.get("/user", getUserBookings);

// Back-compat route used by the current frontend page
router.get("/my-bookings", getUserBookings);

// Booking creation flow
router.post("/payment-order", createBookingOrder);
router.post("/create", createBooking);

// Booking cancellation
router.delete("/:id", cancelBooking);

export default router;

