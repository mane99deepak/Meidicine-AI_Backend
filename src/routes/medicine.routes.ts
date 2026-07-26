import { Router } from "express";
import { explainMedicine } from "../controllers/medicine.controller";

const router = Router();

router.post("/explain-medicine", explainMedicine);

export default router;