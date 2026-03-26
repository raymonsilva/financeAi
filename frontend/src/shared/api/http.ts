import axios from "axios";
import { authStorage } from "./auth-storage";
import { ApiError, getApiErrorMessage } from "../types/api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

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
