// Mock API local (fallback) para desenvolvimento/preview.
// Ativa com NEXT_PUBLIC_USE_MOCKS=true ou quando a API real falhar.

function nowIso() {
  return new Date().toISOString();
}

function daysAgoIso(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function hoursAgoIso(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function stableId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
}

const STORAGE_KEY = "selene_mock_db_v1";

function defaultDb() {
  const planta1Id = stableId("planta");
  const planta2Id = stableId("planta");
  const sensor1Id = stableId("dev_sensor");
  const cam1Id = stableId("dev_cam");
  const cam2Id = stableId("dev_cam");
  const sensor2Id = stableId("dev_sensor");
  const cam3Id = stableId("dev_cam");

  const plantas = [
    {
      _id: planta1Id,
      especie: "Pleurotus ostreatus",
      variedade: "Shimeji",
      localizacao: "Sala 1 / Prateleira A",
      status: "CRESCENDO",
      data_plantio: daysAgoIso(18),
      data_colheita_estimada: daysAgoIso(-18),
      notas: "Lote de referência para validação de sensores.",
      criado_em: daysAgoIso(20),
      dispositivos: [
        { _id: sensor1Id, tipo: "ESP32_SENSORES", nome: "Sensores A", online: true, bateria: 78 },
        { _id: cam1Id, tipo: "ESP32_CAM", nome: "Câmera A1", online: true, bateria: 55 },
        { _id: cam2Id, tipo: "ESP32_CAM", nome: "Câmera A2", online: false, bateria: 14 },
      ],
    },
    {
      _id: planta2Id,
      especie: "Agaricus bisporus",
      variedade: "Champignon",
      localizacao: "Sala 2 / Rack B",
      status: "GERMINACAO",
      data_plantio: daysAgoIso(4),
      data_colheita_estimada: daysAgoIso(-28),
      notas: "Lote novo; acompanhar umidade nas primeiras 72h.",
      criado_em: daysAgoIso(5),
      dispositivos: [
        { _id: sensor2Id, tipo: "ESP32_SENSORES", nome: "Sensores B", online: true, bateria: 91 },
        { _id: cam3Id, tipo: "ESP32_CAM", nome: "Câmera B1", online: true, bateria: 66 },
      ],
    },
  ];

  const crescimento = {
    [planta1Id]: Array.from({ length: 30 }).map((_, idx) => {
      const dia = idx + 1;
      const altura = 5 + dia * 0.8 + rand(-0.6, 0.6);
      const delta = idx === 0 ? altura : altura - (5 + (dia - 1) * 0.8);
      return {
        dia,
        crescimento_diario: Math.max(0, Number(delta.toFixed(2))),
        altura_maxima: Number(altura.toFixed(2)),
        timestamp: daysAgoIso(30 - dia),
      };
    }),
    [planta2Id]: Array.from({ length: 14 }).map((_, idx) => {
      const dia = idx + 1;
      const altura = 2 + dia * 0.35 + rand(-0.3, 0.3);
      const delta = idx === 0 ? altura : altura - (2 + (dia - 1) * 0.35);
      return {
        dia,
        crescimento_diario: Math.max(0, Number(delta.toFixed(2))),
        altura_maxima: Number(altura.toFixed(2)),
        timestamp: daysAgoIso(14 - dia),
      };
    }),
  };

  return {
    plantas,
    crescimento,
    leituras: {}, // gerado sob demanda
    alertas: [], // gerado sob demanda
  };
}

function loadDb() {
  if (typeof window === "undefined") return defaultDb();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const db = defaultDb();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      return db;
    }
    const parsed = JSON.parse(raw);
    if (!parsed?.plantas) throw new Error("invalid");
    return parsed;
  } catch {
    const db = defaultDb();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {}
    return db;
  }
}

function saveDb(db) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {}
}

function ok(body) {
  return body;
}

