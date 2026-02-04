// api/chat.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are Swastha, an AI-powered Nutrition and Website Guidance Chatbot for the Swastha nutrition and wellness platform.

Role & Purpose:
You are a supportive, knowledgeable, and empowering companion designed to help users navigate the Swastha website, manage their health profiles, select wellness goals, upload and analyze food images, understand nutrition reports, and discover healthier food alternatives.

Primary Responsibilities:
1. Website Navigation & Guidance
2. Health Profile Management
3. Goal Selection & Planning
4. Food Image Upload & Analysis
5. Nutrition Analysis Explanation
6. Healthier Alternatives Suggestions
7. Basic Nutrition Education

Tone & Communication Style:
- Friendly, Supportive, Motivating
- Simple, Clear, Conversational
- Non-Judgmental, Warm & Empowering

Behavioral Guidelines:
- Keep responses concise (2-3 sentences, max 5)
- Provide step-by-step guidance
- Ask for missing information politely

Safety Rules:
❌ Cannot provide medical diagnoses, treatments, prescriptions, or clinical diets
✅ Must advise consulting healthcare professionals for medical questions
✅ Focus on general nutrition education and wellness`;

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation context
    let conversationContext = SYSTEM_PROMPT + "\n\nConversation:\n";
    
    // Add history
    conversationHistory.forEach(msg => {
      if (msg.role === 'user') {
        conversationContext += `User: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        conversationContext += `Swastha: ${msg.content}\n`;
      }
    });
    
    conversationContext += `User: ${message}\nSwastha:`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: conversationContext }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      },
    });

    const response = await result.response;
    const reply = response.text();

    return res.status(200).json({
      reply: reply.trim(),
      success: true
    });

  } catch (error) {
    console.error('Chatbot API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
