const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdfParse = require("pdf-parse");

const extractJsonBlock = (text) => {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
};

const normalizeAnalysis = (analysis) => ({
  atsScore: Math.max(0, Math.min(100, Number(analysis.atsScore) || 0)),
  missingSkills: Array.isArray(analysis.missingSkills)
    ? analysis.missingSkills.map((s) => String(s)).slice(0, 12)
    : [],
  improvementSuggestions: Array.isArray(analysis.improvementSuggestions)
    ? analysis.improvementSuggestions.map((s) => String(s)).slice(0, 10)
    : [],
});

const escapeResumeText = (text) => text.replace(/[`"\\]/g, "\\$&").trim();

const analyzeResumeText = async (resumeText) => {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error("GEMINI_NOT_CONFIGURED");
    err.statusCode = 500;
    throw err;
  }

  const safeResumeText = escapeResumeText(resumeText);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an expert ATS and resume reviewer.
Analyze the resume text and return STRICT JSON only using this exact schema:
{
  "atsScore": number, // integer 0-100
  "missingSkills": string[], // concise technical/professional skills likely missing
  "improvementSuggestions": string[] // actionable bullet-style suggestions
}

Rules:
- No markdown/code fences, JSON only.
- Keep missingSkills to maximum 12 items.
- Keep improvementSuggestions to maximum 10 items.
- Base your analysis only on the resume text provided.

Resume text:
${safeResumeText}
`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  const jsonCandidate = extractJsonBlock(raw);

  try {
    return normalizeAnalysis(JSON.parse(jsonCandidate));
  } catch {
    const err = new Error("INVALID_AI_RESPONSE");
    err.statusCode = 502;
    throw err;
  }
};

const analyzePdfBuffer = async (buffer) => {
  const pdfData = await pdfParse(buffer);
  const resumeText = pdfData.text?.trim();
  if (!resumeText) {
    const err = new Error("NO_PDF_TEXT");
    err.statusCode = 400;
    throw err;
  }
  const analysis = await analyzeResumeText(resumeText);
  return { analysis, extractedTextLength: resumeText.length };
};

// ── Interview helpers ────────────────────────────────────────────────────────

const MAX_INTERVIEW_MESSAGES = 40;

/**
 * Send conversation history to Gemini acting as a technical interviewer.
 * @param {Array<{role: string, content: string}>} messages - chat history
 * @param {string} role   - target job role
 * @param {string} company - target company
 * @returns {Promise<string>} AI interviewer's next message
 */
const conductInterview = async (messages, role, company) => {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error("GEMINI_NOT_CONFIGURED");
    err.statusCode = 500;
    throw err;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: [
      `You are a technical interviewer at ${company} interviewing a candidate for the role of ${role}.`,
      "Ask one question at a time. Start with a brief introduction and a warm-up question.",
      "Progress naturally from behavioral to technical questions.",
      "Be conversational, professional, and encouraging.",
      "If the candidate's answer is incomplete, ask a follow-up before moving on.",
      "Do NOT break character or mention that you are an AI.",
    ].join(" "),
  });

  // Trim to last N messages to stay within context limits
  const recent = messages.slice(-MAX_INTERVIEW_MESSAGES);

  const contents = recent.map((m) => ({
    role: m.role === "model" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const result = await model.generateContent({ contents });
  return result.response.text();
};

/**
 * Generate an end-of-interview performance summary.
 * @param {Array<{role: string, content: string}>} messages
 * @param {string} role
 * @param {string} company
 * @returns {Promise<string>} summary text
 */
const generateInterviewSummary = async (messages, role, company) => {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error("GEMINI_NOT_CONFIGURED");
    err.statusCode = 500;
    throw err;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const transcript = messages
    .map((m) => `${m.role === "model" ? "Interviewer" : "Candidate"}: ${m.content}`)
    .join("\n\n");

  const prompt = `You are a senior hiring manager at ${company} reviewing a mock interview transcript for the role of ${role}.

Based on the conversation below, provide a concise performance summary with:
1. **Overall Score**: a number from 0–100
2. **Strengths**: 3–5 bullet points about what the candidate did well
3. **Areas for Improvement**: 3–5 bullet points about what could be improved
4. **Final Verdict**: one sentence summary of readiness

Use markdown formatting. Be constructive and specific.

Transcript:
${transcript}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = {
  analyzePdfBuffer,
  conductInterview,
  generateInterviewSummary,
};

