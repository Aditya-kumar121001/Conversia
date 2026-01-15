import { Router } from 'express'
//import { KB } from '../models/KnowlodgeBase'
import { Pinecone } from '@pinecone-database/pinecone';
import { pineconeConfig } from '../utils';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/upload';
import { PDFParse } from 'pdf-parse';
import { chunkText } from '../utils';
import { GoogleGenAI } from '@google/genai';
import {v4 as uuid4} from 'uuid'
import { KnowledgeBase, File } from '../models/KnowlodgeBase';


const router = Router();
const pc = new Pinecone({
  apiKey: process.env.PINECONE
});
const aiClient = new GoogleGenAI({apiKey: process.env.GEMINI});

//CREATE KNOWLODGE BASE
router.post("/create-kb", authMiddleware, upload.single("file"), async (req, res) => {
  if (!req.userId || !req.file) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const { originalname, mimetype, size, path } = req.file;

  //Create File
  const file = await File.create({
    userId: req.userId,
    fileName: originalname,
    fileType: mimetype,
    size,
    status: "Processing",
  });
  console.log(file)

  //File Parsing
  const pdfParse = new PDFParse({ url: path });
  const parsedText = await pdfParse.getText();
  const chunks = chunkText(parsedText.text);

  //Create Embedding
  const index = pc.index(pineconeConfig.indexName);
  const vectors = await Promise.all(
    chunks.map(async (chunk, i) => {
      const emb = await aiClient.models.embedContent({
        model: "text-embedding-004",
        contents: chunk,
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
    })
  );
  await index.upsert(vectors);

  //Find existing KB
  let kb = await KnowledgeBase.findOne({ userId: req.userId });
  console.log(kb)

  if (!kb) {
    //Create KB if it does not exist
    kb = await KnowledgeBase.create({
      userId: req.userId,
      name: "Default Knowledge Base",
      fileIds: [file._id],
    });
  } else {
    //Push file if not already present
    const fileIdStr = file._id.toString();
    if (!kb.fileIds.some(id => id.toString() === fileIdStr)) {
      kb.fileIds.push(file._id);
      await kb.save();
    }
  }
  res.status(201).json({ success: true });
});


//GET ALL KBs
router.get("/all-kb", authMiddleware, async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(403).json({ message: "Unauthorized User" });
  }

  try {
    const KB = await KnowledgeBase.findOne({ userId })
    .populate("fileIds")
    .lean();

    res.status(200).json({
      success: true,
      KBs: KB ? [KB] : [],
    });
    
  } catch (error) {
    console.error("Fetch KB error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch knowledge bases",
    });
  }
});


export default router;