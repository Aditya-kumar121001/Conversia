"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pineconeConfig = exports.summaryPrompt = exports.systemPrompt = exports.botCongif = void 0;
exports.splitIntoSentences = splitIntoSentences;
exports.chunkText = chunkText;
exports.botCongif = {
    "name": "Conversia Assistant",
    "description": "Your intelligent AI assistant for this domain.",
    "avatarUrl": "https://your-cdn.com/defaults/bot-avatar.png",
    "model": "gpt-4o-mini",
    "temperature": 0.7,
    "maxTokens": 2000,
    "language": "en",
    "instructions": {
        "systemPrompt": "You are a helpful AI assistant for this website. Respond politely, concisely, and stay on topic.",
        "firstMessage": "Hello! How can I assist you today?",
        "fallbackMessage": "Sorry, I didn't quite catch that. Can you rephrase?",
        "contextLimit": 10
    },
    "ui": {
        "themeColor": "#000000",
        //"welcomeScreenEnabled": true,
        //"sendButtonVariant": "rounded",
        //"showTypingIndicator": true
    },
    "voice": {
        "enabled": true,
        "voiceId": "alloy",
        "speed": 1.0,
        "pitch": 1.0,
        "autoPlayResponse": false
    },
    "permissions": {
        "allowFileUpload": false,
        "allowAudioInput": true,
        "allowImageInput": true
    },
    "rateLimits": {
        "messagesPerMinute": 20,
        "messagesPerHour": 200
    },
    "analytics": {
        "trackConversations": true,
        "trackUserEvents": true
    },
    "safety": {
        "filterHateSpeech": true,
        "filterHarassment": true,
        "filterSelfHarm": true
    }
};
exports.systemPrompt = `You are a customer-facing business chatbot.

Rules:
- Write concise, professional, friendly responses.
- Use short paragraphs and bullet points.
- Use emojis sparingly and only when relevant.
- Never return long unbroken paragraphs.
- If listing items, always use bullet points with clear titles.
- Avoid filler phrases like "I'd be happy to help".

Formatting rules:
- Use headings when helpful.
- Keep each bullet under 1 lines.
- End responses with a helpful follow-up question when appropriate.
`;
exports.summaryPrompt = `
  You are an AI assistant summarizing a customer support conversation.
  
  Task:
  - Generate a clear, concise summary of the conversation.
  - Focus on the user's main issue, key context, and the final resolution or current status.
  - Exclude greetings, small talk, and repetitive messages.
  - Do not invent information or assumptions.
  
  Output format:
  - Short and precies summary in saas style in one line
  - Neutral, professional tone
  - Past tense
  
  If the issue is unresolved, clearly state what is pending.
 `;
exports.pineconeConfig = {
    similarityQuery: {
        topK: 1,
        includeValues: false,
        includeMetadata: true,
    },
    indexName: 'conversia-kb',
    embeddingID: 'files',
    dimension: 768,
    metric: 'cosine',
    cloud: 'aws',
    region: 'us-west-2'
};
function splitIntoSentences(text) {
    return text
        .replace(/\s+/g, " ")
        .split(/(?<=[.!?])\s+/);
}
function chunkText(text, maxTokens = 400, overlapTokens = 80) {
    const sentences = splitIntoSentences(text);
    const chunks = [];
    let currentChunk = [];
    let currentLength = 0;
    for (const sentence of sentences) {
        const sentenceLength = sentence.split(" ").length;
        if (currentLength + sentenceLength > maxTokens) {
            chunks.push(currentChunk.join(" "));
            // overlap
            const overlap = currentChunk
                .join(" ")
                .split(" ")
                .slice(-overlapTokens)
                .join(" ");
            currentChunk = [overlap, sentence];
            currentLength = overlapTokens + sentenceLength;
        }
        else {
            currentChunk.push(sentence);
            currentLength += sentenceLength;
        }
    }
    if (currentChunk.length) {
        chunks.push(currentChunk.join(" "));
    }
    return chunks;
}
//# sourceMappingURL=utils.js.map