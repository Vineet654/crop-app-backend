// src/controllers/moistureController.ts
import { Request, Response } from "express";
import moistureLogSchema from "../db/schema/moisture.schema";

/**
 * GET /farm/moisture/latest?limit=50&deviceId=...&since=...
 * Returns the most recent documents, sorted by timestamp desc.
 */
export async function getLatestLogs(req: Request, res: Response) {
  try {
    const limit = Math.min(1000, Number(req.query.limit ?? 100));
    const sinceRaw = req.query.since as string | undefined;
    const deviceId = req.query.deviceId as string | undefined;

    const filter: any = {};
    if (sinceRaw) {
      // accept either numeric ms or ISO string
      const sinceNum = Number(sinceRaw);
      filter.timestamp = isNaN(sinceNum) ? { $gte: new Date(sinceRaw) } : { $gte: new Date(sinceNum) };
    }
    if (deviceId) {
      filter.deviceId = deviceId;
    }

    const docs = await moistureLogSchema.find(filter).sort({ timestamp: -1 }).limit(limit).lean().exec();
    res.json({ success: true, count: docs.length, data: docs });
  } catch (err) {
    console.error("getLatestLogs error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

/**
 * GET /farm/moisture/summary?minutes=60
 * Example aggregated summary in the last X minutes.
 */
export async function getSummary(req: Request, res: Response) {
  try {
    const minutes = Number(req.query.minutes ?? 60);
    const from = new Date(Date.now() - minutes * 60 * 1000);

    const pipeline = [
      { $match: { timestamp: { $gte: from } } },
      {
        $group: {
          _id: null,
          avgTemp: { $avg: "$temperature" },
          avgHumidity: { $avg: "$humidity" },
          count: { $sum: 1 },
          waterTrue: { $sum: { $cond: ["$waterDetected", 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          avgTemp: { $round: ["$avgTemp", 2] },
          avgHumidity: { $round: ["$avgHumidity", 2] },
          waterDetectedCount: "$waterTrue",
          count: 1,
        },
      },
    ];

    const [summary] = await moistureLogSchema.aggregate(pipeline).exec();
    res.json({ success: true, summary: summary ?? { avgTemp: null, avgHumidity: null, count: 0, waterDetectedCount: 0 } });
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
