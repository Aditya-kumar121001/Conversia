import express from "express";
const app = express()
import dotenv from "dotenv";
dotenv.config();


app.get("/", (req, res) => {
    res.send("Let's start Building")
})

app.listen(process.env.PORT, ()=>{
    console.log(`http://localhost:${process.env.PORT}/`)
})