import dotenv from "dotenv";

dotenv.config();

const GROK_API_KEY = process.env.GROQ_API_KEY;
const GROK_MODEL = "grok-2"; // x.ai Grok model

export const queryChatbot = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.toString().trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!GROK_API_KEY) {
      return res.status(500).json({
        error:
          "x.ai Grok API key is not configured. Please add GROQ_API_KEY to .env file.",
      });
    }

    console.log(
      "[chatbot] Sending request to x.ai Grok API with model:",
      GROK_MODEL,
    );

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          {
            role: "user",
            content: text.toString(),
          },
        ],
        stream: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "[chatbot] x.ai Grok API error:",
        JSON.stringify(data, null, 2),
      );
      return res.status(response.status || 500).json({
        error:
          data.error?.message ||
          data.message ||
          "Failed to reach x.ai Grok API",
      });
    }

    const replyText = data.choices?.[0]?.message?.content || data.result;
    if (!replyText) {
      console.error(
        "[chatbot] No content in response:",
        JSON.stringify(data, null, 2),
      );
      return res.status(502).json({ error: "Invalid response from x.ai Grok" });
    }

    return res.status(200).json({ text: replyText });
  } catch (error) {
    console.error("[chatbot] queryChatbot error:", error);
    res.status(500).json({ error: "Chatbot request failed" });
  }
};
