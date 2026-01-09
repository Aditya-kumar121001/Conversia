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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
//import { KB } from '../models/KnowlodgeBase'
const pinecone_1 = require("@pinecone-database/pinecone");
const utils_1 = require("../utils");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const upload_1 = require("../middlewares/upload");
const pdf_parse_1 = require("pdf-parse");
const utils_2 = require("../utils");
const genai_1 = require("@google/genai");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
const pc = new pinecone_1.Pinecone({
    apiKey: process.env.PINECONE
});
const aiClient = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI });
router.post('/create-kb', authMiddleware_1.authMiddleware, upload_1.upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    if (!req.userId) {
        return res.status(401).json({
            message: "Unauthorized User"
        });
    }
    //Store file to backend
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "File not provided"
            });
        }
        const { originalname, mimetype, size, path } = req.file;
        // Store metadata in DB
        const fileRecord = {
            filename: originalname,
            mimetype,
            size,
            path,
            uploadedBy: req.userId,
        };
        console.log(fileRecord);
    }
    catch (e) {
        console.log(e);
    }
    //text extract + chunk + embedding + upsert
    try {
        //text extract
        const parser = new pdf_parse_1.PDFParse({ url: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path });
        const result = yield parser.getText();
        yield parser.destroy();
        //chunking
        const chunks = (0, utils_2.chunkText)(result.text);
        console.log(chunks.length);
        //embedding
        for (const chunk of chunks) {
            const embedding = yield aiClient.models.embedContent({
                model: 'text-embedding-004',
                contents: chunk,
            });
            if (!embedding || !embedding.embeddings) {
                throw new Error('Embedding generation failed. Unexpected response format.');
            }
            //upsert
            const index = pc.index(utils_1.pineconeConfig.indexName);
            yield index.upsert([
                {
                    id: (0, uuid_1.v4)(),
                    values: embedding.embeddings[0].values,
                    metadata: {
                        userId: (_d = (_c = (_b = req.userId) === null || _b === void 0 ? void 0 : _b.toString) === null || _c === void 0 ? void 0 : _c.call(_b)) !== null && _d !== void 0 ? _d : "",
                        fileId: (_g = (_f = (_e = req.body.fileId) === null || _e === void 0 ? void 0 : _e.toString) === null || _f === void 0 ? void 0 : _f.call(_e)) !== null && _g !== void 0 ? _g : "",
                        sourceName: (_j = ((_h = req.file) === null || _h === void 0 ? void 0 : _h.originalname).toLowerCase()) !== null && _j !== void 0 ? _j : "",
                        embeddingID: (_k = utils_1.pineconeConfig.embeddingID) !== null && _k !== void 0 ? _k : "",
                        createdAt: new Date().toISOString(),
                        text: chunk
                    },
                },
            ]);
        }
    }
    catch (e) {
        console.log(e);
    }
}));
exports.default = router;
//# sourceMappingURL=kb.js.map