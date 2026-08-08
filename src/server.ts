import "./config/env";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import routes from "./routes";
import { testFirestoreConnection } from "./utils/firebase-test";


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 8080;

app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "MedicineAI Backend is running",
        version: "v1"
    });
});

app.get("/health", (_req, res) => {
    res.json({
        success: true,
        status: "UP",
        timestamp: new Date().toISOString()
    });
});

app.use("/api/v1", routes);

app.listen(PORT, async () => {
    console.log("====================================");
    console.log("MedicineAI Backend Started");
    console.log(`Port: ${PORT}`);
    console.log("====================================");

    try {
        await testFirestoreConnection();
    } catch (error) {
        console.error("❌ Firestore connection failed:", error);
    }
});