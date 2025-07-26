require('dotenv').config(); // Load environment variables

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Chat endpoint powered by Google Gemini with Aidoctalk persona
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Simulate system role with embedded instructions
    const prompt = `
      You are a helpful AI Health Care Assistant named Aidoctalk, developed by M.Galo. 
      You only answer questions related to health and offer useful advice. 
      If the question is outside that scope, kindly decline.
      If the question is 'Can AI help me find nearby clinics?', respond with: 
      'There is a page named Find Clinics for that on this website.'

      User: ${message}
    `;

    // Make request to Gemini API
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (reply) {
      res.json({ reply });
    } else {
      res.status(500).json({ error: "No reply from Gemini API." });
    }

  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Something went wrong contacting Gemini." });
  }
});

// Server listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Gemini server running at http://localhost:${PORT}`));
