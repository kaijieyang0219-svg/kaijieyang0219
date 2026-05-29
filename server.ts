import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialize Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Return a dummy client or throw error, but let's handle gracefully so the app crashes nicely if keys are missing
      // We will output a clear message when used.
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. AI analysis will fallback to mocked demo data.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Fallback Mocked Responses for Food Analysis
const MOCK_FOODS_ANALYSIS = {
  foods: [
    { name: "雞胸肉", weight: "120g", calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, sodium: 74, sugar: 0 },
    { name: "糙米飯", weight: "150g", calories: 180, protein: 4, fat: 1.5, carbs: 38, fiber: 2.5, sodium: 2, sugar: 0.5 },
    { name: "花椰菜", weight: "100g", calories: 35, protein: 3, fat: 0.4, carbs: 7, fiber: 3, sodium: 33, sugar: 1.5 },
    { name: "水煮蛋", weight: "1 顆", calories: 70, protein: 6, fat: 5, carbs: 0.6, fiber: 0, sodium: 62, sugar: 0.6 },
    { name: "橄欖油", weight: "5g", calories: 40, protein: 0, fat: 4.5, carbs: 0, fiber: 0, sodium: 0, sugar: 0 }
  ],
  advice: "整體營養均衡不錯！雞胸肉配合水煮蛋提供了優質的蛋白質來源，糙米飯則是優質的低 GI 碳水化合物，花椰菜補充了膳食纖維。建議可以再增加一些色彩豐富的蔬菜以獲得更全面的微量元素。"
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with size limits for base64 images
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // API router/endpoints
  app.post("/api/analyze-meal", async (req, res) => {
    try {
      const { image, textPrompt } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: "Missing image base64 data" });
      }

      // Check if GEMINI_API_KEY is fallback placeholder
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        console.log("No valid GEMINI_API_KEY detected. Returning high-quality mock data for the user.");
        // Simulate a tiny delay for realism
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return res.json(MOCK_FOODS_ANALYSIS);
      }

      // Convert a base64 image (either containing data:image/png;base64, prefix or raw)
      let mimeType = "image/jpeg";
      let base64Data = image;

      if (image.startsWith("data:")) {
        const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }

      const ai = getGeminiClient();
      console.log("Calling Gemini API to analyze food image with model 'gemini-3.5-flash'...");

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: textPrompt || "Please analyze the food present in this image. Identify each distinct food item, estimate its weight (e.g. 120g, 150g, 5g, or 1 unit/顆), and estimate its calories (kcal), protein (g), fat (g), carbs (g), fiber (g), sodium (mg), and sugar (g). Return the response in Chinese adhering strictly to the JSON schema."
          }
        ],
        config: {
          systemInstruction: "You are an expert dietitian and nutrition analyzer. You analyze food images and provide detailed, realistic estimates of their weights, calories, and macronutrient composition in standard values. Your response must be in Traditional Chinese (繁體中文). Ensure the advice field provides a professional, warm dietary recommendation summarizing the meal's nutrition.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              foods: {
                type: Type.ARRAY,
                description: "List of identified food components in the meal",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the food in Traditional Chinese (e.g., 雞胸肉, 糙米飯)" },
                    weight: { type: Type.STRING, description: "Estimated weight or portion (e.g., 120g, 1顆, 5g)" },
                    calories: { type: Type.INTEGER, description: "Estimated calories in kcal" },
                    protein: { type: Type.NUMBER, description: "Estimated protein in grams" },
                    fat: { type: Type.NUMBER, description: "Estimated fat in grams" },
                    carbs: { type: Type.NUMBER, description: "Estimated carbohydrates in grams" },
                    fiber: { type: Type.NUMBER, description: "Estimated dietary fiber in grams" },
                    sodium: { type: Type.NUMBER, description: "Estimated sodium in milligrams" },
                    sugar: { type: Type.NUMBER, description: "Estimated sugar in grams" }
                  },
                  required: ["name", "weight", "calories", "protein", "fat", "carbs", "fiber", "sodium", "sugar"]
                }
              },
              advice: { type: Type.STRING, description: "Professional, comprehensive diet advice and meal balance review in Traditional Chinese (Traditional Chinese characters only)" }
            },
            required: ["foods", "advice"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      console.log("Gemini API response received successfully!");
      const resultObj = JSON.parse(responseText.trim());
      return res.json(resultObj);

    } catch (err: any) {
      console.error("Error analyzing meal image:", err);
      return res.status(500).json({ 
        error: "Failed to analyze meal image", 
        details: err?.message || err,
        fallback: MOCK_FOODS_ANALYSIS
      });
    }
  });

  // Serve static files / Vite HMR
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
