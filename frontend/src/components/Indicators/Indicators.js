import styles from './Indicators.module.css';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/services/api';
import { 
  FaThermometerHalf, 
  FaTint, 
  FaSun, 
  FaCheckCircle,
  FaCloudRain,
  FaWind,
  FaFlask
} from 'react-icons/fa';

export default function Indicators({ selectedVegetable }) {
  const [metrics, setMetrics] = useState({
    temperatura: null,
    umidade: null,
    luminosidade: null,
    ph: null,
    condutividade: null,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      const sensorDevice = selectedVegetable?.dispositivos?.find(
        (d) => d.tipo === 'ESP32_SENSORES'
      );
      const sensorId = sensorDevice?._id;
      if (!sensorId) {
        setMetrics({
          temperatura: null,
          umidade: null,
          luminosidade: null,
          ph: null,
          condutividade: null,
        });
        return;
      }

      try {
        const metricasResp = await apiFetch(
          `/leituras/${sensorId}/metricas?periodo=24h`
        );
        const metricas = metricasResp?.metricas || {};

        const condGraphResp = await apiFetch(
          `/leituras/${sensorId}/grafico?sensor=condutividade&periodo=24h&agrupamento=auto`
        );
        const condData = condGraphResp?.dados || [];
        const lastCond = condData.length ? condData[condData.length - 1] : null;

        setMetrics({
          temperatura: metricas?.temperatura?.media ?? null,
          umidade: metricas?.umidade?.media ?? null,
          luminosidade: metricas?.luminosidade?.media ?? null,
          ph: metricas?.ph?.media ?? null,
          condutividade: lastCond?.valor_medio ?? null,
        });
      } catch (e) {
        console.error('Erro ao buscar métricas:', e);
      }
    };

    fetchMetrics();
  }, [selectedVegetable]);

  const infectionRisk = (() => {
    const { temperatura, umidade } = metrics;
    if (temperatura == null || umidade == null) return { label: "Sem leitura", tone: "Atualizando" };
    if (temperatura >= 26 || umidade >= 85) return { label: "Alto", tone: "Revisar lote" };
    if (temperatura >= 23 || umidade >= 75) return { label: "Moderado", tone: "Monitorar" };
    return { label: "Baixo", tone: "Estável" };
  })();

  const formatOrNA = (value, formatter) =>
    value === null || value === undefined ? 'N/A' : formatter(value);

  return (
    <div className={styles.grid}>
      <div className={`${styles.card} ${styles.blue}`}>
        <div className={styles.iconContainer}>
          <FaThermometerHalf className={styles.icon} />
        </div>
        <div className={styles.content}>
          <div className={styles.label}>Temperatura</div>
          <div className={styles.value}>
            {formatOrNA(metrics.temperatura, (v) => `${Number(v).toFixed(1)}°C`)}
          </div>
          <div className={styles.status}>
            <FaCheckCircle className={styles.statusIcon} />
            <span>Atual</span>
          </div>
        </div>
      </div>
      
      <div className={`${styles.card} ${styles.green}`}>
        <div className={styles.iconContainer}>
          <FaTint className={styles.icon} />
        </div>
        <div className={styles.content}>
          <div className={styles.label}>Umidade</div>
          <div className={styles.value}>
            {formatOrNA(metrics.umidade, (v) => `${Number(v).toFixed(0)}%`)}
          </div>
          <div className={styles.status}>
            <FaCheckCircle className={styles.statusIcon} />
            <span>Atual</span>
          </div>
        </div>
      </div>
      
      <div className={`${styles.card} ${styles.yellow}`}>
        <div className={styles.iconContainer}>
          <FaSun className={styles.icon} />
        </div>
        <div className={styles.content}>
          <div className={styles.label}>Luminosidade</div>
          <div className={styles.value}>
            {formatOrNA(metrics.luminosidade, (v) => `${Number(v).toFixed(0)} lux`)}
          </div>
          <div className={styles.status}>
            <FaCheckCircle className={styles.statusIcon} />
            <span>Atual</span>
          </div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.purple}`}>
        <div className={styles.iconContainer}>
          <FaFlask className={styles.icon} />
        </div>
        <div className={styles.content}>
          <div className={styles.label}>pH do Substrato</div>
          <div className={styles.value}>
            {formatOrNA(metrics.ph, (v) => `${Number(v).toFixed(1)}`)}
          </div>
          <div className={styles.status}>
            <FaCheckCircle className={styles.statusIcon} />
            <span>Faixa lida</span>
          </div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.orange}`}>
        <div className={styles.iconContainer}>
          <FaCloudRain className={styles.icon} />
        </div>
        <div className={styles.content}>
          <div className={styles.label}>Condutividade</div>
          <div className={styles.value}>
            {formatOrNA(metrics.condutividade, (v) => `${Number(v).toFixed(1)} mS/cm`)}
          </div>
          <div className={styles.status}>
            <FaCheckCircle className={styles.statusIcon} />
            <span>Leitura</span>
          </div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.teal}`}>
        <div className={styles.iconContainer}>
          <FaWind className={styles.icon} />
        </div>
        <div className={styles.content}>
          <div className={styles.label}>Risco de Infecção</div>
          <div className={styles.value}>{infectionRisk.label}</div>
          <div className={styles.status}>
            <FaCheckCircle className={styles.statusIcon} />
            <span>{infectionRisk.tone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
