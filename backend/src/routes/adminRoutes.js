import { Router } from "express";
import {
  createTrain,
  deleteTrain,
  listAdminTrains,
  updateTrain,
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, authorize("admin"));
router.get("/trains", listAdminTrains);
router.post("/trains", createTrain);
router.put("/trains/:id", updateTrain);
router.delete("/trains/:id", deleteTrain);

export default router;
