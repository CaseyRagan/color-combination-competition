
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

export const generateCombinedImage = async (
  drawings: { image: string, slots: PromptSlots }[]
): Promise<string> => {
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
