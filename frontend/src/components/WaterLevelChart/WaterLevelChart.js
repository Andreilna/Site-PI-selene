import React, { useState, useEffect, useMemo } from 'react';
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
  FaTint, 
  FaSpinner,
  FaExclamationTriangle,
  FaCalendarAlt
} from 'react-icons/fa';
import { apiFetch } from '@/services/api';
import styles from './WaterLevelChart.module.css';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip);

const WaterLevelChart = ({ selectedVegetable }) => {
  const [currentHumidity, setCurrentHumidity] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dados padrão para quando não há lote selecionado
  const defaultData = useMemo(() => ({
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Umidade (%)',
        data: [65, 70, 68, 72, 75, 78, 80],
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3498db',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  }), []);

  const chartOptions = {
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
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
            weight: '500'
          },
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  useEffect(() => {
    const fetchHumidityGraph = async () => {
      if (!selectedVegetable?._id) {
        setChartData(defaultData);
        setCurrentHumidity(null);
        setError(null);
        return;
      }

      const sensorDevice = selectedVegetable?.dispositivos?.find(
        (d) => d.tipo === 'ESP32_SENSORES'
      );

      if (!sensorDevice?._id) {
        setChartData(defaultData);
        setCurrentHumidity(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // 7 dias agregados; o endpoint retorna `dados` com `{periodo, valor_medio, ...}`
        const resp = await apiFetch(
          `/leituras/${sensorDevice._id}/grafico?sensor=umidade&periodo=7d&agrupamento=auto`
        );

        const dados = resp?.dados || [];
        const labels = dados.map((p) => p.periodo);
        const values = dados.map((p) => p.valor_medio);
        const last = dados[dados.length - 1];

        setCurrentHumidity(last?.valor_medio ?? null);
        setChartData({
          labels: labels.length ? labels : defaultData.labels,
          datasets: [
            {
              label: `Umidade (%) - ${selectedVegetable.especie}`,
              data: values.length ? values : defaultData.datasets[0].data,
              borderColor: '#3498db',
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#3498db',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 6
            }
          ]
        });
      } catch (err) {
        console.error('Erro ao carregar gráfico de umidade:', err);
        setError('Erro ao carregar série de umidade');
        setChartData(defaultData);
        setCurrentHumidity(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHumidityGraph();
  }, [defaultData, selectedVegetable]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconContainer}>
            <FaTint className={styles.headerIcon} />
          </div>
          <div className={styles.headerContent}>
            <h4 className={styles.title}>
              {selectedVegetable
                ? `UMIDADE - ${selectedVegetable.especie?.toUpperCase()}`
                : 'UMIDADE'}
            </h4>
            <div className={styles.subtitle}>
              <FaCalendarAlt className={styles.subtitleIcon} />
              <span>
                {selectedVegetable
                  ? `Monitoramento da umidade de ${selectedVegetable.especie}`
                  : 'Selecione um cultivo para monitorar'}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.currentLevel}>
            <span className={styles.levelText}>
              {currentHumidity !== null && currentHumidity !== undefined
                ? `${Math.round(currentHumidity)}%`
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className={styles.chartContainer}>
        {loading ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <span>Carregando série temporal...</span>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <FaExclamationTriangle className={styles.errorIcon} />
            <span>{error}</span>
          </div>
        ) : (
          <Line data={chartData || defaultData} options={chartOptions} />
        )}
      </div>

      {/* Legenda */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <FaTint className={styles.legendIcon} style={{color: '#3498db'}} />
          <span>Umidade (%)</span>
        </div>
      </div>
    </div>
  );
};

export default WaterLevelChart;
