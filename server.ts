import express, { type Request, type Response } from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK on server-side (guarded)
let ai: any = null;
try {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} catch (initErr) {
  console.warn("GoogleGenAI init failed, AI endpoints will be disabled:", initErr?.message || initErr);
  ai = null;
}

// App icon endpoint: Serves the generated logo
app.get("/yazal_logo.png", (req: Request, res: Response) => {
  const logoPath = path.join(process.cwd(), "src/assets/images/yazal_logo_1784463282605.jpg");
  if (fs.existsSync(logoPath)) {
    res.setHeader("Content-Type", "image/jpeg");
    res.sendFile(logoPath);
  } else {
    // Fallback: simple text logo or standard shape if for some reason file is not found
    res.status(404).send("Logo not found");
  }
});

// AI Assistant endpoint
app.post("/api/chat", async (req: Request, res: Response) => {
  const { messages, stateContext } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages format" });
  }

  try {
    // Construct system instruction with the user's dashboard context
    const systemInstruction = `
أنت "مساعد يزل الذكي" (Yazal Smart Assistant)، مستشار أعمال وتقني متطور ومحترف ومساعد ذكي مدمج في منصة "يزل" (Yazal).
منصة "يزل" هي لوحة تحكم وإدارة بيانات متكاملة للأعمال والمشاريع والمالية والمهام.
مهمتك هي مساعدة المستخدم في تحليل بياناته، تقديم نصائح مالية وتقنية ذكية، كتابة خطابات للعملاء، وتلخيص حالة المشاريع والمهام بناءً على البيانات الفعلية الحالية المدخلة في لوحة التحكم الخاصة به.

فيما يلي البيانات الحالية الفورية للوحة تحكم المستخدم بصيغة JSON لتحليلها بدقة والإجابة بناءً عليها عند الحاجة:
${JSON.stringify(stateContext || {}, null, 2)}

إرشادات العمل الأساسية:
1. تواصل بلغة عربية احترافية، مهذبة، واضحة، ومقنعة (مع استخدام مصطلحات ريادية وأعمال متطورة).
2. عند الاستفسار عن الأداء المالي، قم بحساب صافي الأرباح (الإيرادات - المصروفات) وحلل البنود وقدم اقتراحات لتقليل التكاليف أو زيادة المداخيل.
3. عند الاستفسار عن المشاريع والمهام، قم بتوفير لمحة سريعة عن نسب الإنجاز، المهام المتأخرة، أو المشاريع التي تحتاج اهتماماً فورياً.
4. اقترح أفكاراً ذكية ومبتكرة بشكل استباقي لتطوير الأعمال والإنتاجية.
5. حافظ على إجاباتك منظمة مستخدماً التنسيق الأنيق والنقاط العريضة (Markdown).
6. تذكر دائماً أن اسمك هو "مساعد يزل الذكي" وأنك جزء من نظام "يزل" الريادي المتكامل.
`.trim();

    // Map the messages format for generateContent or chat.
    // For simplicity, let's use the standard generateContent with history formatting.
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "عذراً، لم أتمكن من معالجة الطلب في الوقت الحالي.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "حدث خطأ أثناء التواصل مع الذكاء الاصطناعي الخاص بيزل.",
      details: error.message,
    });
  }
});

// Exchange Rates endpoint
import https from "https";

app.get("/api/exchange-rates", (req: Request, res: Response) => {
  const url = "https://api.exchangerate-api.com/v4/latest/USD";
  https
    .get(url, (resp) => {
      let data = "";
      resp.on("data", (chunk) => {
        data += chunk;
      });
      resp.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          res.json(parsed.rates);
        } catch (err) {
          console.error("Error parsing exchange rates response:", err);
          res.status(500).json({ error: "Failed to parse rates" });
        }
      });
    })
    .on("error", (err) => {
      console.error("Error fetching rates:", err);
      res.status(500).json({ error: "Failed to fetch rates" });
    });
});

// Configure Vite or Static Asset delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Yazal server is active on http://localhost:${PORT}`);
  });
}

startServer();
