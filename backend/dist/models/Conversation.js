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
exports.Conversation = exports.ConversationStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ConversationStatus;
(function (ConversationStatus) {
    ConversationStatus["OPEN"] = "OPEN";
    ConversationStatus["FINISH"] = "FINISH";
})(ConversationStatus || (exports.ConversationStatus = ConversationStatus = {}));
const conversationSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        index: true,
    },
    domain: {
        type: String,
        required: true,
        index: true,
    },
    messages: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Message",
        },
    ],
    status: {
        type: String,
        enum: Object.values(ConversationStatus),
        default: ConversationStatus.OPEN,
        index: true,
    },
    rating: {
        type: Number,
        required: true,
        default: 0
    },
    summary: {
        type: String,
        default: ""
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, { timestamps: true });
//allow multiple conversation per user and only one active conversation
conversationSchema.index({ email: 1, domain: 1, status: 1 }, {
    unique: true,
    partialFilterExpression: { status: "OPEN" },
});
exports.Conversation = mongoose_1.default.model("Conversation", conversationSchema);
//# sourceMappingURL=Conversation.js.map