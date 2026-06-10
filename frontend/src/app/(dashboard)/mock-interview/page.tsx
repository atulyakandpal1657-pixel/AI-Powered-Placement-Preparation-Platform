"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import {
  BrainCircuit,
  Building2,
  Briefcase,
  Play,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useAutoDismiss } from "@/hooks/useAutoDismiss";

interface Message {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

interface InterviewSession {
  _id: string;
  role: string;
  company: string;
  status: "active" | "completed";
  messages: Message[];
  summary?: string;
  messageCount?: number;
  createdAt: string;
}

export default function MockInterviewPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  
  // Setup state
  const [roleInput, setRoleInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  
  // Chat state
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const clearError = () => setError("");
  useAutoDismiss(error, clearError);

  // Fetch session history on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (activeSession) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeSession?.messages]);

  const fetchSessions = async () => {
    try {
      setIsLoadingList(true);
      const { data } = await api.get("/interview");
      setSessions(data.sessions);
    } catch (err) {
      console.error("Failed to load sessions", err);
      setError("Failed to load interview history");
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleInput.trim() || !companyInput.trim()) return;

    setIsStarting(true);
    setError("");
    try {
      const { data } = await api.post("/interview", {
        role: roleInput,
        company: companyInput,
      });
      setActiveSession(data.session);
      setRoleInput("");
      setCompanyInput("");
      fetchSessions(); // Refresh list in background
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to start interview");
    } finally {
      setIsStarting(false);
    }
  };

  const handleLoadSession = async (id: string) => {
    try {
      const { data } = await api.get(`/interview/${id}`);
      setActiveSession(data.session);
    } catch (err) {
      setError("Failed to load interview session");
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageInput.trim() || !activeSession || isSending) return;

    const userMessage = messageInput;
    setMessageInput("");
    setIsSending(true);
    setError("");

    // Optimistic update
    const optimisticMsg: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setActiveSession((prev) => 
      prev ? { ...prev, messages: [...prev.messages, optimisticMsg] } : prev
    );

    try {
      const { data } = await api.post(`/interview/${activeSession._id}/message`, {
        content: userMessage,
      });
      // Update with actual AI response
      setActiveSession((prev) => 
        prev ? { ...prev, messages: [...prev.messages, data.message] } : prev
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message");
      // Revert optimistic update on failure
      setActiveSession((prev) => 
        prev ? { ...prev, messages: prev.messages.filter(m => m !== optimisticMsg) } : prev
      );
      setMessageInput(userMessage); // restore input
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndSession = async () => {
    if (!activeSession || activeSession.status === "completed") return;

    if (!confirm("Are you sure you want to end this interview and receive feedback?")) return;

    setIsEnding(true);
    try {
      const { data } = await api.post(`/interview/${activeSession._id}/end`);
      setActiveSession((prev) =>
        prev ? { ...prev, status: "completed", summary: data.summary } : prev
      );
      fetchSessions(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to end interview");
    } finally {
      setIsEnding(false);
    }
  };

  const parseMarkdownSummary = (text: string) => {
    // Basic bold/list parsing for the summary since we don't have a full markdown library loaded here
    // In a real app we might use react-markdown, but we'll do simple replacements for bold and newlines
    let html = text
      .replace(/\\*\\*(.*?)\\*\\*/g, "<strong>$1</strong>") // Bold
      .replace(/\\*(.*?)\\*/g, "<em>$1</em>") // Italics
      .replace(/\\n/g, "<br/>"); // Newlines

    return <div dangerouslySetInnerHTML={{ __html: html }} className="text-sm leading-relaxed" />;
  };

  // ---------------------------------------------------------------------------
  // View: Active Chat
  // ---------------------------------------------------------------------------
  if (activeSession) {
    const isCompleted = activeSession.status === "completed";

    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="glass-card mb-4 p-4 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveSession(null)}
              className="p-2 hover:bg-surface-hover rounded-xl text-muted transition-colors"
              title="Back to sessions"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-semibold text-lg flex items-center gap-2">
                Interview for {activeSession.role}
                {isCompleted && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/20 text-success border border-success/30 ml-2">
                    Completed
                  </span>
                )}
              </h2>
              <p className="text-sm text-muted flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> {activeSession.company}
              </p>
            </div>
          </div>

          {!isCompleted && (
            <button
              onClick={handleEndSession}
              disabled={isEnding || isSending}
              className="px-4 py-2 bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              {isEnding ? "Ending..." : "End Interview"}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm shrink-0">
            {error}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 glass-card p-4 overflow-y-auto space-y-6 flex flex-col mb-4 custom-scrollbar">
          {activeSession.messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={i}
                className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-sm relative group ${
                    isUser
                      ? "bg-gradient-to-br from-accent to-[#887bf9] text-white rounded-tr-sm"
                      : "bg-surface border border-accent/20 rounded-tl-sm text-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <span
                    className={`text-[10px] absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isUser ? "right-1 text-muted" : "left-1 text-muted"
                    }`}
                  >
                    {format(new Date(msg.timestamp), "h:mm a")}
                  </span>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex w-full justify-start">
              <div className="bg-surface border border-accent/20 rounded-2xl rounded-tl-sm p-4 shadow-sm flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Summary Area (if completed) */}
        {isCompleted && activeSession.summary && (
          <div className="glass-card p-5 mb-4 border-accent/40 bg-accent/5 shrink-0 animate-slide-in">
            <h3 className="text-accent font-semibold mb-3 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5" />
              Interview Feedback
            </h3>
            <div className="prose prose-invert prose-sm max-w-none text-muted">
              {parseMarkdownSummary(activeSession.summary)}
            </div>
          </div>
        )}

        {/* Input Area */}
        {!isCompleted && (
          <div className="glass-card p-3 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer... (Shift+Enter for newline)"
                className="flex-1 max-h-32 min-h-[44px] bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 resize-none custom-scrollbar"
                disabled={isSending || isEnding}
                rows={1}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || isSending || isEnding}
                className="p-3 bg-accent hover:bg-accent-hover text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // View: Setup / History
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Mock Interview</h1>
          <p className="text-sm text-muted">Practice with a Gemini-powered interviewer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* New Session Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 border-t-4 border-t-accent">
            <h2 className="text-lg font-semibold mb-4">Start New Interview</h2>
            <form onSubmit={handleStartSession} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted">Target Role</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 absolute left-3 top-3 text-muted" />
                  <input
                    type="text"
                    required
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    placeholder="e.g. Frontend Developer"
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted">Target Company</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-muted" />
                  <input
                    type="text"
                    required
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    placeholder="e.g. Google"
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isStarting || !roleInput.trim() || !companyInput.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent to-[#887bf9] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-accent/20"
              >
                {isStarting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start Interview
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center justify-between">
            Your Interview History
            {isLoadingList && <Loader2 className="w-4 h-4 animate-spin text-muted" />}
          </h2>
          
          <div className="grid gap-3">
            {!isLoadingList && sessions.length === 0 && (
              <div className="glass-card p-8 text-center text-muted border-dashed">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No past interviews found.</p>
                <p className="text-xs mt-1">Start a new one to practice!</p>
              </div>
            )}

            {sessions.map((session) => (
              <div
                key={session._id}
                onClick={() => handleLoadSession(session._id)}
                className="glass-card p-4 hover:border-accent/40 cursor-pointer transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    session.status === "completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  }`}>
                    {session.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center gap-2 text-foreground group-hover:text-accent transition-colors">
                      {session.role}
                      {session.status === "active" && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-warning/20 text-warning border border-warning/30">
                          Active
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {session.company}
                      </span>
                      <span>•</span>
                      <span>{format(new Date(session.createdAt), "MMM d, yyyy")}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {session.messageCount} msg
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
