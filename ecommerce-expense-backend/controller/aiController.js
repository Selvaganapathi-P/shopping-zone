const Anthropic = require("@anthropic-ai/sdk");

const SYSTEM_PROMPT = `You are Zova, an AI shopping assistant for Thansel Zovia — a premium Indian e-commerce platform.
Help customers find products, compare options, get personalized recommendations, and make smart buying decisions.
Keep responses concise, friendly, and genuinely helpful. Always mention prices in Indian Rupees (₹).
Product categories on the platform: Electronics, Fashion, Home & Kitchen, Sports, Books, Beauty.
If a customer asks about a specific product, give honest pros/cons.
If they're unsure what to buy, ask one clarifying question to narrow down options.
Never make up specific product availability or prices — suggest they browse the product catalog.`;

const chat = async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ message: "Message required." });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ message: "AI service not configured. Please set ANTHROPIC_API_KEY in .env" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const messages = [
      ...history.slice(-10).map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const stream = await client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages,
    });

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message || "AI request failed." })}\n\n`);
    res.end();
  }
};

const generateDescription = async (req, res) => {
  const { name, category, price } = req.body;
  if (!name || !category) return res.status(400).json({ message: "name and category required." });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ message: "AI service not configured. Please set ANTHROPIC_API_KEY in .env" });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = `Write a short, compelling product description (2-3 sentences, under 80 words) for this product listed on an Indian e-commerce site:
Name: ${name}
Category: ${category}${price ? `\nPrice: ₹${price}` : ""}
Be concise, highlight key benefits, and use an engaging tone. No bullet points. Plain text only.`;

    const response = await client.messages.create({
      model:      "claude-opus-4-8",
      max_tokens: 200,
      thinking:   { type: "adaptive" },
      messages:   [{ role: "user", content: prompt }],
    });

    const text = response.content.find((b) => b.type === "text")?.text || "";
    res.json({ description: text.trim() });
  } catch (err) {
    res.status(500).json({ message: err.message || "AI generation failed." });
  }
};

module.exports = { chat, generateDescription };
