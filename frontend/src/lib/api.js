import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SESSION_KEY = "railwayhub_session";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const rawSession = window.localStorage.getItem(SESSION_KEY);

  if (!rawSession) {
    return config;
  }

  try {
    const session = JSON.parse(rawSession);

    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
  }

  return config;
});

export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong.";

export { API_BASE_URL, SESSION_KEY };
