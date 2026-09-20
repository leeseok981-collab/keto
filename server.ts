import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper for lazy Gemini AI instance
  const getGeminiAI = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // Helper with exponential backoff & model fallback for 503 / high demand / quota limits
  const generateWithFallback = async (
    aiInstance: GoogleGenAI,
    modelsToTry: string[],
    params: any
  ) => {
    let lastError: any = null;
    for (const model of modelsToTry) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await aiInstance.models.generateContent({
            ...params,
            model,
          });
          return res;
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          console.warn(`[Gemini API] Request on model ${model} failed (attempt ${attempt + 1}): ${errMsg}`);

          const isTransient = 
            errMsg.includes('503') || 
            errMsg.includes('high demand') || 
            errMsg.includes('UNAVAILABLE') || 
            errMsg.includes('RESOURCE_EXHAUSTED') ||
            err.status === 'UNAVAILABLE' ||
            err.status === 503;

          if (isTransient && attempt === 0) {
            // Short backoff before 2nd attempt on same model
            await new Promise((resolve) => setTimeout(resolve, 800));
            continue;
          }
          // Break to next fallback model
          break;
        }
      }
    }
    throw lastError;
  };

  // Catvas AI Studio Endpoint
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

      // Allow user-provided API key from client settings if server key is not configured
      let activeAi = ai;
      if (!activeAi && clientApiKey) {
        activeAi = new GoogleGenAI({
          apiKey: clientApiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
      }

      if (!activeAi) {
        return res.status(400).json({ 
          error: "API 키가 설정되어 있지 않습니다. 설정 메뉴에서 Gemini API 키를 입력하거나 서버 환경변수를 등록해주세요.",
          status: "API_REQUIRED"
        });
      }

      if (mode === 'text') {
        // AI Writing / Copywriter / Summary / Translation / Design Review
        let systemInstruction = "당신은 세계 최고의 비주얼 디자인 및 카피라이팅 전문가입니다. 사용자 요구에 맞춘 정교하고 감각적인 텍스트를 출력하세요.";
        let userPrompt = prompt;

        if (format === 'title') {
          systemInstruction += " 유튜브 썸네일, 포스터, 광고에 사용될 가장 주목도 높은 헤드라인/타이틀 5개를 추천하세요.";
        } else if (format === 'translate') {
          systemInstruction += ` 다음 텍스트를 자연스럽고 유려한 ${language || '영어'}로 번역하세요. 번역 결과만 깔끔하게 출력하세요.`;
        } else if (format === 'summary') {
          systemInstruction += " 다음 긴 텍스트를 (1) 한 줄 요약, (2) 3대 핵심 포인트로 일목요연하게 요약하세요.";
        } else if (format === 'design_review') {
          systemInstruction = `당신은 최고 수준의 시각 디자인 및 UI/UX 분석 AI입니다. 
제공된 캔버스 객체 정보와 텍스트를 분석하여:
1. 텍스트 가독성 및 폰트 계층
2. 색상 대비 및 시각적 조화
3. 여백과 정렬 상태
4. 즉시 적용 가능한 3가지 구체적 개선 조치
를 한국어로 깔끔한 마크다운 리스트 형식으로 출력하세요.`;
        }

        const response = await generateWithFallback(
          activeAi,
          ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"],
          {
            contents: `${systemInstruction}\n\n[톤: ${tone || '전문적이고 세련됨'}]\n\n내용:\n${userPrompt}\n\n${context ? `[추가 맥락]: ${context}` : ''}`,
          }
        );

        return res.json({ result: response.text });
      } else if (mode === 'image') {
        // AI Image Generation with Gemini Flash Image & Lite Fallback
        try {
          const response = await generateWithFallback(
            activeAi,
            ["gemini-3.1-flash-image", "gemini-3.1-flash-lite-image"],
            {
              contents: `Generate a high quality visual asset suitable for graphic design, thumbnail, or poster based on prompt: "${prompt}". Style: ${tone || 'vibrant modern graphic design'}.`,
            }
          );

          // Check for generated image candidates
          let imageUrl = null;
          if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData?.data) {
                imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                break;
              }
            }
          }

          if (imageUrl) {
            return res.json({ imageUrl });
          } else {
            return res.json({ 
              textDescription: response.text,
              message: "이미지 생성이 완료되었습니다.",
              imageUrl: null 
            });
          }
        } catch (imgErr: any) {
          console.warn("Image generation fallback:", imgErr.message);
          return res.status(400).json({ 
            error: `이미지 생성 중 오류가 발생했습니다 (${imgErr.message}). 잠시 후 다시 시도해주세요.`,
            status: "API_ERROR"
          });
        }
      } else if (mode === 'video') {
        // AI Video Storyboard & Motion Script Generation
        const systemInstruction = `당신은 최첨단 AI 비디오 디렉터 및 모션 그래픽 전문가입니다.
사용자의 프롬프트와 스타일에 맞춰 영상 클립에 필요한 비주얼 요소, 배경색상, 키 비주얼 설명, 추천 자막, 모션 연출 정보를 JSON 형식으로 생성하세요.`;

        let responseText = "";
        try {
          const response = await generateWithFallback(
            activeAi,
            ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"],
            {
              contents: `${systemInstruction}\n\n[비디오 프롬프트: ${prompt}]\n[스타일: ${tone || 'cinematic 4K'}]\n[화면 비율: ${req.body.aspectRatio || '16:9'}]\n\n다음 JSON 구조로 응답하세요 (코드블록 없이):
{
  "title": "영상 제목",
  "scenes": [
    {
      "time": 0,
      "caption": "첫 장면 자막",
      "visualDescription": "배경 및 그래픽 묘사",
      "dominantColors": ["#0f172a", "#38bdf8", "#ec4899"],
      "cameraMotion": "zoom-in"
    }
  ],
  "recommendedBgm": "신스웨이브 앰비언트",
  "vibeDescription": "세련되고 몽환적인 분위기"
}`,
            }
          );
          responseText = response.text || "";
        } catch (videoModelErr: any) {
          console.warn("Video script fallback due to model error:", videoModelErr.message);
        }

        let jsonResult;
        try {
          const raw = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          jsonResult = JSON.parse(raw);
        } catch (e) {
          jsonResult = {
            title: prompt || "AI 생성 비디오",
            scenes: [
              { time: 0, caption: prompt || "AI 시네마틱 모션", dominantColors: ["#0f172a", "#6366f1", "#38bdf8", "#ec4899"], cameraMotion: "zoom-in" }
            ],
            vibeDescription: "모던 시네마틱 아트"
          };
        }

        return res.json({ result: jsonResult });
      }

      res.status(400).json({ error: "Invalid mode specified" });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "AI 요청 처리 실패" });
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
        ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"],
        {
          contents: `You are an AI assistant. Answer concisely and helpfully: "${userInput}".`,
        }
      );

      res.json({ text: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
