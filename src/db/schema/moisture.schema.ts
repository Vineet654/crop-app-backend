// models/MoistureLog.ts
import mongoose from "mongoose";

// Moisture / Sensor data schema
const moistureLogSchema = new mongoose.Schema(
    {
        timestamp: {
            type: Date,
            required: true,
        },
        waterDetected: {
            type: Boolean,
            default: false,
        },
        temperature: {
            type: Number,
        },
        humidity: {
            type: Number,
        },

        // OPTIONAL: if multiple farms or devices later
        deviceId: {
            type: String,
            required: false,
        },

    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
        collection: "moisture_logs",
    }
);

const MoistureLogSchema = mongoose.model("MoistureLog", moistureLogSchema);
export default MoistureLogSchema;
