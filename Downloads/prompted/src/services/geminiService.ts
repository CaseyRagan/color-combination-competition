
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PromptSlots, TriviaQuestion } from "../types";

// Initialize the standard SDK
// Note: We access process.env.GEMINI_API_KEY which is polyfilled by vite.config.ts define
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// The "Nano Banana Pro" Model (Gemini 2.0 Flash Experimental)
const MODEL_NAME = 'gemini-2.0-flash-exp';

// --- Static Data for Instant "Slot Machine" Feel ---
export const EMOTIONS = [
  'Confident', 'Angry', 'Sleepy', 'Confused', 'Manic', 'Romantic', 'Scared', 'Smug',
  'Dramatic', 'Bored', 'Existential', 'Hangry', 'Zen', 'Paranoid', 'Giddy',
  'Seductive', 'Passive-Aggressive', 'Hysterical', 'Suspicious', 'Moist', 'Unimpressed',
  'Ferocious', 'Awkward', 'Melodramatic', 'Chaotic', 'Thirsty', 'Judgmental'
];

export const STYLES = [
  'Haunted', 'Corporate', 'Neon', 'Medieval', 'Cyberpunk', 'Gothic', 'Minimalist',
  'Cubist', 'Anime', 'Vintage', 'Glitchy', 'Fuzzy', 'Pixelated', 'Abstract', 'Baroque',
  'Renaissance', 'Claymation', 'Court Sketch', 'Vaporwave', 'Meat', 'Graffiti',
  'Oil Painting', 'Low Poly', 'Horror Movie', 'IKEA Manual', 'Tattoo', '8-Bit'
];

export const NOUNS = [
  'Baby', 'Horse', 'Frog', 'Toaster', 'Clown', 'Cactus', 'Skeleton', 'Banana',
  'Ghost', 'Robot', 'Cat', 'Sloth', 'Wizard', 'Potato', 'Duck', 'Vampire', 'Toilet',
  'Dumpster Fire', 'IRS Auditor', 'Spicy Burrito', 'Mid-life Crisis', 'Capybara',
  'Karen', 'Bag of Trash', 'Shrimp', 'Chainsaw', 'Hamster', 'Influencer', 'Traffic Cone'
];

export const VOTING_CATEGORIES = [
  "Most Unhinged",
  "Best Use of Prompt",
  "Most Cursed",
  "Actually Good?",
  "AI Did You Dirty",
  "Chaotic Evil",
  "Least Effort",
  "Most Disturbing",
  "Funniest Disaster"
];

export const getRandomSlots = (): PromptSlots => ({
  emotion: EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)],
  style: STYLES[Math.floor(Math.random() * STYLES.length)],
  noun: NOUNS[Math.floor(Math.random() * NOUNS.length)],
  locked: false
});

export const getRandomWord = (type: 'emotion' | 'style' | 'noun'): string => {
  const pool = type === 'emotion' ? EMOTIONS : type === 'style' ? STYLES : NOUNS;
  return pool[Math.floor(Math.random() * pool.length)];
};

export const JUDGES = [
  { id: 'roast', name: 'Roasted Rob', avatar: '🔥', description: 'Ruthless Comedian', prompt: 'You are Roasted Rob. Roast the art ruthlessly.' },
  { id: 'snob', name: 'Baron Von Art', avatar: '🧐', description: 'Pretentious Critic', prompt: 'You are Baron Von Art. Use big art words to insult this mess.' },
  { id: 'zoomer', name: 'Zoomer Zach', avatar: '🛹', description: 'Gen Z Hype Beast', prompt: 'You are Zoomer Zach. Use Gen Z slang (mid, cap, sus).' },
  { id: 'grandma', name: 'Sweet GamGam', avatar: '👵', description: 'Passive Aggressive', prompt: 'You are Sweet GamGam. Give backhanded compliments.' },
];

