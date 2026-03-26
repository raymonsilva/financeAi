import axios from "axios";
import { authStorage } from "./auth-storage";
import { ApiError, getApiErrorMessage } from "../types/api";

const normalizeApiUrl = (rawUrl?: string) => {
  if (!rawUrl) {
    return "http://localhost:3000";
  }

  const trimmed = rawUrl.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

export const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

http.interceptors.request.use((config) => {
  const token = authStorage.get()?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined;
    const message = getApiErrorMessage(error?.response?.data, "Erro inesperado na API.");

    if (status === 401) {
      authStorage.clear();
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(new ApiError(message, status));
  }
);
