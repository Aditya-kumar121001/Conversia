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
    CORS_ORIGINS: zod_1.z.string().default("http://localhost:5173"),
});
const envParsed = envSchema.safeParse(process.env);
if (!envParsed.success) {
    console.error("Invalid environment variables:", envParsed.error.format());
    process.exit(1);
}
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const rateLimiter_1 = require("./middlewares/rateLimiter");
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
// ── Security headers ────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
// ── CORS — locked to production origins ─────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map(o => o.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. server-to-server, mobile apps, curl)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
}));
// ── Global rate limiter ─────────────────────────────────────────────────
app.use(rateLimiter_1.globalApiLimiter);
// ── Body parsing & logging ──────────────────────────────────────────────
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// ── Routes ──────────────────────────────────────────────────────────────
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
// ── Global error handler ────────────────────────────────────────────────
// Must be after all routes — Express identifies error handlers by their 4-arg signature
app.use((err, _req, res, _next) => {
    var _a;
    // CORS rejection from the origin callback
    if ((_a = err.message) === null || _a === void 0 ? void 0 : _a.includes("not allowed by CORS")) {
        return res.status(403).json({ success: false, message: "CORS: origin not allowed" });
    }
    console.error("Unhandled error:", err.stack || err.message);
    return res.status(500).json({
        success: false,
        message: process.env.ENV === "development" ? err.message : "Internal server error",
    });
});
// ── Database connection + Server ────────────────────────────────────────
(0, conn_1.conn)();
app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}/`);
});
//# sourceMappingURL=app.js.map