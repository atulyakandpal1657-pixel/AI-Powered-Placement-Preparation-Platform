"use client";

import { useCallback, useState } from "react";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import api from "@/lib/axios";

const extractErrorMessage = (error: unknown) => {
  if (typeof error !== "object" || error === null) {
    return "An unexpected error occurred.";
  }

  const axiosError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return axiosError.response?.data?.message || axiosError.message || "An unexpected error occurred.";
};

export function useApi<T = unknown>() {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const request = useCallback(
    async <R = T>(config: AxiosRequestConfig) => {
      setLoading(true);
      setError("");

      try {
        const response: AxiosResponse<R> = await api.request(config);
        setData(response.data as unknown as T);
        return response;
      } catch (requestError) {
        const message = extractErrorMessage(requestError);
        setError(message);
        throw requestError;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, request, setData, setError, setLoading };
}
