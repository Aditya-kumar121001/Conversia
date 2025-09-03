"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUser = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreateUser = zod_1.default.object({
    email: zod_1.default.email()
});
//# sourceMappingURL=types.js.map