import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  JWT: z.string().min(1, "JWT secret is required"),
  ENV: z.string().default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ELEVEN: z.string().min(1, "ElevenLabs API key is required"),
  GEMINI: z.string().min(1, "Gemini API key is required"),
  PINECONE: z.string().min(1, "Pinecone API key is required"),
  POSTMARK: z.string().min(1, "Postmark API key is required"),
  FROM_EMAIL: z.string().email("A valid FROM_EMAIL is required"),
  CORS_ORIGINS: z.string().default("http://localhost:5173"),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error("Invalid environment variables:", envParsed.error.format());
  process.exit(1);
}

import helmet from 'helmet'
import morgan from 'morgan'
import cors from 'cors'
import { Request, Response, NextFunction } from 'express'
import { globalApiLimiter } from './middlewares/rateLimiter'
import authRouter from './routes/auth'
import agentRouter from './routes/agent'
import domainRouter from './routes/domain'
import conversationRouter from './routes/conversation'
import workflowRouter from './routes/execution'
import botRouter from './routes/bot'
import kbRouter from './routes/kb'
import dashboardRouter from './routes/dashboard'
import waitlistRouter from './routes/waitlist'
import planRouter from './routes/plan'
import {conn} from './database/conn'

// ── Security headers ────────────────────────────────────────────────────
app.use(helmet())

// ── CORS — locked to production origins ─────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
}))

// ── Global rate limiter ─────────────────────────────────────────────────
app.use(globalApiLimiter)

// ── Body parsing & logging ──────────────────────────────────────────────
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// ── Routes ──────────────────────────────────────────────────────────────
app.use("/waitlist", waitlistRouter);
app.use("/dashboard", dashboardRouter);
app.use("/auth", authRouter);
app.use("/agent", agentRouter);
app.use("/conversation", conversationRouter)
app.use("/domain", domainRouter)
app.use("/workflow", workflowRouter)
app.use("/bot", botRouter);
app.use("/kb", kbRouter);
app.use("/plan", planRouter);

// ── Global error handler ────────────────────────────────────────────────
// Must be after all routes — Express identifies error handlers by their 4-arg signature
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // CORS rejection from the origin callback
  if (err.message?.includes("not allowed by CORS")) {
    return res.status(403).json({ success: false, message: "CORS: origin not allowed" });
  }

  console.error("Unhandled error:", err.stack || err.message);
  return res.status(500).json({
    success: false,
    message: process.env.ENV === "development" ? err.message : "Internal server error",
  });
});

// ── Database connection + Server ────────────────────────────────────────
conn()
app.listen(process.env.PORT, ()=>{
    console.log(`http://localhost:${process.env.PORT}/`)
})