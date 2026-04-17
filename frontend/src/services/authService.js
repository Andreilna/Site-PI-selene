// services/authService.js - VERSÃO FINAL
import api from './api.js';
import { extractData } from '../utils/apiUtils.js';

class AuthService {
  async login(email, senha) {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const payload = extractData(response) || {};

      if (payload.token) {
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.usuario || {}));
      }
      
      return payload;
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Credenciais inválidas');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Erro de conexão. Verifique se o backend está rodando.');
      } else {
        throw new Error('Falha no login. Tente novamente.');
      }
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/registrar', userData);
      return extractData(response) || {};
      
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 500) {
        throw new Error('Erro interno do servidor');
      } else {
        throw new Error('Erro ao cadastrar usuário');
      }
    }
  }

  logout() {
    console.log('🚪 Realizando logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  // Método auxiliar para verificar se está logado
  checkAuth() {
    const token = this.getToken();
    const user = this.getUser();
    
    if (!token || !user) {
      return false;
    }
    
    return true;
  }
}

const authService = new AuthService();
export default authService;