import axios from "axios";

console.log("aqui",import.meta.env.VITE_BACKEND_URL);
const baseURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: baseURL || undefined,
});
