import fetch from "node-fetch";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userMsg = req.body.message;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "API key missing" });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are Swastha AI, a helpful nutrition assistant." },
            { role: "user", content: userMsg }
          ]
        })
      }
    );

    const data = await response.json();

    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

