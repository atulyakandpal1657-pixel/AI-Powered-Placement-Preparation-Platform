"use client";

import { useCallback, useEffect, useState } from "react";
import { useAutoDismiss } from "@/hooks/useAutoDismiss";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { DemoAccounts } from "./DemoAccounts";
import { SocialLogins } from "./SocialLogins";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const { login, signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => setError(""), []);
  useAutoDismiss(error, clearError);

  const isLogin = mode === "login";
  const [demoAccounts, setDemoAccounts] = useState<
    Array<{ label: string; email: string; password: string }>
  >([]);

  useEffect(() => {
    if (!isLogin) return;
    const loadDemoAccounts = async () => {
      try {
        const { data } = await api.get("/auth/demo-accounts");
        if (data.success && Array.isArray(data.accounts)) {
          setDemoAccounts(data.accounts);
        }
      } catch {
        setDemoAccounts([]);
      }
    };
    loadDemoAccounts();
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await signup({ name, email, password });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (account: { label: string; email: string; password: string }) => {
    setError("");
    setIsLoading(true);
    setEmail(account.email);
    setPassword(account.password);

    try {
      await login({ email: account.email, password: account.password });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Demo login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6c5ce7]/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#a29bfe]/8 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#74b9ff]/5 rounded-full blur-[128px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] mb-4 animate-pulse-glow">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">
            {isLogin ? "Welcome Back" : "Get Started"}
          </h1>
          <p className="text-muted text-sm mt-2">
            {isLogin
              ? "Sign in to continue your preparation journey"
              : "Create your account and start preparing today"}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            {/* Name (signup only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted">Password</label>
                {isLogin && (
                  <a href="#" className="text-xs text-accent hover:text-accent-hover transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            <DemoAccounts 
              accounts={demoAccounts} 
              isLoading={isLoading} 
              onSelect={handleDemoLogin} 
            />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-surface text-muted">or continue with</span>
              </div>
            </div>

            <SocialLogins />
          </form>
        </div>

        {/* Switch mode */}
        <p className="text-center text-sm text-muted mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={isLogin ? "/signup" : "/login"}
            className="text-accent hover:text-accent-hover font-medium transition-colors"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </Link>
        </p>
      </div>
    </div>
  );
}
