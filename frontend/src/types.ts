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
