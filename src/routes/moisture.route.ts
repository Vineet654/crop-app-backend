// src/routes/moisture.route.ts
import express from "express";
import { getLatestLogs, getSummary } from "../controllers/moisture.controller";

const moistureRouter = express.Router();

// Example: /farm/moisture/latest
moistureRouter.get ("/latest", getLatestLogs);

// Example: /farm/moisture/summary
moistureRouter.get("/summary", getSummary);

export default moistureRouter;
