export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // The latest OpenAI model
        messages: req.body.messages,
        // If it's the Insights call, we want JSON mode
        ...(req.body.jsonMode && { response_format: { type: "json_object" } })
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to connect to OpenAI" });
  }
}
