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
//import agentRouter from './routes/agents'
const conn_1 = require("./database/conn");
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/auth", auth_1.default);
//app.use("/agent", agentRouter);
//Database connection + Server
(0, conn_1.conn)();
app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}/`);
});
//# sourceMappingURL=app.js.map