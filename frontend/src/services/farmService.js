import api from './api.js';
import { extractArrayData, extractData } from '../utils/apiUtils.js';
import { STATUS_PLANTA } from '../constants/statusPlanta.js';

const mapPlantaToFarm = (planta) => ({
  _id: planta._id,
  nome: planta.especie || 'Sem nome',
  cidade: planta.localizacao || 'Nao informado',
  estado: '--',
  foco_producao: planta.variedade || 'Cultivo hidroponico',
  area_total: '',
  area_cultivo: '',
  tipo_terreno: '',
  numero_estufas: planta.dispositivos?.length || 0,
  capacidade_producao: '',
  status_operacional: planta.ativo ? 'Ativa' : 'Inativa',
  responsavel: '',
  telefone_responsavel: '',
  email_responsavel: '',
  cnpj: '',
});

const mapFarmToPlantaPayload = (farmData) => ({
  especie: farmData.nome,
  variedade: farmData.foco_producao || farmData.tipo_terreno || 'Nao informado',
  localizacao: farmData.cidade || farmData.rua || 'Nao informado',
  status: farmData.status_operacional === 'Ativa' ? STATUS_PLANTA.CRESCENDO : STATUS_PLANTA.COLHIDA,
  notas: `Responsavel: ${farmData.responsavel || 'Nao informado'}`,
});

export const farmService = {
  getAllFarms: async () => {
    try {
      const response = await api.get('/plantas');
      return extractArrayData(response)
        .filter((p) => p.ativo === true)
        .map(mapPlantaToFarm);
    } catch (error) {
      console.error('Erro ao carregar plantas:', error);
      return [];
    }
  },

  getFarmById: async (id) => {
    try {
      const response = await api.get(`/plantas/${id}`);
      return mapPlantaToFarm(extractData(response) || {});
    } catch (error) {
      console.error('Erro ao carregar planta:', error);
      return null;
    }
  },

  createFarm: async (farmData) => {
    const payload = mapFarmToPlantaPayload(farmData);
    const response = await api.post('/plantas', payload);
    return mapPlantaToFarm(extractData(response) || {});
  },

  updateFarm: async (id, farmData) => {
    const payload = mapFarmToPlantaPayload(farmData);
    const response = await api.put(`/plantas/${id}`, payload);
    return mapPlantaToFarm(extractData(response) || {});
  },

  deleteFarm: async (id) => {
    await api.put(`/plantas/${id}`, { ativo: false, status: STATUS_PLANTA.COLHIDA });
  },
};