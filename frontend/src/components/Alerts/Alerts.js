import styles from './Alerts.module.css';
import { useCallback, useMemo } from 'react';
import { apiFetch } from '@/services/api';
import useAsyncRequest from '@/hooks/useAsyncRequest';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { 
  FaExclamationTriangle, 
  FaThermometerHalf, 
  FaTint, 
  FaSun, 
  FaClock,
  FaBell,
  FaFlask,
  FaChartLine,
  FaBatteryHalf
} from 'react-icons/fa';

const iconMap = {
  TEMPERATURA: FaThermometerHalf,
  UMIDADE: FaTint,
  LUMINOSIDADE: FaSun,
  PH: FaFlask,
  CONDUTIVIDADE: FaChartLine,
  NIVEL_AGUA: FaTint,
  BATERIA: FaBatteryHalf,
  CONEXAO: FaBell,
  OUTRO: FaExclamationTriangle,
};

const severityToType = {
  CRITICA: 'danger',
  ALTA: 'warning',
  MEDIA: 'info',
  BAIXA: 'info',
};

const severityPt = {
  CRITICA: 'Crítica',
  ALTA: 'Alta',
  MEDIA: 'Média',
  BAIXA: 'Baixa',
};

const tipoPt = {
  TEMPERATURA: 'Temperatura',
  UMIDADE: 'Umidade',
  LUMINOSIDADE: 'Luminosidade',
  PH: 'pH do substrato',
  CONDUTIVIDADE: 'Condutividade',
  NIVEL_AGUA: 'Umidade crítica',
  BATERIA: 'Bateria',
  CONEXAO: 'Conectividade',
  OUTRO: 'Anomalia',
};

export default function Alerts({ selectedVegetable }) {
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Agora';
    const ts = new Date(timestamp);
    if (Number.isNaN(ts.getTime())) return 'Agora';

    const diffMs = Date.now() - ts.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    if (diffMin <= 0) return 'Agora';
    if (diffMin < 60) return `Há ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Há ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays} d`;
  };

  const selectedVegetableId = selectedVegetable?._id;

  const fetchAlerts = useCallback(async () => {
    if (!selectedVegetableId) return [];
    const resp = await apiFetch(
      `/alertas?planta_id=${selectedVegetableId}&resolvido=false&limite=20`
    );
    const list = resp?.data || [];

    return list.map((a) => {
      const icon = iconMap[a.tipo] || FaExclamationTriangle;
      const type = severityToType[a.severidade] || 'info';

      return {
        id: a._id,
        type,
        icon,
        title: `${tipoPt[a.tipo] || a.tipo} - ${severityPt[a.severidade] || a.severidade}`,
        description: a.mensagem,
        time: formatRelativeTime(a.timestamp),
      };
    });
  }, [selectedVegetableId]);

  const {
    data: alertsData = [],
    loading,
    error,
    retry,
  } = useAsyncRequest(fetchAlerts, [fetchAlerts]);

  const alerts = useMemo(() => alertsData || [], [alertsData]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FaBell className={styles.headerIcon} />
        <h4 className={styles.title}>
          ALERTAS DO CULTIVO
        </h4>
      </div>
      
      <div className={styles.alertsList}>
        {loading ? (
          <LoadingState message="Carregando alertas..." />
        ) : error ? (
          <ErrorState message="Erro ao carregar alertas." onRetry={retry} />
        ) : alerts.length === 0 ? (
          <EmptyState message="Nenhum alerta pendente. Sem desvios ambientais ou focos críticos neste momento." />
        ) : alerts.map((alert) => {
          const IconComponent = alert.icon;
          return (
            <div key={alert.id} className={`${styles.alertCard} ${styles[alert.type]}`}>
              <div className={styles.alertIcon}>
                <IconComponent className={styles.icon} />
              </div>
              <div className={styles.alertContent}>
                <div className={styles.alertTitle}>{alert.title}</div>
                <div className={styles.alertDescription}>{alert.description}</div>
                <div className={styles.alertTime}>
                  <FaClock className={styles.timeIcon} />
                  <span>{alert.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
