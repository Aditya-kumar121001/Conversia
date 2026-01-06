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

const router = Router();
const pc = new Pinecone({
  apiKey: process.env.PINECONE
});
const aiClient = new GoogleGenAI({apiKey: process.env.GEMINI});

router.post('/create-kb', authMiddleware, upload.single("file") , async(req, res) => {
    if(!req.userId){
        return res.status(401).json({
            message: "Unauthorized User"
        })
    }
    //Store file to backend
    try{
      if(!req.file){
        return res.status(400).json({
            success: false,
            message: "File not provided"
        })
      }

      const {originalname, mimetype, size, path} = req.file;
      // Store metadata in DB
      const fileRecord = {
        filename: originalname,
        mimetype,
        size,
        path,
        uploadedBy: req.userId,
      };
      console.log(fileRecord)

    } catch(e){
        console.log(e)
    }

    //text extract + chunk + embedding + upsert
    try{
        //text extract
        const parser = new PDFParse({ url: req.file?.path });
        const result = await parser.getText();
        await parser.destroy();

        //chunking
        const chunks = chunkText(result.text)
        console.log(chunks.length)

        //embedding
        for(const chunk of chunks){
            const embedding = await aiClient.models.embedContent(
                { 
                    model: 'text-embedding-004',
                    contents: chunk,
                }
            );

            if (!embedding || !embedding.embeddings) {
              throw new Error('Embedding generation failed. Unexpected response format.');
            }
            
            //upsert
            const index = pc.index(pineconeConfig.indexName);
            await index.upsert([
                {
                  id: uuid4(),
                  values: embedding.embeddings[0].values,
                  metadata: {
                    userId: req.userId?.toString?.() ?? "",
                    fileId: req.body.fileId?.toString?.() ?? "",
                    sourceName: req.file?.originalname ?? "",
                    embeddingID: pineconeConfig.embeddingID ?? "",
                    createdAt: new Date().toISOString(),
                  },
                },
              ]);
        }
            
    } catch(e){
        console.log(e)
    }
});

export default router;