"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const botSchema = new mongoose_1.Schema({
    domainId: { type: String, ref: "Domain", required: true },
    domainName: { type: String, required: true },
    botType: { type: String, required: true },
    generalSettings: {
        type: {
            systemPrompt: { type: String, required: false, default: "" },
            firstMessage: { type: String, required: false, default: "" },
            fallbackMessage: { type: String, required: false, default: "" },
            starters: { type: [String], default: [] },
        },
        required: false,
        default: undefined,
    },
    appearance_settings: {
        type: {
            themeColor: { type: String, required: false, default: "#000000" },
            fontSize: { type: String, required: false, default: "14" },
            logoUrl: { type: String, required: false, default: "" }
        },
        required: false,
        default: undefined,
    },
    language: { type: String, required: false, default: "en" },
}, { timestamps: true });
exports.Bot = mongoose_1.default.model("Bot", botSchema);
//# sourceMappingURL=Bot.js.map