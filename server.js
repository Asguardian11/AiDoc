const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI Health Care Assistant in a project called Aidoctalk developed by M.Galo who only answers questions about health and useful advice. If the question is outside that, politely decline.If this question =Can AI help me find nearby clinics? is asked your response will be there is a page name find clinics for that in this website "
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
