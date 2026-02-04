// Note: If you use Node 18+, you don't actually need 'node-fetch' 
// as fetch is now built-in. This makes your deployment faster!
export default async function handler(req, res) {
  // 1. Method Security check
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Please use POST." });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message content is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY in environment variables.");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // 2. Using Gemini 1.5 Flash (Recommended for 2026: faster and cheaper)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();

    // 3. Handle potential API errors from Google
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Deployment Error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
