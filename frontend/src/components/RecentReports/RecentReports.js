import styles from './RecentReports.module.css';
import { useState, useEffect, useCallback } from 'react';
import { getVegetableSensorData } from '@/services/api';
import { 
  FaFileAlt, 
  FaChartLine, 
  FaTint, 
  FaSeedling,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaDownload,
  FaEye,
  FaThermometerHalf,
  FaFlask
} from 'react-icons/fa';

export default function RecentReports({ selectedVegetable }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const getDefaultReports = useCallback(() => [
    {
      id: 1,
      date: '2024/01/15',
      type: 'Panorama do cultivo',
      status: 'OK',
      icon: FaFileAlt,
      color: '#27ae60'
    },
    {
      id: 2,
      date: '2024/01/14',
      type: 'Análise do substrato',
      status: 'OK',
      icon: FaChartLine,
      color: '#3498db'
    },
    {
      id: 3,
      date: '2024/01/13',
      type: 'Monitoramento ambiental',
      status: 'Pendente',
      icon: FaSpinner,
      color: '#f39c12'
    }
  ], []);

  const generateReports = useCallback(async () => {
    if (!selectedVegetable?._id) return;
    
    setLoading(true);
    try {
      const sensorData = await getVegetableSensorData(selectedVegetable._id);
      
      const today = new Date();
      const plantDate = selectedVegetable?.data_plantio ? new Date(selectedVegetable.data_plantio) : null;
      const harvestDate = selectedVegetable?.data_colheita_estimada
        ? new Date(selectedVegetable.data_colheita_estimada)
        : null;

      const daysSincePlanting = plantDate && !Number.isNaN(plantDate.getTime())
        ? Math.max(0, Math.floor((today.getTime() - plantDate.getTime()) / (1000 * 60 * 60 * 24)))
        : null;

      const growthPercent =
        harvestDate && !Number.isNaN(harvestDate.getTime()) && daysSincePlanting !== null
          ? Math.min(
              100,
              Math.max(
                0,
                Math.round(
                  (daysSincePlanting / Math.max(1, Math.floor((harvestDate.getTime() - plantDate.getTime()) / (1000 * 60 * 60 * 24)))) * 100
                )
              )
            )
          : null;

      const reports = [
        {
          id: 1,
          date: today.toISOString().split('T')[0],
          type: `${selectedVegetable.especie} - Evolução do lote`,
          status: 'OK',
          icon: FaSeedling,
          color: '#27ae60',
          value: growthPercent !== null ? `${growthPercent}%` : `${daysSincePlanting ?? 'N/A'} dias`
        },
        {
          id: 2,
          date: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: `${selectedVegetable.especie} - Umidade ambiente`,
          status: sensorData?.umidade >= 50 && sensorData?.umidade <= 80 ? 'OK' : 'Atenção',
          icon: FaTint,
          color: sensorData?.umidade >= 50 && sensorData?.umidade <= 80 ? '#27ae60' : '#e74c3c',
          value: `${Math.round(sensorData?.umidade ?? 0)}%`
        },
        {
          id: 3,
          date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: `${selectedVegetable.especie} - Temperatura`,
          status: 'OK',
          icon: FaThermometerHalf,
          color: '#3498db',
          value: `${Math.round(sensorData?.temperatura ?? 0)}°C`
        },
        {
          id: 4,
          date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: `${selectedVegetable.especie} - pH do substrato`,
          status: 'OK',
          icon: FaFlask,
          color: '#8e44ad',
          value: `${sensorData?.ph_solo?.toFixed(1) || 'N/A'} pH`
        }
      ];
      
      setReports(reports);
    } catch (error) {
      console.error('Erro ao gerar relatórios:', error);
      setReports(getDefaultReports());
    } finally {
      setLoading(false);
    }
  }, [getDefaultReports, selectedVegetable]);

  useEffect(() => {
    if (selectedVegetable) {
      generateReports();
    } else {
      setReports(getDefaultReports());
    }
  }, [generateReports, getDefaultReports, selectedVegetable]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OK':
        return FaCheckCircle;
      case 'Atenção':
        return FaExclamationTriangle;
      case 'Pendente':
        return FaSpinner;
      default:
        return FaCheckCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OK':
        return '#27ae60';
      case 'Atenção':
        return '#e74c3c';
      case 'Pendente':
        return '#f39c12';
      default:
        return '#27ae60';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconContainer}>
            <FaFileAlt className={styles.headerIcon} />
          </div>
          <div className={styles.headerContent}>
            <h4 className={styles.title}>
              RELATÓRIOS E INFERÊNCIAS
              {selectedVegetable && (
                <span className={styles.vegetableName}>
                  - {selectedVegetable.especie}
                  {selectedVegetable.variedade ? ` (${selectedVegetable.variedade})` : ''}
                </span>
              )}
            </h4>
            <div className={styles.subtitle}>
              <FaClock className={styles.subtitleIcon} />
              <span>
                {selectedVegetable ? 
                  `Relatórios específicos do cultivo` :
                  'Últimas leituras consolidadas'
                }
              </span>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.downloadBtn}>
            <FaDownload className={styles.downloadIcon} />
          </button>
        </div>
      </div>

      <div className={styles.reportsList}>
        {loading ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <span>Gerando relatórios do cultivo...</span>
          </div>
        ) : (
          reports.map((report) => {
            const IconComponent = report.icon;
            const StatusIcon = getStatusIcon(report.status);
            const statusColor = getStatusColor(report.status);
            
            return (
              <div key={report.id} className={styles.reportCard}>
                <div className={styles.reportIcon}>
                  <IconComponent style={{ color: report.color }} />
                </div>
                <div className={styles.reportContent}>
                  <div className={styles.reportHeader}>
                    <div className={styles.reportType}>{report.type}</div>
                    <div className={styles.reportDate}>{report.date}</div>
                  </div>
                  <div className={styles.reportValue}>{report.value}</div>
                  <div className={styles.reportStatus}>
                    <StatusIcon className={styles.statusIcon} style={{ color: statusColor }} />
                    <span style={{ color: statusColor }}>{report.status}</span>
                  </div>
                </div>
                <div className={styles.reportActions}>
                  <button className={styles.viewBtn}>
                    <FaEye />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