function buildGrafico(periodo, sensor) {
  const points = periodo === "7d" ? 7 : 24;
  const labels =
    periodo === "7d"
      ? ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
      : Array.from({ length: points }).map((_, i) => `${String(i).padStart(2, "0")}:00`);

  const baseBySensor = {
    umidade: 70,
    temperatura: 24,
    luminosidade: 60,
    condutividade: 1.8,
    ph: 6.6,
  };
  const ampBySensor = {
    umidade: 10,
    temperatura: 3,
    luminosidade: 15,
    condutividade: 0.35,
    ph: 0.25,
  };

  const base = baseBySensor[sensor] ?? 50;
  const amp = ampBySensor[sensor] ?? 10;
  const dados = labels.map((label, idx) => {
    const noise = rand(-amp, amp);
    const drift = Math.sin((idx / Math.max(1, points - 1)) * Math.PI * 2) * (amp * 0.3);
    const v = base + noise + drift;
    return {
      periodo: label,
      valor_medio: Number(v.toFixed(2)),
      valor_min: Number((v - amp * 0.6).toFixed(2)),
      valor_max: Number((v + amp * 0.6).toFixed(2)),
    };
  });

  return { dados };
}

function buildMetricas() {
  const temperatura = rand(21, 28);
  const umidade = rand(55, 86);
  const luminosidade = rand(35, 85);
  const ph = rand(6.1, 6.9);

  const metricas = {
    temperatura: { media: Number(temperatura.toFixed(1)), min: Number((temperatura - 1.4).toFixed(1)), max: Number((temperatura + 1.6).toFixed(1)) },
    umidade: { media: Number(umidade.toFixed(0)), min: Number((umidade - 7).toFixed(0)), max: Number((umidade + 6).toFixed(0)) },
    luminosidade: { media: Number(luminosidade.toFixed(0)), min: Number((luminosidade - 15).toFixed(0)), max: Number((luminosidade + 12).toFixed(0)) },
    ph: { media: Number(ph.toFixed(1)), min: Number((ph - 0.3).toFixed(1)), max: Number((ph + 0.3).toFixed(1)) },
  };

  return { metricas };
}

function ensureAlertas(db, plantaId) {
  const has = db.alertas.some((a) => a.planta_id === plantaId && a.resolvido === false);
  if (has) return;

  const tipos = ["UMIDADE", "TEMPERATURA", "PH", "CONDUTIVIDADE", "CONEXAO", "BATERIA"];
  const severidades = ["BAIXA", "MEDIA", "ALTA", "CRITICA"];
  const mensagens = [
    "Desvio detectado fora da janela ideal.",
    "Leitura instável; verifique calibração do sensor.",
    "Risco moderado de contaminação por excesso de umidade.",
    "Dispositivo com sinal intermitente.",
    "Bateria abaixo do recomendado para operação contínua.",
  ];

  const qtd = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < qtd; i++) {
    db.alertas.push({
      _id: stableId("alerta"),
      planta_id: plantaId,
      tipo: pick(tipos),
      severidade: pick(severidades),
      mensagem: pick(mensagens),
      timestamp: hoursAgoIso(2 + i * 3),
      resolvido: false,
    });
  }
}

function parseUrl(path) {
  const u = new URL(`http://mock.local${path}`);
  return { pathname: u.pathname, searchParams: u.searchParams };
}

