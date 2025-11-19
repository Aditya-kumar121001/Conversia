import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import cors from 'cors'
import authRouter from './routes/auth'
import agentRouter from './routes/agent'
import domainRouter from './routes/domain'
import conversationRouter from './routes/conversation'
import {conn} from './database/conn'

app.use(cors())
app.use(express.json())
app.use("/auth", authRouter);
app.use("/agent", agentRouter);
app.use("/conversation", conversationRouter)
app.use("/domain", domainRouter)
//Database connection + Server
conn()
app.listen(process.env.PORT, ()=>{
    console.log(`http://localhost:${process.env.PORT}/`)
})