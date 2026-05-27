export const ExamIQMode = {
  NOTES_GENERATION: "NOTES_GENERATION",
  MCQ_GENERATION: "MCQ_GENERATION",
  DESCRIPTIVE_QUESTIONS: "DESCRIPTIVE_QUESTIONS",
  TEST_EXPLANATION: "TEST_EXPLANATION",
  CHAT_TUTOR: "CHAT_TUTOR",
};

export const generateExamContent = async (mode, input, difficulty = "Medium", marks) => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, input, difficulty, marks })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate AI content");
  }

  const data = await response.json();
  return data.text;
};
