
const axios = require('axios');

const chat = async (req, res) => {
  const { message, history } = req.body;
  const geminiKey = process.env.GEMINI_API_KEY;
  const hfToken = process.env.HUGGINGFACE_API_KEY;

  const getMockResponse = (msg, error = null) => {
    const lower = msg.toLowerCase();
    const errorInfo = error ? ` [DEBUG: ${error}]` : '';
    
    if (lower.includes("hello") || lower.includes("hi")) {
      return `Hello! I'm your AI assistant. I'm currently running in 'Lite Mode' due to a configuration issue.${errorInfo} How can I help you today?`;
    } else if (lower.includes("price") || lower.includes("cost")) {
      return `Our courses are very affordable, starting from ₹2,499. Check the 'Course Catalog' for details!${errorInfo}`;
    } else if (lower.includes("java")) {
      return `Java is a great choice! We have professional Java courses. Is there something specific you'd like to know about Java?${errorInfo}`;
    } else {
      return `I'm currently in 'Lite Mode' because I'm having trouble connecting to my full engine.${errorInfo} For now, I can answer basic questions!`;
    }
  };

  let lastError = null;
  // 1. Try Gemini first (If Key exists)
  if (geminiKey && geminiKey.length > 20) {
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(geminiKey);
      
      // Try multiple model identifiers as some environments have different availability
      const modelNames = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
      let success = false;
      let aiResponse = "";

      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const chatSession = model.startChat({
            history: history || [],
            generationConfig: { maxOutputTokens: 500 },
          });

          const prompt = `You are a helpful AI assistant for Kodnest LMS. The student says: ${message}. Keep it concise.`;
          const result = await chatSession.sendMessage(prompt);
          aiResponse = result.response.text();
          success = true;
          break; // Found a working model
        } catch (mErr) {
          console.error(`Gemini Model ${modelName} failed:`, mErr.message);
          lastError = `Gemini (${modelName}): ${mErr.message}`;
        }
      }

      if (success) {
        return res.json({ response: aiResponse.trim() });
      }
    } catch (error) {
      console.error("AI Gemini initialization error:", error.message);
      lastError = `Gemini Init: ${error.message}`;
    }
  }


  // 2. Try HuggingFace Fallback (If Gemini failed or key missing)
  if (hfToken && hfToken.startsWith('hf_')) {
    try {
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        { inputs: `<s>[INST] You are a helpful AI assistant for Kodnest LMS. The student says: ${message}. Keep it concise. [/INST]` },
        { headers: { Authorization: `Bearer ${hfToken}` }, timeout: 8000 }
      );
      
      if (response.data && response.data[0] && response.data[0].generated_text) {
        let text = response.data[0].generated_text;
        // Clean up Mistral output if it includes the prompt
        if (text.includes('[/INST]')) {
          text = text.split('[/INST]')[1].trim();
        }
        return res.json({ response: text });
      }
    } catch (error) {
      console.error("AI HuggingFace Fallback Error:", error.message);
      lastError = lastError ? `${lastError} | HF: ${error.message}` : `HF: ${error.message}`;
    }
  } else if (!geminiKey) {
    lastError = "Missing API Keys";
  }

  // 3. Final Mock Fallback
  res.json({ response: getMockResponse(message, lastError) });

};

module.exports = { chat };

