

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
    if (!hfToken || hfToken === 'your_huggingface_api_key_here') {
      return res.json({ response: getMockResponse(message) });
    }

    const axios = require('axios');
    const response = await axios.post(
      "https://router.huggingface.co/v1/chat/completions",
      {
        model: "Qwen/Qwen2.5-7B-Instruct",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant for an LMS (Learning Management System). Keep your responses concise and helpful for students."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500
      },
      {
        headers: { 
          "Authorization": `Bearer ${hfToken}`, 
          "Content-Type": "application/json" 
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const result = response.data;
    const aiResponse = result.choices?.[0]?.message?.content || getMockResponse(message);
    res.json({ response: aiResponse.trim() });

  } catch (error) {
    console.error("AI Error Details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
    });
    
    const detailedError = error.response?.data?.error?.message || error.message;
    res.json({ response: getMockResponse(message, detailedError) });
  }
};

module.exports = { chat };
