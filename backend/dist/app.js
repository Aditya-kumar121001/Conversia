"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default("3000"),
    JWT: zod_1.z.string().min(1, "JWT secret is required"),
    ENV: zod_1.z.string().default("development"),
    DATABASE_URL: zod_1.z.string().min(1, "DATABASE_URL is required"),
    ELEVEN: zod_1.z.string().min(1, "ElevenLabs API key is required"),
    GEMINI: zod_1.z.string().min(1, "Gemini API key is required"),
    PINECONE: zod_1.z.string().min(1, "Pinecone API key is required"),
    POSTMARK: zod_1.z.string().min(1, "Postmark API key is required"),
    FROM_EMAIL: zod_1.z.string().email("A valid FROM_EMAIL is required"),
});
const envParsed = envSchema.safeParse(process.env);
if (!envParsed.success) {
    console.error("Invalid environment variables:", envParsed.error.format());
    process.exit(1);
}
const morgan_1 = __importDefault(require("morgan"));
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
const plan_1 = __importDefault(require("./routes/plan"));
const conn_1 = require("./database/conn");
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
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
app.use("/workflow", execution_1.default);
app.use("/bot", bot_1.default);
app.use("/kb", kb_1.default);
app.use("/plan", plan_1.default);
//Database connection + Server
(0, conn_1.conn)();
app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}/`);
});
//# sourceMappingURL=app.js.map