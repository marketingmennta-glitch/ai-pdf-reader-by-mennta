import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { PDFDocument } from "pdf-lib";

const app = express();
const PORT = 3000;

// Enable JSON body parser with increased limit for base64 OCR / PDF data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini Client Lazily
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// --- API ROUTES ---

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "PDFAK API Engine",
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// AI Chat with PDF Context
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, documentContext, chatHistory = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message prompt is required." });
    }

    const ai = getGenAIClient();
    const systemInstruction = `You are PDFAK AI, an enterprise-grade AI PDF assistant competing with Adobe Acrobat, ChatPDF, and UPDF.
Your goal is to provide precise, insightful, and well-formatted answers based on the provided PDF document context.
Always cite specific sections or page references when relevant.
Format your responses using clean Markdown with bold headings, bullet points, and code/math blocks if appropriate.
Document Context provided:
---
${documentContext ? documentContext.substring(0, 15000) : "No document text uploaded. Answer based on general knowledge or ask user to upload a document."}
---`;

    // Construct conversation history for chat
    const formattedHistory = chatHistory.map((h: { role: string; content: string }) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    }));

    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction,
        temperature: 0.2,
      },
      history: formattedHistory,
    });

    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      error: error.message || "Failed to process AI chat request.",
    });
  }
});

// AI PDF Summarization
app.post("/api/ai/summarize", async (req, res) => {
  try {
    const { text, title = "Document", detailLevel = "standard" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text content is required for summarization." });
    }

    const ai = getGenAIClient();
    const prompt = `Please analyze and generate a comprehensive executive summary for the document titled "${title}".
Detail Level: ${detailLevel}.
Text Content:
${text.substring(0, 20000)}

Structure your response with:
1. Executive Overview (2-3 sentences)
2. Key Takeaways (Bullet points with core highlights)
3. Actionable Items / Next Steps (if applicable)
4. Critical Terms & Jargon Definitions`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("AI Summarize Error:", error);
    res.status(500).json({ error: error.message || "Failed to summarize document." });
  }
});

// AI Explain Paragraph / Selection
app.post("/api/ai/explain", async (req, res) => {
  try {
    const { text, context = "" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Selected text is required." });
    }

    const ai = getGenAIClient();
    const prompt = `Explain the following text selection in simple, clear terms as if explaining to a professional.
Selected Text:
"${text}"

Surrounding Context:
"${context.substring(0, 2000)}"

Include:
- Simplified Breakdown
- Real-world Analogy or Practical Example
- Key Concepts Explained`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error("AI Explain Error:", error);
    res.status(500).json({ error: error.message || "Failed to explain text." });
  }
});

// AI Flashcards and Quiz Generator
app.post("/api/ai/quiz", async (req, res) => {
  try {
    const { text, numQuestions = 5 } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text content is required to generate quiz." });
    }

    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Generate a set of ${numQuestions} multiple-choice quiz questions and flashcards based on this document content:
${text.substring(0, 15000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ["id", "question", "options", "correctIndex", "explanation"],
              },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ["id", "front", "back"],
              },
            },
          },
          required: ["quiz", "flashcards"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("AI Quiz Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz." });
  }
});

// AI Translation
app.post("/api/ai/translate", async (req, res) => {
  try {
    const { text, targetLanguage = "Spanish" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required for translation." });
    }

    const ai = getGenAIClient();
    const prompt = `Translate the following text accurately into ${targetLanguage}. Maintain original formatting, tone, and technical terminology.
Original Text:
${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ translatedText: response.text, targetLanguage });
  } catch (error: any) {
    console.error("AI Translation Error:", error);
    res.status(500).json({ error: error.message || "Failed to translate text." });
  }
});

// AI Mind Map Generator
app.post("/api/ai/mindmap", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required to build mind map." });
    }

    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Extract a structured mind map concept tree from this document content:
${text.substring(0, 15000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            root: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                description: { type: Type.STRING },
                children: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      description: { type: Type.STRING },
                      children: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            label: { type: Type.STRING },
                            description: { type: Type.STRING },
                          },
                          required: ["id", "label"],
                        },
                      },
                    },
                    required: ["id", "label"],
                  },
                },
              },
              required: ["id", "label"],
            },
          },
          required: ["title", "root"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("AI Mind Map Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate mind map." });
  }
});

// Multimodal OCR (Extract text from Image Base64)
app.post("/api/ai/ocr", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/png" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required for OCR." });
    }

    // Strip header prefix if present (e.g., data:image/png;base64,)
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const ai = getGenAIClient();
    const imagePart = {
      inlineData: {
        mimeType,
        data: cleanBase64,
      },
    };
    const textPart = {
      text: "Perform high-accuracy OCR on this image. Extract all printed text, handwritten notes, numbers, tables, and labels. Maintain exact document layout where possible.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts: [imagePart, textPart] },
    });

    res.json({ extractedText: response.text });
  } catch (error: any) {
    console.error("OCR Error:", error);
    res.status(500).json({ error: error.message || "Failed to perform OCR on image." });
  }
});

// Text To Speech Audio Route
app.post("/api/ai/tts", async (req, res) => {
  try {
    const { text, voice = "Kore" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required for Speech synthesis." });
    }

    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: text.substring(0, 1000) }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: "No audio generated." });
    }

    res.json({ audioBase64: base64Audio });
  } catch (error: any) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: error.message || "Failed to synthesize speech." });
  }
});

// PDF Server Tools (Merge/Split simulated via pdf-lib)
app.post("/api/pdf/merge", async (req, res) => {
  try {
    const { pdfBase64List } = req.body;
    if (!Array.isArray(pdfBase64List) || pdfBase64List.length < 2) {
      return res.status(400).json({ error: "At least 2 PDF files in base64 format are required to merge." });
    }

    const mergedPdf = await PDFDocument.create();
    for (const base64 of pdfBase64List) {
      const cleanBase64 = base64.replace(/^data:application\/pdf;base64,/, "");
      const pdfBytes = Buffer.from(cleanBase64, "base64");
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.saveAsBase64({ dataUri: true });
    res.json({ mergedPdfBase64: mergedPdfBytes });
  } catch (error: any) {
    console.error("PDF Merge Error:", error);
    res.status(500).json({ error: error.message || "Failed to merge PDF files." });
  }
});

// Start Express Server with Vite Middleware in Development
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 PDFAK Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
