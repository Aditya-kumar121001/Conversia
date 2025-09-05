"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    var _a;
    const authToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!authToken) {
        res.status(403).send({
            message: "Auth token invalid",
            success: false,
        });
        return;
    }
    try {
        const data = jsonwebtoken_1.default.verify(authToken, process.env.JWT_SECRET);
        req.userId = data.userId;
        next();
    }
    catch (e) {
        res.status(403).send({
            message: "Auth token invalid",
            success: false,
        });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map