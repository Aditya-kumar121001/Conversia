"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const conn_1 = require("./database/conn");
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/auth", auth_1.default);
app.get("/", (req, res) => {
    const html = `<html>
      <body style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
        <div style="max-width:500px; margin:auto; background:black; padding:20px; border-radius:8px;">
          <h2 style="color:white;">Your Conversia login code</h2>
          <p style="color:white;">Hello,</p>
          <p style="color:white;">Use the code below to sign in as <b>aditya@gmail.com</b>:</p>
          <p style="font-size:24px; font-weight:bold; letter-spacing:4px; background:#f3f4f6; padding:10px 20px; border-radius:6px; display:inline-block;">236401</p>
          <p style="color:#6b7280; font-size:14px;">This code is valid for ~30 seconds.</p>
          <p style="color:#9ca3af; font-size:12px;">If you didn’t request this, you can safely ignore this email.</p>
        </div>
      </body>
    </html>`;
    res.send(html);
});
//Database connection + Server
(0, conn_1.conn)();
app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}/`);
});
//# sourceMappingURL=app.js.map