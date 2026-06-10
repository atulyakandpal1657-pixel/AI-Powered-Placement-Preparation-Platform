jest.mock("@google/generative-ai");
jest.mock("pdf-parse", () => jest.fn());

const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdfParse = require("pdf-parse");

// We need to access internal helpers for thorough testing.
// Since they aren't exported, we test them indirectly through analyzePdfBuffer,
// except extractJsonBlock and normalizeAnalysis which we re-implement minimally
// to validate the module's behavior end-to-end.

const { analyzePdfBuffer } = require("../../services/aiService");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_AI_JSON = JSON.stringify({
  atsScore: 72,
  missingSkills: ["Docker", "Kubernetes"],
  improvementSuggestions: ["Add quantified achievements"],
});

const setupGeminiMock = (responseText) => {
  const generateContent = jest.fn().mockResolvedValue({
    response: { text: () => responseText },
  });
  const getGenerativeModel = jest.fn().mockReturnValue({ generateContent });
  GoogleGenerativeAI.mockImplementation(() => ({ getGenerativeModel }));
  return { generateContent, getGenerativeModel };
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("aiService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, GEMINI_API_KEY: "test-key" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // ── Happy path ──────────────────────────────────────────────────────────

  it("analyzes a valid PDF buffer and returns normalized results", async () => {
    pdfParse.mockResolvedValue({ text: "  John Doe, Software Engineer  " });
    setupGeminiMock(VALID_AI_JSON);

    const result = await analyzePdfBuffer(Buffer.from("fake-pdf"));

    expect(result).toEqual({
      analysis: {
        atsScore: 72,
        missingSkills: ["Docker", "Kubernetes"],
        improvementSuggestions: ["Add quantified achievements"],
      },
      extractedTextLength: "John Doe, Software Engineer".length,
    });
    expect(pdfParse).toHaveBeenCalledTimes(1);
  });

  // ── Error: GEMINI_NOT_CONFIGURED ────────────────────────────────────────

  it("throws GEMINI_NOT_CONFIGURED (500) when API key is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    pdfParse.mockResolvedValue({ text: "Some resume text" });

    await expect(analyzePdfBuffer(Buffer.from("fake-pdf"))).rejects.toMatchObject({
      message: "GEMINI_NOT_CONFIGURED",
      statusCode: 500,
    });
  });

  // ── Error: NO_PDF_TEXT ──────────────────────────────────────────────────

  it("throws NO_PDF_TEXT (400) when PDF has no extractable text", async () => {
    pdfParse.mockResolvedValue({ text: "   " });

    await expect(analyzePdfBuffer(Buffer.from("fake-pdf"))).rejects.toMatchObject({
      message: "NO_PDF_TEXT",
      statusCode: 400,
    });
  });

  it("throws NO_PDF_TEXT (400) when PDF text is null", async () => {
    pdfParse.mockResolvedValue({ text: null });

    await expect(analyzePdfBuffer(Buffer.from("fake-pdf"))).rejects.toMatchObject({
      message: "NO_PDF_TEXT",
      statusCode: 400,
    });
  });

  // ── Error: INVALID_AI_RESPONSE ──────────────────────────────────────────

  it("throws INVALID_AI_RESPONSE (502) when Gemini returns non-JSON", async () => {
    pdfParse.mockResolvedValue({ text: "Valid resume content" });
    setupGeminiMock("Sorry, I cannot process that request.");

    await expect(analyzePdfBuffer(Buffer.from("fake-pdf"))).rejects.toMatchObject({
      message: "INVALID_AI_RESPONSE",
      statusCode: 502,
    });
  });

  // ── Fenced JSON extraction ──────────────────────────────────────────────

  it("correctly extracts JSON from ```json fenced code blocks", async () => {
    pdfParse.mockResolvedValue({ text: "Resume text here" });
    const fencedResponse = "Here is the analysis:\n```json\n" + VALID_AI_JSON + "\n```\nDone.";
    setupGeminiMock(fencedResponse);

    const result = await analyzePdfBuffer(Buffer.from("fake-pdf"));

    expect(result.analysis.atsScore).toBe(72);
    expect(result.analysis.missingSkills).toEqual(["Docker", "Kubernetes"]);
  });

  // ── normalizeAnalysis clamping ──────────────────────────────────────────

  it("clamps atsScore to 0-100 and truncates arrays to max lengths", async () => {
    pdfParse.mockResolvedValue({ text: "Resume text" });

    const extremeResponse = JSON.stringify({
      atsScore: 250, // should be clamped to 100
      missingSkills: Array.from({ length: 20 }, (_, i) => `Skill${i}`), // should be truncated to 12
      improvementSuggestions: Array.from({ length: 15 }, (_, i) => `Suggestion${i}`), // should be truncated to 10
    });
    setupGeminiMock(extremeResponse);

    const result = await analyzePdfBuffer(Buffer.from("fake-pdf"));

    expect(result.analysis.atsScore).toBe(100);
    expect(result.analysis.missingSkills).toHaveLength(12);
    expect(result.analysis.improvementSuggestions).toHaveLength(10);
  });

  it("defaults atsScore to 0 when non-numeric and arrays to [] when not arrays", async () => {
    pdfParse.mockResolvedValue({ text: "Resume text" });

    const badTypesResponse = JSON.stringify({
      atsScore: "not-a-number",
      missingSkills: "not-an-array",
      improvementSuggestions: null,
    });
    setupGeminiMock(badTypesResponse);

    const result = await analyzePdfBuffer(Buffer.from("fake-pdf"));

    expect(result.analysis.atsScore).toBe(0);
    expect(result.analysis.missingSkills).toEqual([]);
    expect(result.analysis.improvementSuggestions).toEqual([]);
  });
});
