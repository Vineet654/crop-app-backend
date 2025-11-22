// app.ts
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "node:path";
import authRouter from "./routes/auth.route";
import profileRouter from "./routes/profile.route";
import { errorHandler } from "./utils/error-handler";
import './db';
dotenv.config();
const app = express();

app.use(errorHandler);
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());

// Root health check
app.get("/", (_req, res) => {

res.status(200).json({
    service: "RideHail API",
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime().toFixed(2) + "s",
});
});

app.use('/api/assets', express.static(path.resolve(__dirname, '..', 'public/assets')));
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
export default app;
