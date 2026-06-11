import Link from "next/link";
import { ArrowRight, Code2, BrainCircuit, FileText } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-[#887bf9] flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">P</span>
          </div>
          <span className="font-bold text-xl tracking-tight">PlacePrep AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-accent transition-colors">
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-full transition-colors"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Your Ultimate Placement Companion
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          Crack your dream job with <span className="gradient-text">AI-powered</span> prep
        </h1>

        <p className="text-lg md:text-xl text-muted max-w-2xl mb-10 animate-slide-up" style={{ animationDelay: "200ms" }}>
          Master DSA, get real-time feedback on your mock interviews, and optimize your resume—all in one intelligent platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <Link
            href="/signup"
            className="flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-accent/25"
          >
            Try it free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-surface hover:bg-surface-hover border border-border rounded-full font-medium text-lg transition-colors"
          >
            See how it works
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full text-left animate-slide-up" style={{ animationDelay: "400ms" }}>
          <div className="glass-card p-6 border-t-4 border-t-[#6c5ce7]">
            <div className="w-12 h-12 bg-[#6c5ce7]/10 rounded-xl flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6 text-[#6c5ce7]" />
            </div>
            <h3 className="text-xl font-bold mb-2">DSA Progress Tracker</h3>
            <p className="text-muted text-sm leading-relaxed">
              Curated list of top 200+ interview problems. Track your progress by topic, difficulty, and company.
            </p>
          </div>

          <div className="glass-card p-6 border-t-4 border-t-[#00d2a0]">
            <div className="w-12 h-12 bg-[#00d2a0]/10 rounded-xl flex items-center justify-center mb-4">
              <BrainCircuit className="w-6 h-6 text-[#00d2a0]" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Mock Interviews</h3>
            <p className="text-muted text-sm leading-relaxed">
              Practice behavioral and technical rounds with Gemini AI. Get instant feedback on your answers.
            </p>
          </div>

          <div className="glass-card p-6 border-t-4 border-t-[#f5a623]">
            <div className="w-12 h-12 bg-[#f5a623]/10 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-[#f5a623]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Resume Analysis</h3>
            <p className="text-muted text-sm leading-relaxed">
              Upload your PDF resume to instantly identify missing keywords, formatting errors, and impact gaps.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
