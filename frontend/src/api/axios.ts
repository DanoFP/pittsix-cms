import axios from "axios";

// Log de la variable de entorno
console.log("🔧 VITE_API_URL:", import.meta.env.VITE_API_URL);

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  console.log("📤 Request:", config.method?.toUpperCase(), config.baseURL + config.url);
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Log de cada response
API.interceptors.response.use(
  (response) => {
    console.log("📥 Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Error:", error.message, error.config?.url);
    return Promise.reject(error);
  }
);

export default API;