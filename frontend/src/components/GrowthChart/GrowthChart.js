import styles from '@/components/GrowthChart/GrowthChart.module.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip
} from 'chart.js';
import { 
  FaChartLine, 
  FaThermometerHalf, 
  FaTint, 
  FaSun,
  FaCalendarAlt
} from 'react-icons/fa';
import { useState, useEffect, useCallback } from 'react';
import { getVegetableGrowthHistory } from '@/services/api';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip);

const data = {
  labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  datasets: [
    {
      label: 'Temperatura',
      data: [22, 24, 26, 28, 25, 23, 21],
      borderColor: '#FF6B35',
      backgroundColor: 'rgba(255, 107, 53, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#FF6B35',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6
    },
    {
      label: 'Umidade',
      data: [65, 70, 68, 72, 75, 78, 80],
      borderColor: '#4ECDC4',
      backgroundColor: 'rgba(78, 205, 196, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#4ECDC4',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6
    },
    {
      label: 'Luminosidade',
      data: [45, 50, 55, 60, 65, 70, 75],
      borderColor: '#FFE66D',
      backgroundColor: 'rgba(255, 230, 109, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#FFE66D',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6
    }
  ]
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          weight: '600'
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#ddd',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11,
          weight: '500'
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11,
          weight: '500'
        }
      }
    }
  }
};

export default function GrowthChart({ selectedVegetable }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  const getDaysSincePlanting = () => {
    if (!selectedVegetable?.data_plantio) return null;
    const plantDate = new Date(selectedVegetable.data_plantio);
    if (Number.isNaN(plantDate.getTime())) return null;
    const diffMs = Date.now() - plantDate.getTime();
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    return days;
  };

  const fetchVegetableData = useCallback(async () => {
    if (!selectedVegetable?._id) return;
    
    setLoading(true);
    try {
      const history = await getVegetableGrowthHistory(selectedVegetable._id);
      
      // Cria dados do gráfico com base no histórico do cultivo
      const labels = history.map(item => `Dia ${item.dia}`);
      const crescimentoData = history.map(item => item.crescimento);
      const alturaData = history.map(item => item.altura);

      setChartData({
        labels: labels.slice(-7), // Últimos 7 dias
        datasets: [
          {
            label: 'Crescimento (Δ altura)',
            data: crescimentoData.slice(-7),
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39, 174, 96, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#27ae60',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6
          },
          {
            label: 'Altura (cm)',
            data: alturaData.slice(-7),
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3498db',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6
          },
        ]
      });
    } catch (error) {
      console.error('Erro ao carregar histórico do cultivo:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedVegetable]);

  useEffect(() => {
    if (selectedVegetable) {
      fetchVegetableData();
    } else {
      // Dados padrão quando nenhum lote está selecionado
      setChartData({
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        datasets: [
          {
            label: 'Temperatura',
            data: [22, 24, 26, 28, 25, 23, 21],
            borderColor: '#FF6B35',
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#FF6B35',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6
          },
          {
            label: 'Umidade',
            data: [65, 70, 68, 72, 75, 78, 80],
            borderColor: '#4ECDC4',
            backgroundColor: 'rgba(78, 205, 196, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#4ECDC4',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6
          },
          {
            label: 'Luminosidade',
            data: [45, 50, 55, 60, 65, 70, 75],
            borderColor: '#FFE66D',
            backgroundColor: 'rgba(255, 230, 109, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#FFE66D',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6
          }
        ]
      });
    }
  }, [fetchVegetableData, selectedVegetable]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconContainer}>
            <FaChartLine className={styles.headerIcon} />
          </div>
          <div className={styles.headerContent}>
            <h4 className={styles.title}>
              TENDÊNCIA DO CULTIVO
              {selectedVegetable && (
                <span className={styles.vegetableName}>
                  - {selectedVegetable.especie}
                  {selectedVegetable.variedade ? ` (${selectedVegetable.variedade})` : ''}
                </span>
              )}
            </h4>
            <div className={styles.subtitle}>
              <FaCalendarAlt className={styles.subtitleIcon} />
              <span>
                {selectedVegetable ? 
                  `Acompanhamento do ciclo produtivo de ${selectedVegetable.especie}` :
                  'Série temporal dos últimos 7 dias'
                }
              </span>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.trendIndicator}>
            <span className={styles.trendText}>
              {selectedVegetable ? 
                `${getDaysSincePlanting() ?? 'N/A'} dias` : 
                '+12%'
              }
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.chartContainer}>
        {loading ? (
          <div className={styles.loading}>
            <span>Carregando histórico do cultivo...</span>
          </div>
        ) : chartData ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className={styles.noData}>
            <span>Selecione um cultivo para visualizar o histórico</span>
          </div>
        )}
      </div>
      
      <div className={styles.legend}>
        {selectedVegetable ? (
          <>
            <div className={styles.legendItem}>
              <FaChartLine className={styles.legendIcon} style={{color: '#27ae60'}} />
              <span>Evolução do cultivo</span>
            </div>
            <div className={styles.legendItem}>
              <FaTint className={styles.legendIcon} style={{color: '#3498db'}} />
              <span>Altura estimada</span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.legendItem}>
              <FaThermometerHalf className={styles.legendIcon} style={{color: '#FF6B35'}} />
              <span>Temperatura</span>
            </div>
            <div className={styles.legendItem}>
              <FaTint className={styles.legendIcon} style={{color: '#4ECDC4'}} />
              <span>Umidade</span>
            </div>
            <div className={styles.legendItem}>
              <FaSun className={styles.legendIcon} style={{color: '#FFE66D'}} />
              <span>Luminosidade</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
