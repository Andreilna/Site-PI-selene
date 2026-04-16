// src/services/api.js

const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "/api/v1";
const USE_MOCKS = String(process.env.NEXT_PUBLIC_USE_MOCKS || "").toLowerCase() === "true";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_API_BASE_URL !== ""
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : "http://localhost:4000";

// Garante que sempre exista apenas um `/api/v1` no final
const BASE_URL = API_BASE_URL.endsWith(API_PREFIX)
  ? API_BASE_URL
  : `${API_BASE_URL.replace(/\/$/, "")}${API_PREFIX}`;

// Pega token do localStorage ou variável de ambiente
function getToken() {
  if (typeof window !== "undefined") {
    const localToken = localStorage.getItem("token");
    if (localToken) return localToken;
  }
  return process.env.NEXT_PUBLIC_STATIC_TOKEN || null;
}

// Função para limpar token e redirecionar
function handleUnauthorized() {
  if (typeof window !== "undefined") {
    // Limpa token do localStorage e cookie
    localStorage.removeItem("token");
    document.cookie = "token=; max-age=0; path=/; HttpOnly";
    
    // Redireciona para a página de login
    window.location.href = "/";
  }
}

async function tryMock(path, options, reason) {
  // Mock só roda no browser
  if (typeof window === "undefined") throw new Error(reason || "Mock indisponível no servidor");
  const { mockFetch } = await import("./mockServer");
  return await mockFetch(path, options);
}

// Função base de fetch
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Se flag de mock estiver ativa, nem tenta a API real.
  if (USE_MOCKS) {
    return await tryMock(path, { ...options, headers }, "Mocks ativados");
  }

  let response;
  let data = {};
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    data = await response.json().catch(() => ({}));
  } catch (networkErr) {
    // Fallback para mock em caso de API fora do ar / CORS / rede
    try {
      return await tryMock(path, { ...options, headers }, "Falha de rede");
    } catch {
      throw networkErr;
    }
  }

  // Se receber erro 401 (não autorizado), token inválido ou expirado
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error(data?.error || "Token inválido ou expirado");
  }

  if (!response.ok) {
    // Se a API respondeu mas com erro, ainda podemos usar mock para navegar na UI.
    // Isso ajuda a manter as telas funcionando enquanto o backend é ajustado.
    try {
      return await tryMock(path, { ...options, headers }, `Erro ${response.status}`);
    } catch {
      throw new Error(data?.error || `Erro ${response.status}`);
    }
  }
  return data;
}

// Cria métodos HTTP fáceis de usar
export const api = {
  get: (path, options) => apiFetch(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    apiFetch(path, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: (path, body, options) =>
    apiFetch(path, { ...options, method: "PUT", body: JSON.stringify(body) }),
  delete: (path, options) => apiFetch(path, { ...options, method: "DELETE" }),
};

export default api;

// ------------------------
// Funções específicas de cultivo
// ------------------------

export async function getVegetableData(vegetableId) {
  try {
    const response = await apiFetch(`/plantas/${vegetableId}`);
    return response?.data;
  } catch (error) {
    console.error("Erro ao buscar dados do cultivo:", error);
    throw error;
  }
}

export async function getVegetableSensorData(vegetableId) {
  try {
    const vegetable = await getVegetableData(vegetableId);

    const sensorDevice =
      vegetable?.dispositivos?.find((d) => d.tipo === "ESP32_SENSORES") ||
      vegetable?.dispositivos?.[0];

    if (!sensorDevice?._id) {
      throw new Error("Dispositivo ESP32_SENSORES não encontrado para esta planta");
    }

    // Métricas agregadas (média/min/máx) de temperatura/umidade/ph/luminosidade
    const metricasResp = await apiFetch(
      `/leituras/${sensorDevice._id}/metricas?periodo=24h`
    );
    const metricas = metricasResp?.metricas || {};

    // Condutividade: o endpoint de "métricas" não retorna, então usamos um gráfico agregado
    const condGraphResp = await apiFetch(
      `/leituras/${sensorDevice._id}/grafico?sensor=condutividade&periodo=24h&agrupamento=auto`
    );
    const condData = condGraphResp?.dados || [];
    const lastCond = condData.length ? condData[condData.length - 1] : null;

    return {
      temperatura: metricas?.temperatura?.media ?? null,
      umidade: metricas?.umidade?.media ?? null,
      luminosidade: metricas?.luminosidade?.media ?? null,

      // O backend armazena `nivel_agua` como Boolean e não há endpoint gráfico para ele.
      // Por isso, deixamos como `null` (a UI deve tratar/ignorar).
      nivel_agua: null,

      ph_solo: metricas?.ph?.media ?? null,
      condutividade: lastCond?.valor_medio ?? null,
    };
  } catch (error) {
    console.error("Erro ao buscar dados dos sensores:", error);
    throw error;
  }
}

export async function getVegetableGrowthHistory(vegetableId) {
  try {
    const response = await apiFetch(`/plantas/${vegetableId}/crescimento?dias=30`);
    const items = response?.data || [];

    // Mantém o formato antigo (para não quebrar imediatamente a UI),
    // mas a lógica real vem do backend.
    return items.map((item, idx) => ({
      dia: idx + 1,
      crescimento: item?.crescimento_diario ?? null,
      altura: item?.altura_maxima ?? null,
      folhas: 0,
    }));
  } catch (error) {
    console.error("Erro ao buscar histórico de crescimento:", error);
    throw error;
  }
}
