// server.ts
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3e3);
  app.use(express.json({ limit: "10mb" }));
  const getGeminiAI = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  };
  const generateWithFallback = async (aiInstance, modelsToTry, params) => {
    let lastError = null;
    for (const model of modelsToTry) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await aiInstance.models.generateContent({
            ...params,
            model
          });
          return res;
        } catch (err) {
          lastError = err;
          const errMsg = err?.message || String(err);
          console.warn(`[Gemini API] Request on model ${model} failed (attempt ${attempt + 1}): ${errMsg}`);
          const isTransient = errMsg.includes("503") || errMsg.includes("429") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Rate exceeded") || errMsg.includes("Quota exceeded") || errMsg.includes("quota") || err.status === "UNAVAILABLE" || err.status === 429 || err.status === 503;
          if (isTransient && attempt < 2) {
            const delay = (attempt + 1) * 2e3;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          break;
        }
      }
    }
    throw lastError;
  };
  app.get("/api/gemini/status", (req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      hasApiKey: hasKey,
      status: hasKey ? "AVAILABLE" : "API_REQUIRED",
      supportedFeatures: {
        textWriting: hasKey ? "AVAILABLE" : "API_REQUIRED",
        summarize: hasKey ? "AVAILABLE" : "API_REQUIRED",
        translate: hasKey ? "AVAILABLE" : "API_REQUIRED",
        designReview: hasKey ? "AVAILABLE" : "API_REQUIRED",
        imageGen: hasKey ? "AVAILABLE" : "API_REQUIRED",
        backgroundRemoval: "LOCAL_ONLY",
        upscale: "LOCAL_ONLY",
        tts: "LOCAL_ONLY",
        speechToText: "LOCAL_ONLY",
        videoGen: "API_REQUIRED"
      }
    });
  });
  app.post("/api/gemini/catvas", async (req, res) => {
    try {
      const ai = getGeminiAI();
      const { mode, prompt, tone, language, context, format, width, height, clientApiKey } = req.body;
      let activeAi = ai;
      if (!activeAi && clientApiKey) {
        activeAi = new GoogleGenAI({
          apiKey: clientApiKey,
          httpOptions: { headers: { "User-Agent": "aistudio-build" } }
        });
      }
      if (!activeAi) {
        return res.status(400).json({
          error: "API \uD0A4\uAC00 \uC124\uC815\uB418\uC5B4 \uC788\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC124\uC815 \uBA54\uB274\uC5D0\uC11C Gemini API \uD0A4\uB97C \uC785\uB825\uD558\uAC70\uB098 \uC11C\uBC84 \uD658\uACBD\uBCC0\uC218\uB97C \uB4F1\uB85D\uD574\uC8FC\uC138\uC694.",
          status: "API_REQUIRED"
        });
      }
      if (mode === "text") {
        let systemInstruction = "\uB2F9\uC2E0\uC740 \uC138\uACC4 \uCD5C\uACE0\uC758 \uBE44\uC8FC\uC5BC \uB514\uC790\uC778 \uBC0F \uCE74\uD53C\uB77C\uC774\uD305 \uC804\uBB38\uAC00\uC785\uB2C8\uB2E4. \uC0AC\uC6A9\uC790 \uC694\uAD6C\uC5D0 \uB9DE\uCD98 \uC815\uAD50\uD558\uACE0 \uAC10\uAC01\uC801\uC778 \uD14D\uC2A4\uD2B8\uB97C \uCD9C\uB825\uD558\uC138\uC694.";
        let userPrompt = prompt;
        if (format === "title") {
          systemInstruction += " \uC720\uD29C\uBE0C \uC378\uB124\uC77C, \uD3EC\uC2A4\uD130, \uAD11\uACE0\uC5D0 \uC0AC\uC6A9\uB420 \uAC00\uC7A5 \uC8FC\uBAA9\uB3C4 \uB192\uC740 \uD5E4\uB4DC\uB77C\uC778/\uD0C0\uC774\uD2C0 5\uAC1C\uB97C \uCD94\uCC9C\uD558\uC138\uC694.";
        } else if (format === "translate") {
          systemInstruction += ` \uB2E4\uC74C \uD14D\uC2A4\uD2B8\uB97C \uC790\uC5F0\uC2A4\uB7FD\uACE0 \uC720\uB824\uD55C ${language || "\uC601\uC5B4"}\uB85C \uBC88\uC5ED\uD558\uC138\uC694. \uBC88\uC5ED \uACB0\uACFC\uB9CC \uAE54\uB054\uD558\uAC8C \uCD9C\uB825\uD558\uC138\uC694.`;
        } else if (format === "summary") {
          systemInstruction += " \uB2E4\uC74C \uAE34 \uD14D\uC2A4\uD2B8\uB97C (1) \uD55C \uC904 \uC694\uC57D, (2) 3\uB300 \uD575\uC2EC \uD3EC\uC778\uD2B8\uB85C \uC77C\uBAA9\uC694\uC5F0\uD558\uAC8C \uC694\uC57D\uD558\uC138\uC694.";
        } else if (format === "design_review") {
          systemInstruction = `\uB2F9\uC2E0\uC740 \uCD5C\uACE0 \uC218\uC900\uC758 \uC2DC\uAC01 \uB514\uC790\uC778 \uBC0F UI/UX \uBD84\uC11D AI\uC785\uB2C8\uB2E4. 
\uC81C\uACF5\uB41C \uCE94\uBC84\uC2A4 \uAC1D\uCCB4 \uC815\uBCF4\uC640 \uD14D\uC2A4\uD2B8\uB97C \uBD84\uC11D\uD558\uC5EC:
1. \uD14D\uC2A4\uD2B8 \uAC00\uB3C5\uC131 \uBC0F \uD3F0\uD2B8 \uACC4\uCE35
2. \uC0C9\uC0C1 \uB300\uBE44 \uBC0F \uC2DC\uAC01\uC801 \uC870\uD654
3. \uC5EC\uBC31\uACFC \uC815\uB82C \uC0C1\uD0DC
4. \uC989\uC2DC \uC801\uC6A9 \uAC00\uB2A5\uD55C 3\uAC00\uC9C0 \uAD6C\uCCB4\uC801 \uAC1C\uC120 \uC870\uCE58
\uB97C \uD55C\uAD6D\uC5B4\uB85C \uAE54\uB054\uD55C \uB9C8\uD06C\uB2E4\uC6B4 \uB9AC\uC2A4\uD2B8 \uD615\uC2DD\uC73C\uB85C \uCD9C\uB825\uD558\uC138\uC694.`;
        }
        const response = await generateWithFallback(
          activeAi,
          ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
          {
            contents: `${systemInstruction}

[\uD1A4: ${tone || "\uC804\uBB38\uC801\uC774\uACE0 \uC138\uB828\uB428"}]

\uB0B4\uC6A9:
${userPrompt}

${context ? `[\uCD94\uAC00 \uB9E5\uB77D]: ${context}` : ""}`
          }
        );
        return res.json({ result: response.text });
      } else if (mode === "image") {
        try {
          const response = await generateWithFallback(
            activeAi,
            ["gemini-3.1-flash-image", "gemini-3.1-flash-lite-image"],
            {
              contents: `Generate a high quality visual asset suitable for graphic design, thumbnail, or poster based on prompt: "${prompt}". Style: ${tone || "vibrant modern graphic design"}.`
            }
          );
          let imageUrl = null;
          if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData?.data) {
                imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
                break;
              }
            }
          }
          if (imageUrl) {
            return res.json({ imageUrl });
          } else {
            return res.json({
              textDescription: response.text,
              message: "\uC774\uBBF8\uC9C0 \uC0DD\uC131\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
              imageUrl: null
            });
          }
        } catch (imgErr) {
          console.warn("Image generation fallback:", imgErr.message);
          return res.status(400).json({
            error: `\uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4 (${imgErr.message}). \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.`,
            status: "API_ERROR"
          });
        }
      } else if (mode === "video") {
        const systemInstruction = `\uB2F9\uC2E0\uC740 \uCD5C\uCCA8\uB2E8 AI \uBE44\uB514\uC624 \uB514\uB809\uD130 \uBC0F \uBAA8\uC158 \uADF8\uB798\uD53D \uC804\uBB38\uAC00\uC785\uB2C8\uB2E4.
\uC0AC\uC6A9\uC790\uC758 \uD504\uB86C\uD504\uD2B8\uC640 \uC2A4\uD0C0\uC77C\uC5D0 \uB9DE\uCDB0 \uC601\uC0C1 \uD074\uB9BD\uC5D0 \uD544\uC694\uD55C \uBE44\uC8FC\uC5BC \uC694\uC18C, \uBC30\uACBD\uC0C9\uC0C1, \uD0A4 \uBE44\uC8FC\uC5BC \uC124\uBA85, \uCD94\uCC9C \uC790\uB9C9, \uBAA8\uC158 \uC5F0\uCD9C \uC815\uBCF4\uB97C JSON \uD615\uC2DD\uC73C\uB85C \uC0DD\uC131\uD558\uC138\uC694.`;
        let responseText = "";
        try {
          const response = await generateWithFallback(
            activeAi,
            ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
            {
              contents: `${systemInstruction}

[\uBE44\uB514\uC624 \uD504\uB86C\uD504\uD2B8: ${prompt}]
[\uC2A4\uD0C0\uC77C: ${tone || "cinematic 4K"}]
[\uD654\uBA74 \uBE44\uC728: ${req.body.aspectRatio || "16:9"}]

\uB2E4\uC74C JSON \uAD6C\uC870\uB85C \uC751\uB2F5\uD558\uC138\uC694 (\uCF54\uB4DC\uBE14\uB85D \uC5C6\uC774):
{
  "title": "\uC601\uC0C1 \uC81C\uBAA9",
  "scenes": [
    {
      "time": 0,
      "caption": "\uCCAB \uC7A5\uBA74 \uC790\uB9C9",
      "visualDescription": "\uBC30\uACBD \uBC0F \uADF8\uB798\uD53D \uBB18\uC0AC",
      "dominantColors": ["#0f172a", "#38bdf8", "#ec4899"],
      "cameraMotion": "zoom-in"
    }
  ],
  "recommendedBgm": "\uC2E0\uC2A4\uC6E8\uC774\uBE0C \uC570\uBE44\uC5B8\uD2B8",
  "vibeDescription": "\uC138\uB828\uB418\uACE0 \uBABD\uD658\uC801\uC778 \uBD84\uC704\uAE30"
}`
            }
          );
          responseText = response.text || "";
        } catch (videoModelErr) {
          console.warn("Video script fallback due to model error:", videoModelErr.message);
        }
        let jsonResult;
        try {
          const raw = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
          jsonResult = JSON.parse(raw);
        } catch (e) {
          jsonResult = {
            title: prompt || "AI \uC0DD\uC131 \uBE44\uB514\uC624",
            scenes: [
              { time: 0, caption: prompt || "AI \uC2DC\uB124\uB9C8\uD2F1 \uBAA8\uC158", dominantColors: ["#0f172a", "#6366f1", "#38bdf8", "#ec4899"], cameraMotion: "zoom-in" }
            ],
            vibeDescription: "\uBAA8\uB358 \uC2DC\uB124\uB9C8\uD2F1 \uC544\uD2B8"
          };
        }
        return res.json({ result: jsonResult });
      }
      res.status(400).json({ error: "Invalid mode specified" });
    } catch (err) {
      console.error(err);
      const errMsg = String(err?.message || err);
      if (errMsg.includes("429") || errMsg.includes("Rate exceeded") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
        return res.status(429).json({
          error: "AI \uC694\uCCAD \uC0AC\uC6A9\uB7C9 \uD55C\uB3C4(Rate limit)\uB97C \uCD08\uACFC\uD588\uC2B5\uB2C8\uB2E4. \uC57D 10~15\uCD08 \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694."
        });
      }
      res.status(500).json({ error: err.message || "AI \uC694\uCCAD \uCC98\uB9AC \uC2E4\uD328" });
    }
  });
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const ai = getGeminiAI();
      if (!ai) {
        return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
      }
      const userInput = req.body.prompt;
      if (!userInput) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      const response = await generateWithFallback(
        ai,
        ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
        {
          contents: `You are an AI assistant. Answer concisely and helpfully: "${userInput}".`
        }
      );
      res.json({ text: response.text });
    } catch (err) {
      console.error(err);
      const errMsg = String(err?.message || err);
      if (errMsg.includes("429") || errMsg.includes("Rate exceeded") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
        return res.status(429).json({
          error: "API \uC0AC\uC6A9\uB7C9 \uD55C\uB3C4(Rate limit)\uB97C \uCD08\uACFC\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694."
        });
      }
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const ai = getGeminiAI();
      const { messages, systemPrompt, personality } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array is required" });
      }
      if (!ai) {
        const lastUserMsg = messages[messages.length - 1]?.text || "";
        return res.json({
          text: `\uC548\uB155\uD558\uC138\uC694! KETO & CatchOn AI \uBE44\uC11C\uC785\uB2C8\uB2E4. \u{1F916}

"${lastUserMsg}"\uC5D0 \uB300\uD55C \uC9C8\uBB38\uC744 \uD655\uC778\uD588\uC2B5\uB2C8\uB2E4!

(\uCC38\uACE0: GEMINI_API_KEY\uAC00 \uC124\uC815\uB418\uC5B4 \uC788\uC73C\uBA74 \uC2E4\uC2DC\uAC04 \uCD5C\uC2E0 Gemini \uBAA8\uB378\uC758 \uCD08\uC9C0\uB2A5 \uB2F5\uBCC0\uC744 \uC0DD\uC131\uD569\uB2C8\uB2E4. \uD604\uC7AC \uC2DC\uBBAC\uB808\uC774\uC158 \uBAA8\uB4DC\uB85C \uCE5C\uC808\uD558\uAC8C \uB300\uD654\uB97C \uB098\uB20C \uC218 \uC788\uC2B5\uB2C8\uB2E4!)`
        });
      }
      const systemInstruction = systemPrompt || "\uB2F9\uC2E0\uC740 CatchOn OS \uBC0F KETO Phone\uC758 \uCE5C\uC808\uD558\uACE0 \uC720\uB2A5\uD55C \uAC1C\uC778 AI \uBE44\uC11C 'KETO AI'\uC785\uB2C8\uB2E4. \uD55C\uAD6D\uC5B4\uB85C \uC815\uC911\uD558\uACE0 \uBA85\uCF8C\uD558\uBA70 \uB3C4\uC6C0\uC774 \uB418\uB294 \uB2F5\uBCC0\uC744 \uC81C\uACF5\uD569\uB2C8\uB2E4. \uB9C8\uD06C\uB2E4\uC6B4 \uD615\uC2DD\uC744 \uC801\uC808\uD788 \uC0AC\uC6A9\uD558\uC5EC \uAC00\uB3C5\uC131\uC744 \uB192\uC5EC\uC8FC\uC138\uC694.";
      const contents = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));
      const response = await generateWithFallback(
        ai,
        ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
        {
          contents,
          config: {
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            }
          }
        }
      );
      res.json({ text: response.text });
    } catch (err) {
      console.error("[Gemini Chat Error]:", err);
      const errMsg = String(err?.message || err);
      if (errMsg.includes("429") || errMsg.includes("Rate exceeded") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
        return res.json({
          text: `\u26A0\uFE0F **AI \uC11C\uBC84 \uC0AC\uC6A9\uB7C9 \uD55C\uB3C4 \uCD08\uACFC (Rate Limit)**

\uD604\uC7AC \uC21C\uAC04\uC801\uC73C\uB85C AI \uC694\uCCAD \uC0AC\uC6A9\uB7C9\uC774 \uD3ED\uC8FC\uD558\uC5EC \uB2F5\uBCC0 \uC0DD\uC131\uC774 \uC81C\uD55C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.
\uC57D 10\uCD08~15\uCD08 \uD6C4 \uB2E4\uC2DC \uC9C8\uBB38\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694! \u{1F916}\u2728`
        });
      }
      res.status(500).json({ error: err.message || "AI \uB300\uD654 \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "../dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.mjs.map
