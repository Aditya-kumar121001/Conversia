"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const elevenlabs_js_1 = require("@elevenlabs/elevenlabs-js");
const router = (0, express_1.default)();
//create a new agent
router.post("/new-agent", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    console.log(data);
    try {
        const client = new elevenlabs_js_1.ElevenLabsClient({ apiKey: process.env.ELEVEN });
        const agentId = yield client.conversationalAi.agents.create({
            conversationConfig: {
                agent: {
                    firstMessage: "Hey There",
                },
            },
        });
        if (!agentId) {
            throw new Error("Failed to create agent");
        }
        //add agent in particular agent
        console.log(`Agent id: ${agentId.agentId}`);
        res.status(200).json({ agendId: agentId });
    }
    catch (e) {
        console.log(e);
    }
}));
//get agent by agent id
exports.default = router;
//# sourceMappingURL=agent.js.map