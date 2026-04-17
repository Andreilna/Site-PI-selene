import api from './api.js';
import { extractArrayData, extractData } from '../utils/apiUtils.js';

const randomMac = () =>
  Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join(':');

const mapDispositivoToEstufa = (d) => ({
  _id: d._id,
  nome: d.nome,
  codigo: d.mac_address,
  tipo: d.tipo === 'ESP32_CAM' ? 'Climatizada' : 'Natural',
  descricao: d.localizacao || '',
  status: d.online ? 'Ativa' : 'Inativa',
  numero_compostos: '',
  plantio: {},
});

export const estufaService = {
  getAllEstufas: async () => {
    try {
      const response = await api.get('/dispositivos?incluir_inativos=true');
      return extractArrayData(response)
        .filter((d) => d.tipo === 'ESP32_CAM')
        .map(mapDispositivoToEstufa);
    } catch (error) {
      console.error('Erro ao carregar estufas:', error);
      return [];
    }
  },

  getEstufaById: async (id) => {
    const response = await api.get(`/dispositivos/${id}`);
    return mapDispositivoToEstufa(extractData(response) || {});
  },

  createEstufa: async (estufaData) => {
    const payload = {
      mac_address: randomMac(),
      nome: estufaData.nome,
      tipo: 'ESP32_CAM',
      localizacao: estufaData.descricao || estufaData.nome,
    };
    const response = await api.post('/dispositivos', payload);
    return mapDispositivoToEstufa(extractData(response) || {});
  },

  updateEstufa: async (id, estufaData) => {
    const payload = {
      nome: estufaData.nome,
      tipo: 'ESP32_CAM',
      localizacao: estufaData.descricao || estufaData.nome,
    };
    const response = await api.put(`/dispositivos/${id}`, payload);
    return mapDispositivoToEstufa(extractData(response) || {});
  },

  deleteEstufa: async (id) => {
    await api.put(`/dispositivos/${id}/ativo`, { ativo: false });
  },
};