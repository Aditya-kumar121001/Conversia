import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  JWT: z.string().min(1, "JWT secret is required"),
  ENV: z.string().default("development"),
  DATABASE_URl: z.string().min(1, "DATABASE_URl is required"),
  ELEVEN: z.string().min(1, "ElevenLabs API key is required"),
  GEMINI: z.string().min(1, "Gemini API key is required"),
  PINECONE: z.string().min(1, "Pinecone API key is required"),
  POSTMARK: z.string().min(1, "Postmark API key is required"),
  FROM_EMAIL: z.string().email("A valid FROM_EMAIL is required"),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error("❌ Invalid environment variables:", envParsed.error.format());
  process.exit(1);
}
import morgan from 'morgan'
import cors from 'cors'
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

app.use(cors())
app.use(morgan('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

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


//Database connection + Server
conn()
app.listen(process.env.PORT, ()=>{
    console.log(`http://localhost:${process.env.PORT}/`)
})