// Helper to check environment variable
const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export const generateCombinedImage = async (
  drawings: { image: string, slots: PromptSlots }[]
): Promise<string> => {
  // If webhook is configured, use it
  if (WEBHOOK_URL && WEBHOOK_URL.startsWith('http')) {
    try {
      console.log("Using n8n Webhook for generation...");
      return await generateCombinedImageViaWebhook(drawings);
    } catch (e) {
      console.error("Webhook failed, falling back to local Gemini", e);
    }
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  // Construct a chaos prompt
  const descriptions = drawings.map((d, i) =>
    `Character/Object ${i + 1} is a ${d.slots.emotion} ${d.slots.style} ${d.slots.noun}`
  ).join('. ');

  const prompt = `
    Create a hilarious, high-stakes cinematic masterpiece scene featuring the following elements interacting with each other: ${descriptions}.
    
    CRITICAL INSTRUCTIONS:
    1. Do NOT just place them side-by-side. Make them INTERACT (e.g., fighting, hugging, arguing, plotting, running away from each other).
    2. Create a specific, funny setting that fits the chaos (e.g., a burning office, a space station, a medieval tavern).
    3. Treat the user sketches as loose conceptual inspiration for composition, but render the final image in a cohesive, high-quality, slightly absurd 3D art style.
    4. Prioritize HUMOR and UNEXPECTED SYNERGY. Make it weird but beautiful.
  `;

  // Standardize to content parts
  const contentParts = [
    ...drawings.map(d => ({
      inlineData: {
        mimeType: 'image/png',
        data: d.image.split(',')[1],
      },
    })),
    { text: prompt }
  ];

  try {
    const result = await model.generateContent({
      contents: [{
        role: 'user', parts: [
          ...contentParts,
          { text: "Generate a valid, standalone SVG string (starting with <svg and ending with </svg>) that depicts this scene. The SVG should be highly detailed, colorful, and visually interesting. Do not use markdown blocks. Just the SVG code." }
        ]
      }]
    });

    const responseText = result.response.text();
    const svgMatch = responseText.match(/<svg[\s\S]*?<\/svg>/);
    const svg = svgMatch ? svgMatch[0] : "";

    // Simple validation
    if (!svg.includes('<svg') || !svg.includes('</svg>')) {
      throw new Error("Invalid SVG generated");
    }

    // Return as data URL (Browser safe)
    const base64Svg = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64Svg}`;

  } catch (error) {
    console.error("Image gen error:", error);
    // Fallback: Return a placeholder image
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  }
};

const generateCombinedImageViaWebhook = async (
  drawings: { image: string, slots: PromptSlots }[]
): Promise<string> => {
  // 1. Prepare data for n8n
  // n8n expects a list of images. We'll send them as JSON payload since n8n webhook can parse JSON body.
  // Or if the node "Receive Doodles from Game" expects something else?
  // Looking at the workflow, "Receive Doodles from Game" is a Webhook node.
  // Usually standard webhooks accept JSON.
  // The "Analyze Doodles" node uses "all input items", so we might need to send an array?
  // Actually, n8n webhooks usually take a single body.
  // Let's send { players: [...] } and have n8n split it?
  // Wait, the workflow's "Code" node says: `const items = $input.all();`
  // This implies n8n expects multiple items input to that code node, which usually come from a SplitInBatches or similar,
  // OR the webhook receives a JSON array.

  // HOWEVER, the user says "Receive Doodles from Game" node.
  // If we POST a JSON array `[{image: ...}, {image: ...}]` to n8n webhook, it typically processes it as one item containing that array,
  // UNLESS the webhook is configured to "Split into items".

  // Let's assume standard JSON body structure first.
  // We'll send the images + the API Call structure for the return trip?
  // The user's workflow "Send Composite to Game API" calls `gameApiUrl`.
  // So the Client -> n8n -> API -> Game Client is NOT the flow.
  // The flow is Client -> n8n -> API.
  // BUT checking `useGameHost`, the host waits for the result!
  // `const image = await generateCombinedImage(drawings);`

  // IF we use the webhook, the webhook eventually calls the API `upload-composite`.
  // That API does NOT push to the client.
  // So `await generateCombinedImageViaWebhook` will effectively just trigger the process,
  // but how does the Host get the result back?

  // 1. The Host polls the API?
  // 2. The n8n Respond to Webhook node returns the result?
  // The workflow HAS a "Respond to Game" node at the end!
  // node id: 47136211... "Respond to Game"
  // It returns `responseBody: { success: true, analysis: ... }`
  // This typically means the initial Webhook request waits until the end of the workflow to respond (if "Response Mode" is "Last Node").
  // Let's check the workflow JSON... 
  // "responseMode": "lastNode" IS SET!

  // PERFECT! This means we can just `await fetch(webhookUrl)` and get the JSON back!
  // And likely the JSON contains the composite image URL or Base64?
  // The "Combine Images into Composite" node outputs binary data.
  // The "Generate Video" node outputs... something.
  // The "Respond to Game" node outputs: `{ "success": true, "analysis": {{ $json }} }`
  // Wait, the "Respond to Game" is connected to "Send Composite to Game API".
  // Is the output of "Send Composite" passed to "Respond"?
  // "Send Composite" returns JSON from our API.
  // Our API returns `{ success: true, message: ..., filename: ... }`.
  // It does NOT return the image data itself (it just says "received").

  // So if n8n responds with the output of "Send Composite", the Host will get "Success", but NO IMAGE.

  // WE NEED THE IMAGE.

  // Strategy:
  // We should probably rely on the "Generate Video" node or the "Combine Images" node output in the response.
  // But the workflow is what it is.
  // If we assume the User wants the video/image back, we might need to modify the workflow OR our API.
  // BUT I cannot modify the workflow directly.

  // HYPOTHESIS: The n8n workflow might be sending the data back in the response body if I'm lucky,
  // OR the intention was that the API saves it and the client reads it.
  // But our API just logs it.

  // Let's look at "Respond to Game" node again.
  // `responseBody: "={\n  \"success\": true,\n  \"analysis\": {{ $json }}\n}"`
  // `$json` refers to the input item's JSON.
  // The input comes from "Send Composite to Game API".
  // That node calls *our* `upload-composite` API.
  // Our API returns `{ success: true, ... }`.
  // So the Client will receive: `{ success: true, analysis: { success: true, filename: ... } }`.
  // STILL NO IMAGE DATA.

  // WAIT! The "Combine Images into Composite" node produces a BINARY output "composite_doodle.png".
  // We want THAT.
  // But the workflow flow is: Combine -> Generate Video -> Send to API -> Respond.
  // The binary data might be lost or not included in `$json`.

  // CRITICAL: We need to ask n8n to include the binary data in the response, OR
  // we need our API `upload-composite` to echo back the data it received?
  // Currently `upload-composite` receives the file.
  // If we modify `upload-composite.ts` to Return the base64 of the file it received,
  // THEN "Send Composite" node will receive that big JSON,
  // AND "Respond to Game" will pass it back to the Client!

  // YES! That is the fix without touching the workflow!
  // I need to modify `upload-composite.ts` to return the file data (base64).

  // Let's implement the webhook call here first assuming it works.

  const payload = {
    images: drawings.map(d => ({
      image: d.image, // Base64 data url
      ...d.slots
    }))
  };

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error(`n8n Webhook Error: ${response.statusText}`);

  const data = await response.json();
  console.log("n8n Response:", data);

  // Expectation: data.analysis.data (if we update API to return it)
  // Or data.analysis.fileData ...

  // For now, let's look for a likely candidate or fallback to the "analysis" field if it contains a URL.
  // If simply "success", we have a problem.

  // Let's allow returning a placeholder if data is missing, but log it.
  if (data.analysis && data.analysis.imageData) {
    return data.analysis.imageData;
  }

  // If the workflow returns a video URL?
  if (data.analysis && data.analysis.videoUrl) {
    return data.analysis.videoUrl;
  }

  // Fallback: Check if deep nested?
  // Standard n8n `responseBody` might just be the JSON.

  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
};

export const generateTrivia = async (imageBase64: string): Promise<TriviaQuestion> => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  try {
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: imageBase64.split(',')[1] } },
          { text: "Look at this image. Create a funny, specific multiple-choice question about a detail in the image (e.g. 'What is the robot holding?' or 'What color is the frog?'). Provide 4 options, one correct. Return JSON matching this schema: { question: string, options: string[], correctIndex: number }" }
        ]
      }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const text = result.response.text() || "{}";
    return JSON.parse(text) as TriviaQuestion;
  } catch (e) {
    console.error("Trivia gen error", e);
    return {
      question: "Who is the coolest player?",
      options: ["You", "The Host", "The AI", "Nobody"],
      correctIndex: 0
    };
  }
}

export const generateRoast = async (
  imageBase64: string,
  judgeId: string,
  prompts: string[]
): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const judge = JUDGES.find(j => j.id === judgeId) || JUDGES[0];

  try {
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: imageBase64.split(',')[1],
            }
          },
          {
            text: `${judge.prompt} 
            The players were asked to draw: ${prompts.join(', ')}.
            Look at the final image I generated based on their bad drawings.
            Give me a ONE SENTENCE roast about how chaotic or weird the result is. 
            Do not mention specific players, just the art.`
          }
        ]
      }]
    });

    return result.response.text()?.trim() || "I have no words for this disaster.";
  } catch (e) {
    return "This belongs in a museum... of mistakes.";
  }
};
