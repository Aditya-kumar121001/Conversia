export type ConversationStatus = {
    status: "OPEN" | "FINISH"
}

export type Message = {
    conversationId: string;
    role: "user" | "bot";
    content: string;
    createdAt: string;  
    updatedAt: string;
};

export type Conversation = {
    _id: string;
    email: string;
    domain: string;
    messages: string[];
    status: ConversationStatus;
    rating: number;
    summary: string;
    lastMessageAt: string;
    createdAt: string;
    updatedAt: string;
};
export type KBFile = {
    _id: string;
    fileName: string;
    fileType: string;
    size: number;
    status: "processing" | "processed" | "failed";
    createdAt: string;
};
  
export type KnowledgeBaseEntry = {
    _id: string;
    userId: string;
    name?: string;
    description?: string;
    fileIds: KBFile[];
    tags: string[];
    usageCount: number;
    createdAt: string;
    updatedAt?: string;
};
  
export const ACCEPTED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

export const ACCEPTED_FILE_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".md", ".xls", ".xlsx"];