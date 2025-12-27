import { GoogleGenerativeAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { drawings, promptClues } = req.body;

    if (!drawings || !Array.isArray(drawings)) {
      return res.status(400).json({ error: "Missing drawings" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-image" });

    const prompt = `
You are combining multiple terrible drawings into one cohesive, humorous illustration.

Rules:
- Embrace imperfection
- Make it funny, not beautiful
- Exaggerate mistakes
- Do NOT add text to the image

Prompt clues:
${promptClues?.join("\n") ?? "None provided"}
`;

    const result = await model.generateContent([
      { text: prompt },
      ...drawings.map((img: string) => ({
        inlineData: {
          data: img.split(",")[1],
          mimeType: "image/png"
        }
      }))
    ]);

    const image = result.response.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData
    )?.inlineData?.data;

    if (!image) {
      throw new Error("No image returned");
    }

    res.status(200).json({
      image: `data:image/png;base64,${image}`
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to combine images" });
  }
}
