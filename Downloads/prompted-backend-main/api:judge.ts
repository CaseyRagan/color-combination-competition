import { GoogleGenerativeAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { captions, judgeMode } = req.body;

    if (!captions || !Array.isArray(captions)) {
      return res.status(400).json({ error: "Missing captions" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const tone =
      judgeMode === "playful"
        ? "gentle, silly, encouraging"
        : judgeMode === "unhinged"
        ? "absurd, chaotic but friendly"
        : "witty, playful, mildly savage";

    const prompt = `
You are a judge in a party game.
Pick ONE winning caption.
Return a JSON object only.

Rules:
- Roast the output, not the person
- Be short
- Be quotable
- Take partial blame sometimes

Tone: ${tone}

Captions:
${captions.map((c: any, i: number) => `${i + 1}. ${c.text}`).join("\n")}

Respond with:
{
  "winnerIndex": number,
  "oneLiner": string
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = JSON.parse(text);

    res.status(200).json(parsed);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to judge captions" });
  }
}
