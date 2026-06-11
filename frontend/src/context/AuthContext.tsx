"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

// User type based on backend model
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  resumeUrl?: string;
  lastActive?: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  signup: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const extractApiErrorMessage = (
  error: unknown,
  fallback: string
) => {
  const maybeError = error as {
    response?: { data?: { message?: string; errors?: Array<{ msg?: string }> } };
  };
  const firstValidationError = maybeError.response?.data?.errors?.[0]?.msg;
  return firstValidationError || maybeError.response?.data?.message || fallback;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/auth/me");
      if (data.success) {
        setUser(data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth();
    }, 0);
    return () => clearTimeout(timer);
  }, [checkAuth]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      if (data.success) {
        setUser(data.user);
        // Set cookie from frontend so middleware.ts can read it
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        router.refresh(); // forces middleware to re-evaluate with new cookie
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      throw new Error(extractApiErrorMessage(error, "Login failed"));
    }
  };

  const signup = async (userData: { name: string; email: string; password: string }) => {
    try {
      const { data } = await api.post("/auth/signup", userData);
      if (data.success) {
        setUser(data.user);
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        router.refresh();
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      throw new Error(extractApiErrorMessage(error, "Signup failed"));
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setUser(null);
      // Clear the frontend cookie too
      document.cookie = "token=; path=/; max-age=0";
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
