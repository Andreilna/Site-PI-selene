import api from './api.js';
import { extractArrayData } from '../utils/apiUtils.js';

const severityToStatus = {
  alta: 'Pendente',
  media: 'Em Andamento',
  baixa: 'Concluído',
};

const mapAlertaToReport = (a) => ({
  _id: a._id,
  titulo: `Alerta ${a.tipo || 'sistema'}`,
  descricao: a.mensagem || 'Sem descricao',
  status: a.resolvido ? 'Concluído' : (severityToStatus[a.severidade] || 'Pendente'),
  data: a.timestamp || a.criado_em || new Date().toISOString(),
  hora: a.timestamp ? new Date(a.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
});

export const reportService = {
  getAllReports: async () => {
    try {
      const response = await api.get('/alertas');
      return extractArrayData(response).map(mapAlertaToReport);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      return [];
    }
  },

  getReportById: async (id) => {
    const reports = await reportService.getAllReports();
    return reports.find((r) => r._id === id) || null;
  },

  createReport: async () => {
    throw new Error('Relatorios sao espelho de alertas no backend atual.');
  },

  updateReport: async (id, reportData) => {
    if (reportData.status === 'Concluído') {
      await api.patch(`/alertas/${id}/resolver`, {
        observacoes: reportData.descricao || 'Resolvido via frontend',
      });
      return { success: true };
    }

    throw new Error('A API atual permite apenas marcar alertas como concluidos.');
  },

  deleteReport: async (id) => {
    await api.patch(`/alertas/${id}/resolver`, { observacoes: 'Encerrado' });
  },
};