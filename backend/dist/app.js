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
const agent_1 = __importDefault(require("./routes/agent"));
const domain_1 = __importDefault(require("./routes/domain"));
const conversation_1 = __importDefault(require("./routes/conversation"));
const execution_1 = __importDefault(require("./routes/execution"));
const bot_1 = __importDefault(require("./routes/bot"));
const kb_1 = __importDefault(require("./routes/kb"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const waitlist_1 = __importDefault(require("./routes/waitlist"));
const conn_1 = require("./database/conn");
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use("/waitlist", waitlist_1.default);
app.use("/dashboard", dashboard_1.default);
app.use("/auth", auth_1.default);
app.use("/agent", agent_1.default);
app.use("/conversation", conversation_1.default);
app.use("/domain", domain_1.default);
app.use("/execution", execution_1.default);
app.use("/bot", bot_1.default);
app.use("/kb", kb_1.default);
//Database connection + Server
(0, conn_1.conn)();
app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}/`);
});
//# sourceMappingURL=app.js.map