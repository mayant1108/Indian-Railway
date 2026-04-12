import { Router } from "express";
import {
  getSeats,
  getTrainDetails,
  listStations,
  searchTrains,
} from "../controllers/trainController.js";

const router = Router();

router.get("/stations", listStations);
router.get("/search", searchTrains);
router.get("/:id/seats", getSeats);
router.get("/:id", getTrainDetails);

export default router;