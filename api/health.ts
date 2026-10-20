import type { Request, Response } from 'express';

/**
 * Health check endpoint for the serverless / API layer.
 * Route: GET /api/health
 */
export default function healthHandler(_req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    status: 'ok',
    uptime: process.uptime ? process.uptime() : 0,
    timestamp: new Date().toISOString(),
    service: 'lta-bus-arrival-api',
  });
}
