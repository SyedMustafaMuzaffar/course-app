const { GoogleGenerativeAI } = require("@google/generative-ai");

const chat = async (req, res) => {
  const { message, history } = req.body;
  const hfToken = process.env.HUGGINGFACE_API_KEY;

  const getMockResponse = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes("hello") || lower.includes("hi")) {
      return "Hello! I'm your AI assistant. Currently, I'm running in 'Lite Mode' because there's an issue with the AI configuration. How can I help you with your learning today?";
    } else if (lower.includes("price") || lower.includes("cost")) {
      return "Our courses are very affordable, starting from ₹2,499. Check the 'Course Catalog' for details!";
    } else if (lower.includes("java")) {
      return "Java is a great choice! We have professional Java courses. Is there something specific you'd like to know about Java?";
    } else {
      return "I'm currently in 'Lite Mode' due to an AI configuration issue. Once the API Key is fixed, I can provide full dynamic support. For now, I can answer basic questions about our LMS!";
    }
  };

  try {
    if (!hfToken || hfToken === 'your_huggingface_api_key_here') {
      return res.json({ response: getMockResponse(message) });
    }

    // Using Hugging Face Inference API via the recommended router
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        headers: { Authorization: `Bearer ${hfToken}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] You are a helpful AI assistant for an LMS (Learning Management System). 
          Keep your responses concise and helpful for students. 
          User asks: ${message} [/INST]`,
          parameters: { max_new_tokens: 500, return_full_text: false }
        }),
      }
    );

    const result = await response.json();
    
    if (result.error) {
      console.error("HF API Error Response:", result);
      throw new Error(result.error);
    }

    const aiResponse = result[0]?.generated_text || getMockResponse(message);
    res.json({ response: aiResponse.trim() });

  } catch (error) {
    console.error("AI Error:", error);
    // Fallback to mock on any real API error
    res.json({ response: getMockResponse(message) });
  }
};

module.exports = { chat };
