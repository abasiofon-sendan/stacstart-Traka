import axios from "axios";
import { queryClient } from "./query-client";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// NOTE: The backend issues a 1-hour access token with no refresh endpoint, and
// its token decoder never checks the token type. We send the access token as
// bearer so requests stay authenticated. Replace with a proper access-token +
// /accounts/refresh flow once the backend supports it.
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("traka_user");
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch { /* ignore */ }
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (res.config.method !== 'get') {
      queryClient.invalidateQueries({ queryKey: ["reports", "dashboard"] });
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("traka_user");
      window.dispatchEvent(new Event("traka:unauthorized"));
    }
    return Promise.reject(err);
  },
);