export async function mockFetch(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const { pathname, searchParams } = parseUrl(path);
  const db = loadDb();

  // ---------- Plantas ----------
  if (method === "GET" && pathname === "/plantas") {
    return ok({ data: db.plantas.filter((p) => p.ativo !== false) });
  }

  const plantaIdMatch = pathname.match(/^\/plantas\/([^/]+)$/);
  if (method === "GET" && plantaIdMatch) {
    const id = plantaIdMatch[1];
    const p = db.plantas.find((x) => x._id === id);
    if (!p) throw new Error("Cultivo não encontrado");
    return ok({ data: p });
  }

  const crescimentoMatch = pathname.match(/^\/plantas\/([^/]+)\/crescimento$/);
  if (method === "GET" && crescimentoMatch) {
    const id = crescimentoMatch[1];
    const dias = Number(searchParams.get("dias") || "30");
    const list = db.crescimento[id] || [];
    return ok({ data: list.slice(-Math.max(1, dias)) });
  }

  if (method === "POST" && pathname === "/plantas") {
    const body = typeof options.body === "string" ? JSON.parse(options.body) : options.body || {};
    const id = stableId("planta");
    const sensorId = stableId("dev_sensor");
    const camId = stableId("dev_cam");
    const planta = {
      _id: id,
      especie: body.especie || "Pleurotus ostreatus",
      variedade: body.variedade || null,
      localizacao: body.localizacao || "Sem localização",
      status: body.status || "GERMINACAO",
      data_plantio: body.data_plantio || nowIso(),
      data_colheita_estimada: body.data_colheita_estimada || null,
      notas: body.notas || null,
      criado_em: nowIso(),
      dispositivos: [
        { _id: sensorId, tipo: "ESP32_SENSORES", nome: "Sensores (mock)", online: true, bateria: 88 },
        { _id: camId, tipo: "ESP32_CAM", nome: "Câmera (mock)", online: true, bateria: 61 },
      ],
    };
    db.plantas.unshift(planta);
    saveDb(db);
    return ok({ data: planta });
  }

  if (method === "PUT" && plantaIdMatch) {
    const id = plantaIdMatch[1];
    const idx = db.plantas.findIndex((x) => x._id === id);
    if (idx === -1) throw new Error("Cultivo não encontrado");
    const body = typeof options.body === "string" ? JSON.parse(options.body) : options.body || {};

    // Arquivamento (ativo=false) ou atualização de campos
    db.plantas[idx] = { ...db.plantas[idx], ...body };
    saveDb(db);
    return ok({ data: db.plantas[idx] });
  }

  // ---------- Leituras / métricas / gráficos ----------
  const metricasMatch = pathname.match(/^\/leituras\/([^/]+)\/metricas$/);
  if (method === "GET" && metricasMatch) {
    return ok(buildMetricas());
  }

  const graficoMatch = pathname.match(/^\/leituras\/([^/]+)\/grafico$/);
  if (method === "GET" && graficoMatch) {
    const sensor = searchParams.get("sensor") || "umidade";
    const periodo = searchParams.get("periodo") || "24h";
    const periodoNorm = periodo === "7d" ? "7d" : "24h";
    return ok(buildGrafico(periodoNorm, sensor));
  }

  const historicoMatch = pathname.match(/^\/leituras\/([^/]+)\/historico$/);
  if (method === "GET" && historicoMatch) {
    // Para câmera, devolve uma “leitura” com foto_path (usamos background local como fallback)
    const fotoOptions = ["/background.jpg", "/background.jpg", "/background.jpg"];
    const limit = Number(searchParams.get("limit") || "1");
    const data = Array.from({ length: Math.max(1, Math.min(10, limit)) }).map((_, idx) => ({
      _id: stableId("leitura"),
      timestamp: hoursAgoIso(idx),
      dados: {
        foto_path: pick(fotoOptions),
      },
    }));
    return ok({ data });
  }

  // ---------- Alertas ----------
  if (method === "GET" && pathname === "/alertas") {
    const plantaId = searchParams.get("planta_id");
    if (plantaId) ensureAlertas(db, plantaId);
    const resolvido = searchParams.get("resolvido");
    const onlyOpen = resolvido === "false";
    const limite = Number(searchParams.get("limite") || "20");

    const list = db.alertas
      .filter((a) => (!plantaId ? true : a.planta_id === plantaId))
      .filter((a) => (onlyOpen ? a.resolvido === false : true))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, Math.max(1, limite));

    saveDb(db);
    return ok({ data: list });
  }

  // Endpoint desconhecido no mock
  throw new Error(`Mock sem rota para ${method} ${pathname}`);
}

