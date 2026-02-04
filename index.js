app.post("/chat", async (req, res) => {
  try {
    const userMsg = req.body.message;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "API key missing" });
    }

    // TEMP TEST (to check backend works)
    return res.json({
      reply: "Hello! Backend is working 🚀"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
