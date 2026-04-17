// services/sensorService.js
import api from './api.js';
import { extractArrayData, extractData } from '../utils/apiUtils.js';

const mapDispositivoToSensor = (d) => ({
  _id: d._id,
  nome: d.nome,
  codigo: d.mac_address,
  tipo: d.tipo === 'ESP32_SENSORES' ? 'Temperatura' : 'Camera',
  estufa_id: d.planta || '',
  status: d.online ? 'Ativo' : 'Inativo',
  bateria: 100,
  valor_atual: 0,
  unidade: '°C',
  localizacao: d.localizacao || '',
  ultimaLeitura: d.ultima_comunicacao || null,
});

export const sensorService = {
  getAllSensors: async () => {
    try {
      const response = await api.get('/dispositivos?incluir_inativos=true');
      return extractArrayData(response)
        .filter((d) => d.tipo === 'ESP32_SENSORES')
        .map(mapDispositivoToSensor);
    } catch (error) {
      console.error('Erro ao carregar sensores:', error);
      return [];
    }
  },

  getSensorById: async (id) => {
    const response = await api.get(`/dispositivos/${id}`);
    return mapDispositivoToSensor(extractData(response) || {});
  },

  createSensor: async (sensorData) => {
    // Normalizar MAC
    const normalizarMac = (mac) => {
      if (!mac) return '';
  
      mac = mac.replace(/[^A-Fa-f0-9]/g, '');
  
      if (mac.length === 12) {
        mac = mac.match(/.{1,2}/g).join(':');
      }
  
      return mac.toUpperCase();
    };
  
    const payload = {
      mac_address: normalizarMac(sensorData.codigo),
      nome: sensorData.nome || 'Novo Sensor',
      tipo: 'ESP32_SENSORES',
      localizacao: sensorData.localizacao || '',
      planta: sensorData.estufa_id || undefined, // ✅ CORRETO
    };
  
    console.log("Payload enviado:", payload);
  
    const response = await api.post('/dispositivos', payload);
  
    return mapDispositivoToSensor(
      extractData(response) || {}
    );
  },

  updateSensor: async (id, sensorData) => {
    const payload = {
      nome: sensorData.nome,
      tipo: 'ESP32_SENSORES',
      localizacao: sensorData.localizacao,
      planta_id: sensorData.estufa_id || null,
    };
    const response = await api.put(`/dispositivos/${id}`, payload);
    return mapDispositivoToSensor(extractData(response) || {});
  },

  deleteSensor: async (id) => {
    await api.put(`/dispositivos/${id}/ativo`, { ativo: false });
  },
};