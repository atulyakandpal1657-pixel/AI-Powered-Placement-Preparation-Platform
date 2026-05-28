"use client";

import { useState } from "react";
import { FileUp, Eye, FileText, Sparkles } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

interface ResumeAnalysis {
  atsScore: number;
  missingSkills: string[];
  improvementSuggestions: string[];
}

export default function ResumePage() {
  const { user, checkAuth } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || "");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    setError("");
    setSuccess("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const { data } = await api.post("/auth/resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResumeUrl(data.resumeUrl);
      setSuccess("Resume uploaded successfully");
      setFile(null);
      await checkAuth();
    } catch (err: unknown) {
      const maybeError = err as { response?: { data?: { message?: string } } };
      setError(maybeError.response?.data?.message || "Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a PDF file for analysis");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    setError("");
    setSuccess("");
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const { data } = await api.post("/auth/resume/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAnalysis(data.analysis);
      setSuccess("AI analysis complete");
    } catch (err: unknown) {
      const maybeError = err as { response?: { data?: { message?: string } } };
      setError(maybeError.response?.data?.message || "Failed to analyze resume");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Resume Upload</h1>
          <p className="text-sm text-muted">Upload your resume PDF and preview it anytime</p>
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted">Select PDF resume</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:opacity-90"
          />
          <p className="text-xs text-muted">Maximum file size: 5MB</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
            {success}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleUpload}
            disabled={isUploading || !file}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <FileUp className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Upload Resume"}
          </button>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !file}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent/30 text-accent text-sm font-medium hover:bg-accent/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <Sparkles className="w-4 h-4" />
            {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
          </button>
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h2 className="text-lg font-semibold">AI Resume Analyzer</h2>
        {analysis ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-accent/30 bg-accent/5">
              <p className="text-sm text-muted">ATS Score</p>
              <p className="text-3xl font-bold text-accent">{analysis.atsScore}/100</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Missing Skills</h3>
              {analysis.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg text-xs border border-warning/30 bg-warning/10 text-warning"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No major missing skills detected.</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Improvement Suggestions</h3>
              {analysis.improvementSuggestions.length > 0 ? (
                <ul className="space-y-2 text-sm text-muted">
                  {analysis.improvementSuggestions.map((item) => (
                    <li key={item} className="p-2 rounded-lg bg-surface border border-border">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No suggestions generated.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Upload/select a PDF and click &quot;Analyze with AI&quot; to get ATS score, missing skills,
            and suggestions.
          </p>
        )}
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Resume Preview</h2>
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover"
            >
              <Eye className="w-4 h-4" />
              Open in new tab
            </a>
          )}
        </div>

        {resumeUrl ? (
          <iframe
            src={resumeUrl}
            title="Resume Preview"
            className="w-full h-[70vh] rounded-xl border border-border bg-background"
          />
        ) : (
          <div className="h-52 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
            No resume uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
