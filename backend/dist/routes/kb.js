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
const pinecone_1 = require("@pinecone-database/pinecone");
const utils_1 = require("../utils");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const upload_1 = require("../middlewares/upload");
const pdf_parse_1 = require("pdf-parse");
const utils_2 = require("../utils");
const genai_1 = require("@google/genai");
const KnowlodgeBase_1 = require("../models/KnowlodgeBase");
const router = (0, express_1.Router)();
const pc = new pinecone_1.Pinecone({
    apiKey: process.env.PINECONE
});
const aiClient = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI });
//CREATE KNOWLODGE BASE
router.post("/create-kb", authMiddleware_1.authMiddleware, upload_1.upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userId || !req.file) {
        return res.status(400).json({ message: "Invalid request" });
    }
    const { originalname, mimetype, size, path } = req.file;
    //Create File
    const file = yield KnowlodgeBase_1.File.create({
        userId: req.userId,
        fileName: originalname,
        fileType: mimetype,
        size,
        status: "Processing",
    });
    console.log(file);
    //File Parsing
    const pdfParse = new pdf_parse_1.PDFParse({ url: path });
    const parsedText = yield pdfParse.getText();
    const chunks = (0, utils_2.chunkText)(parsedText.text);
    //Create Embedding
    const index = pc.index(utils_1.pineconeConfig.indexName);
    const vectors = yield Promise.all(chunks.map((chunk, i) => __awaiter(void 0, void 0, void 0, function* () {
        const emb = yield aiClient.models.embedContent({
            model: "gemini-embedding-001",
            contents: chunk,
            config: {
                outputDimensionality: 768,
            },
        });
        return {
            id: `kb-${file._id}-${i}`,
            values: emb.embeddings[0].values,
            metadata: {
                userId: req.userId.toString(),
                fileId: file._id.toString(),
                sourceName: originalname.toLowerCase(),
                embeddingID: "files",
                text: chunk,
            },
        };
    })));
    yield index.upsert(vectors);
    //Find existing KB
    let kb = yield KnowlodgeBase_1.KnowledgeBase.findOne({ userId: req.userId });
    console.log(kb);
    if (!kb) {
        //Create KB if it does not exist
        kb = yield KnowlodgeBase_1.KnowledgeBase.create({
            userId: req.userId,
            name: "Default Knowledge Base",
            fileIds: [file._id],
        });
    }
    else {
        //Push file if not already present
        const fileIdStr = file._id.toString();
        if (!kb.fileIds.some(id => id.toString() === fileIdStr)) {
            kb.fileIds.push(file._id);
            yield kb.save();
        }
    }
    // update status to Processed
    file.status = "Processed";
    yield file.save();
    res.status(201).json({ success: true });
}));
//GET ALL KBs
router.get("/all-kb", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        return res.status(403).json({ message: "Unauthorized User" });
    }
    try {
        const KB = yield KnowlodgeBase_1.KnowledgeBase.findOne({ userId })
            .populate("fileIds")
            .lean();
        res.status(200).json({
            success: true,
            KBs: KB ? [KB] : [],
        });
    }
    catch (error) {
        console.error("Fetch KB error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch knowledge bases",
        });
    }
}));
exports.default = router;
//# sourceMappingURL=kb.js.map