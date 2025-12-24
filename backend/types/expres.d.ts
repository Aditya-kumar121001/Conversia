// backend/types/express.d.ts
import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      userId?: string | Types.ObjectId;
    }
  }
}

export {};
