import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-2.5-flash";
const TEMPERATURE = 0.2;

const VALID_ENUMS = [
  "GADGET", "FURNITURE", "VEHICLE", "STATIONARY",
  "MUSICAL_INSTRUMENT", "CLOTHING", "BOOK", "ACADEMIC_BOOK",
  "ELECTRONICS", "APARTMENTS", "OTHERS",
];

// 🔹 STEP 1 — Detect the category
export const findCategory = async (prompt) => {
  const systemInstruction = `
You are a product classification AI for a rental platform called Brittoo.
Your job is to choose exactly one most suitable product category from:

GADGET, FURNITURE, VEHICLE, STATIONARY, MUSICAL_INSTRUMENT, CLOTHING,
BOOK, ACADEMIC_BOOK, ELECTRONICS, APARTMENTS, OTHERS.

Rules:
- Think what physical item type matches the user's intent.
- Return ONLY one category name, exactly as listed (uppercase, no punctuation).
- Do NOT explain or ask questions.
- If not sure, return "OTHERS".

Examples:
"I want to build a robot" → ELECTRONICS  
"I want to go on a ride with friends" → VEHICLE
"I want to go on a travel" → CLOTHING (as travel bags, neck pillows falls under clothing in this system)
"I need a guitar" → MUSICAL_INSTRUMENT  
"I need a new sofa" → FURNITURE  
"I want a nice outfit" → CLOTHING  
"I need a textbook for university" → ACADEMIC_BOOK  
"I want to rent an apartment" → APARTMENTS
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: `User request: ${prompt}` }] }],
      generationConfig: {
        temperature: TEMPERATURE,
        maxOutputTokens: 10,
      },
      config: {
        systemInstruction,
      },
    });

    const text = (response.text || "").trim().toUpperCase();

    if (VALID_ENUMS.includes(text)) return text;

    const match = VALID_ENUMS.find((c) => text.includes(c));
    return match || "OTHERS";
  } catch (err) {
    console.error("findCategory error:", err);
    return "OTHERS";
  }
};

// 🔹 STEP 2 — Pick matching product IDs
export const accumulateProducts = async (userPrompt, products) => {
  if (!products || products.length === 0) return [];

  const systemInstruction = `
You are a precise matching model for a rental marketplace.
You will receive:
1. A user's intent or goal.
2. A list of products with IDs and names.

Your task:
- Identify which products directly help the user.
- Output only their IDs, comma-separated (e.g. "A1,B4,C2").
- Do NOT explain, describe, or add punctuation other than commas.
- If none match, output "NONE".

Examples:
User: "build a LFR or line following robot"
Products:
ID: E1, Name: Arduino Uno
ID: G2, Name: Guitar
ID: E3, Name: Ultrasonic Sensor
ID: E4, Name: Wheels
Expected: A1,C3,E4

User: "Want to go on a travel"
Products:
ID: E1, Name: Arduino Uno
ID: C2, Name: Trolley Luggage
ID: E3, Name: Neck Pillow
ID: E4, Name: Camera
Expected: C2,E3,E4

User: "decorate my living room"
Products:
ID: X1, Name: Sofa
ID: X2, Name: Dining Table
Expected: X1,X2
`;

  const productList = products.map((p) => `ID: ${p.productSL}, Name: ${p.name}`).join("\n");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [{ text: `User goal: ${userPrompt}\nAvailable products:\n${productList}` }],
        },
      ],
      generationConfig: {
        temperature: TEMPERATURE,
        maxOutputTokens: 60,
      },
      config: {
        systemInstruction,
      },
    });

    const text = (response.text || "").trim();
    //console.log("PRODUCT SELECTION RAW:", text);

    if (!text || text.toUpperCase() === "NONE") return [];

    const ids = text
      .replace(/[^a-zA-Z0-9,_-]/g, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return ids;
  } catch (err) {
    console.error("accumulateProducts error:", err);
    return [];
  }
};
