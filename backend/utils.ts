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
  