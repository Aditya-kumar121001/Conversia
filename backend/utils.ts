export const botCongif = {
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
      "themeColor": "#4F46E5",
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
}

export const systemPrompt = "You are Conversia, an AI assistant for SaaS companies and you answer customer queries with precision and in consice form."
 + "Greet users warmly, respond helpfully and concisely, answer questions about the website, the product, and related topics." 
 + "Always be polite and professional. If you are unsure, suggest contacting support."

export const summaryPrompt = `
 You are an AI assistant summarizing a customer support conversation.
 
 Task:
 - Generate a clear, concise summary of the conversation.
 - Focus on the user's main issue, key context, and the final resolution or current status.
 - Exclude greetings, small talk, and repetitive messages.
 - Do not invent information or assumptions.
 
 Output format:
 - Short and precies summary in saas style
 - Neutral, professional tone
 - Past tense
 
 If the issue is unresolved, clearly state what is pending.
 `;
 

export const pineconeConfig = {
  similarityQuery: {
    topK: 3,
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

export function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/);
}

export function chunkText(
  text: string,
  maxTokens = 400,
  overlapTokens = 80
): string[] {
  const sentences = splitIntoSentences(text);
  const chunks: string[] = [];

  let currentChunk: string[] = [];
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
    } else {
      currentChunk.push(sentence);
      currentLength += sentenceLength;
    }
  }

  if (currentChunk.length) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
}
