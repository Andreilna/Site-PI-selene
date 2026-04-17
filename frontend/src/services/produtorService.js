import api from './api.js';
import { extractData } from '../utils/apiUtils.js';

const mapPerfilToProdutor = (user) => ({
  _id: user._id,
  nome: user.nome_completo || 'Usuario',
  email: user.email || '',
  cpf: '',
  telefone: user.telefone || '',
  data_nascimento: user.data_nascimento || null,
});

export const produtorService = {
  getAllProdutores: async () => {
    try {
      const response = await api.get('/auth/perfil');
      const perfil = extractData(response);
      return perfil ? [mapPerfilToProdutor(perfil)] : [];
    } catch (error) {
      console.error('Erro ao carregar perfil do produtor:', error);
      return [];
    }
  },

  getProdutorById: async (id) => {
    const produtores = await produtorService.getAllProdutores();
    return produtores.find((p) => p._id === id) || null;
  },

  createProdutor: async () => {
    throw new Error('Cadastro de produtor depende de perfil administrador no backend atual.');
  },

  updateProdutor: async (id, produtorData) => {
    const payload = {
      nome_completo: produtorData.nome,
      telefone: produtorData.telefone,
      data_nascimento: produtorData.data_nascimento || null,
      endereco: '',
    };
    const response = await api.put('/auth/perfil', payload);
    return mapPerfilToProdutor(extractData(response) || {});
  },

  deleteProdutor: async () => {
    throw new Error('Exclusao de produtor nao esta disponivel na API atual.');
  },
};