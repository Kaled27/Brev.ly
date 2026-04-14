import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: baseURL || undefined,
});
