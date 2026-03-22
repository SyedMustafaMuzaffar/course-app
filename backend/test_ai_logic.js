const { chat } = require('./controllers/aiController');
const express = require('express');
const app = express();
app.use(express.json());

// Mock request and response
const req = {
  body: {
    message: "hello",
    history: []
  }
};

const res = {
  json: (data) => {
    console.log("AI Response:", JSON.stringify(data, null, 2));
  }
};

// Set mock environment
process.env.HUGGINGFACE_API_KEY = "hf_test";
process.env.GEMINI_API_KEY = ""; // Missing

console.log("Testing AI fallback logic...");
chat(req, res).catch(err => console.error(err));
