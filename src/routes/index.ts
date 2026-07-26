import { Router } from "express";
import medicineRoutes from "./medicine.routes";

const router = Router();

router.use("/medicine", medicineRoutes);

export default router;