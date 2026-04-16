import axios from "axios";
import Cookies from "js-cookie";

const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "/api/v1";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_API_BASE_URL !== ""
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : "http://localhost:4000";

// Garante que sempre exista apenas um `/api/v1` no final
const BASE_URL = API_BASE_URL.endsWith(API_PREFIX)
  ? API_BASE_URL
  : `${API_BASE_URL.replace(/\/$/, "")}${API_PREFIX}`;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Permite envio de cookies
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Pega o token do localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta para tratar erros 401 (token inválido/expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não interfere em erros de login (página inicial)
    const isLoginPage = typeof window !== "undefined" && window.location.pathname === "/";
    
    // Se receber erro 401 e NÃO estiver na página de login, redireciona
    if (error.response?.status === 401 && !isLoginPage) {
      // Limpa token do localStorage e cookie
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        Cookies.remove("token");
        document.cookie = "token=; max-age=0; path=/; HttpOnly";
        
        // Redireciona para a página de login
        window.location.href = "/";
      }
    }
    // Para erros de login (404, 401), apenas rejeita a promise normalmente
    // sem fazer redirecionamento
    return Promise.reject(error);
  }
);

export default api;
