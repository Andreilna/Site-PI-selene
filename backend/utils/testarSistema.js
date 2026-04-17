require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.TEST_API_URL || `http://localhost:${process.env.PORT || 3000}/api/v1`;
const TOKEN = process.env.TEST_TOKEN || '';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}
});

const endpoints = [
  '/dashboard/principal',
  '/plantas',
  '/dispositivos',
  '/leituras'
];

async function testarEndpoint(path) {
  try {
    const response = await client.get(path);
    console.log(`OK  ${path} -> ${response.status}`);
    return { path, ok: true, status: response.status };
  } catch (error) {
    const status = error.response?.status || 0;
    const message = error.response?.data?.message || error.message;
    console.log(`ERRO ${path} -> ${status} (${message})`);
    return { path, ok: false, status, message };
  }
}

async function main() {
  console.log(`Testando API: ${API_URL}`);
  if (!TOKEN) {
    console.log('Aviso: TEST_TOKEN não definido. Endpoints autenticados podem retornar 401.');
  }

  const results = [];
  for (const endpoint of endpoints) {
    // eslint-disable-next-line no-await-in-loop
    const result = await testarEndpoint(endpoint);
    results.push(result);
  }

  const okCount = results.filter((r) => r.ok).length;
  console.log(`\nResumo: ${okCount}/${results.length} endpoints OK`);

  if (okCount !== results.length) {
    process.exitCode = 1;
  }
}

main();
