import { Router } from "express";
import {
  createBooking,
  createBookingOrder,
  getUserBookings,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/user", getUserBookings);
router.post("/payment-order", createBookingOrder);
router.post("/create", createBooking);

export default router;
