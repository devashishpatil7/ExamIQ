const { GoogleGenAI, Type } = require("@google/genai");
const { GEMINI_API_KEY } = require("../config/secrets");

let ai = null;
if (!GEMINI_API_KEY) {
  console.warn("⚠️ WARNING: Gemini API key missing from /mnt/secrets/ mount");
} else {
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

const ExamIQMode = {
  NOTES_GENERATION: "NOTES_GENERATION",
  MCQ_GENERATION: "MCQ_GENERATION",
  DESCRIPTIVE_QUESTIONS: "DESCRIPTIVE_QUESTIONS",
  TEST_EXPLANATION: "TEST_EXPLANATION",
  CHAT_TUTOR: "CHAT_TUTOR",
};

const generateExamContent = async (mode, input, difficulty = "Medium", marks) => {
  if (!ai) throw new Error("GEMINI_NOT_CONFIGURED: SDK requires an API Key to function.");

  let systemInstruction = `You are the AI engine for ExamIQ, an AI-powered university exam preparation platform.`;
  let prompt = "";
  let responseMimeType = "text/plain";
  let responseSchema = undefined;

  switch (mode) {
    case ExamIQMode.NOTES_GENERATION:
      prompt = `MODE: NOTES_GENERATION\nConvert the following text into structured notes:\n\n${input}`;
      break;
    case ExamIQMode.MCQ_GENERATION:
      prompt = `MODE: MCQ_GENERATION\nGenerate ${difficulty} difficulty MCQs from:\n${input}`;
      responseMimeType = "application/json";
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.OBJECT, properties: { A: { type: Type.STRING }, B: { type: Type.STRING }, C: { type: Type.STRING }, D: { type: Type.STRING } }, required: ["A","B","C","D"] },
            correct_answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["question", "options", "correct_answer", "explanation"],
        },
      };
      break;
    case ExamIQMode.DESCRIPTIVE_QUESTIONS:
      const m = marks || 5;
      prompt = `MODE: DESCRIPTIVE_QUESTIONS\nGenerate ${m}-mark questions. Difficulty: ${difficulty}\n\n${input}`;
      responseMimeType = "application/json";
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            marks: { type: Type.NUMBER },
            introduction: { type: Type.STRING },
            key_points: { type: Type.ARRAY, items: { type: Type.STRING } },
            conclusion: { type: Type.STRING },
            marks_distribution: { type: Type.STRING },
          },
          required: ["question","marks","introduction","key_points","conclusion","marks_distribution"],
        },
      };
      break;
    case ExamIQMode.TEST_EXPLANATION:
      prompt = `MODE: TEST_EXPLANATION\nAnalyze this test result:\n\n${input}`;
      break;
    case ExamIQMode.CHAT_TUTOR:
      prompt = `MODE: CHAT_TUTOR\nUser query: ${input}`;
      break;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: { systemInstruction, responseMimeType, responseSchema },
  });

  return response.text;
};

module.exports = { generateExamContent, ExamIQMode };
