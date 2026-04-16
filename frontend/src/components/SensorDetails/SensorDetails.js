import styles from './SensorDetails.module.css';
import { useState, useEffect, useMemo } from 'react';
import { getVegetableSensorData } from '@/services/api';
import { 
  FaThermometerHalf, 
  FaTint, 
  FaSeedling, 
  FaFlask,
  FaChartLine,
  FaCog,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock
} from 'react-icons/fa';

export default function SensorDetails({ selectedVegetable }) {
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedVegetable?._id) {
      fetchSensorData();
    } else {
      setSensorData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVegetable?._id]);

  const fetchSensorData = async () => {
    if (!selectedVegetable?._id) return;
    setLoading(true);
    try {
      const data = await getVegetableSensorData(selectedVegetable._id);
      setSensorData(data);
    } catch (error) {
      console.error('Erro ao carregar telemetria ambiental:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (isOk) => (isOk ? FaCheckCircle : FaExclamationTriangle);
  const getStatusColor = (isOk) => (isOk ? '#27ae60' : '#e74c3c');

  const temperature = useMemo(() => {
    if (sensorData?.temperatura != null) return Math.round(sensorData.temperatura);
    return 24;
  }, [sensorData]);

  const waterLevel = useMemo(() => {
    if (sensorData?.umidade != null) return Math.round(sensorData.umidade);
    return null;
  }, [sensorData]);

  const waterStatus = useMemo(() => {
    if (waterLevel === null) return { label: 'N/A', isOk: true };
    if (waterLevel >= 50 && waterLevel <= 80) return { label: 'OK', isOk: true };
    if (waterLevel < 50) return { label: 'Baixa', isOk: false };
    return { label: 'Alta', isOk: false };
  }, [waterLevel]);

  const soilPH = useMemo(() => {
    if (sensorData?.ph_solo != null) return Number(sensorData.ph_solo).toFixed(1);
    return null;
  }, [sensorData]);

  const conductivity = useMemo(() => {
    if (sensorData?.condutividade != null)
      return Number(sensorData.condutividade).toFixed(1);
    return null;
  }, [sensorData]);

  const growthDays = useMemo(() => {
    if (!selectedVegetable?.data_plantio) return 'N/A';
    const plantDate = new Date(selectedVegetable.data_plantio);
    if (Number.isNaN(plantDate.getTime())) return 'N/A';
    const diffMs = Date.now() - plantDate.getTime();
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    return `${days} dias`;
  }, [selectedVegetable]);

  return (
    <div className={styles.container} role="region" aria-label="Detalhes dos sensores">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconContainer} aria-hidden>
            <FaCog className={styles.headerIcon} />
          </div>
          <div className={styles.headerContent}>
            <h4 className={styles.title}>
              DETALHES DOS SENSORES
              {selectedVegetable && (
                <span
                  className={styles.vegetableName}
                  title={`${selectedVegetable.especie}${selectedVegetable.variedade ? ` (${selectedVegetable.variedade})` : ''}`}
                >
                  &nbsp;— {selectedVegetable.especie}
                  {selectedVegetable.variedade ? ` (${selectedVegetable.variedade})` : ''}
                </span>
              )}
            </h4>
            <div className={styles.subtitle}>
              <FaClock className={styles.subtitleIcon} aria-hidden />
              <span>
                {selectedVegetable ? 'Telemetria ambiental e operacional' : 'Dados dos sensores'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sensorsGrid} aria-live="polite">
        {/* Temperatura */}
        <div className={styles.sensorCard}>
          <div className={styles.sensorIcon}><FaThermometerHalf /></div>
          <div className={styles.sensorContent}>
            <div className={styles.sensorLabel}>Temperatura</div>
            <div className={styles.sensorValue}>{temperature}°C</div>
            <div className={styles.sensorStatus}>
              <FaCheckCircle className={styles.statusIcon} style={{ color: '#27ae60' }} />
              <span>Ideal</span>
            </div>
          </div>
        </div>

        {/* Umidade */}
        <div className={styles.sensorCard}>
          <div className={styles.sensorIcon}><FaTint /></div>
          <div className={styles.sensorContent}>
            <div className={styles.sensorLabel}>Umidade</div>
            <div className={styles.sensorValue}>
              {waterLevel !== null ? `${waterLevel}%` : 'N/A'}
            </div>
            <div className={styles.sensorStatus}>
              {(() => {
                const StatusIcon = getStatusIcon(waterStatus.isOk);
                const statusColor = getStatusColor(waterStatus.isOk);
                return (
                  <>
                    <StatusIcon className={styles.statusIcon} style={{ color: statusColor }} />
                    <span>{waterStatus.label}</span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Ciclo do cultivo */}
        <div className={styles.sensorCard}>
          <div className={styles.sensorIcon}><FaSeedling /></div>
          <div className={styles.sensorContent}>
            <div className={styles.sensorLabel}>Ciclo do cultivo</div>
            <div className={styles.sensorValue}>{growthDays}</div>
            <div className={styles.sensorStatus}>
              <FaChartLine className={styles.statusIcon} style={{ color: '#3498db' }} />
              <span>
                {selectedVegetable?.data_colheita_estimada ? 'Estimado' : 'Atual'}
              </span>
            </div>
          </div>
        </div>

        {/* pH */}
        <div className={styles.sensorCard}>
          <div className={styles.sensorIcon}><FaFlask /></div>
          <div className={styles.sensorContent}>
          <div className={styles.sensorLabel}>pH do Substrato</div>
            <div className={styles.sensorValue}>{soilPH ?? 'N/A'}</div>
            <div className={styles.sensorStatus}>
              <FaCheckCircle className={styles.statusIcon} style={{ color: '#27ae60' }} />
              <span>Normal</span>
            </div>
          </div>
        </div>

        {/* Condutividade */}
        <div className={styles.sensorCard}>
          <div className={styles.sensorIcon}><FaChartLine /></div>
          <div className={styles.sensorContent}>
            <div className={styles.sensorLabel}>Condutividade</div>
            <div className={styles.sensorValue}>
              {conductivity !== null ? `${conductivity} mS/cm` : 'N/A'}
            </div>
            <div className={styles.sensorStatus}>
              <FaCheckCircle className={styles.statusIcon} style={{ color: '#27ae60' }} />
              <span>Estável</span>
            </div>
          </div>
        </div>

        {/* Lote selecionado */}
        {selectedVegetable && (
          <div className={styles.sensorCard}>
            <div className={styles.sensorIcon}><FaSeedling /></div>
            <div className={styles.sensorContent}>
              <div className={styles.sensorLabel}>Lote monitorado</div>
              <div
                className={styles.sensorValue}
                title={`${selectedVegetable.especie} ${selectedVegetable.variedade || ''}`}
              >
                {selectedVegetable.especie}
                {selectedVegetable.variedade ? ` (${selectedVegetable.variedade})` : ''}
              </div>
              <div className={styles.sensorStatus}>
                <FaCheckCircle className={styles.statusIcon} style={{ color: '#27ae60' }} />
                <span>Cadastrado</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className={styles.loading}>
          <span>Carregando dados dos sensores...</span>
        </div>
      )}
    </div>
  );
}
