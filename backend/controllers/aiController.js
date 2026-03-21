

const chat = async (req, res) => {
  const { message, history } = req.body;
  const hfToken = process.env.HUGGINGFACE_API_KEY;

  const getMockResponse = (msg, error = null) => {
    const lower = msg.toLowerCase();
    if (lower.includes("hello") || lower.includes("hi")) {
      return "Hello! I'm your AI assistant. Currently, I'm running in 'Lite Mode', but I can still help you with basic questions!";
    } else if (lower.includes("price") || lower.includes("cost")) {
      return "Our courses are very affordable, starting from ₹2,499. Check the 'Course Catalog' for details!";
    } else if (lower.includes("java")) {
      return "Java is a great choice! We have professional Java courses. Is there something specific you'd like to know about Java?";
    } else {
      return `I'm currently in 'Lite Mode' because I encountered a problem connecting to my dynamic brain. ${error ? `(Error: ${error})` : 'For now, I can answer basic questions about our LMS!'}`;
    }
  };

  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const apiKey = process.env.GEMINI_API_KEY || process.env.HUGGINGFACE_API_KEY; // Fallback to either

    if (!apiKey || apiKey.length < 20) {
      return res.json({ response: getMockResponse(message, "Missing valid API Key (GEMINI_API_KEY)") });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chatSession = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const prompt = `You are a helpful AI assistant for Kodnest LMS. The student says: ${message}. Keep it concise.`;
    const result = await chatSession.sendMessage(prompt);
    const aiResponse = result.response.text();
    
    res.json({ response: aiResponse.trim() });

  } catch (error) {
    console.error("AI Gemini Error:", error);
    res.json({ response: getMockResponse(message, error.message) });
  }
};

module.exports = { chat };
