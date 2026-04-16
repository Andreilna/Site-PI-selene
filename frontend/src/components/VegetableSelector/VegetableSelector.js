import React, { useCallback, useEffect } from 'react';
import { FaSeedling, FaLeaf, FaCarrot, FaAppleAlt, FaPepperHot, FaSkullCrossbones, FaCircle } from 'react-icons/fa';
import { apiFetch } from '@/services/api';
import useAsyncRequest from '@/hooks/useAsyncRequest';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import styles from './VegetableSelector.module.css';

const VegetableSelector = ({ onVegetableSelect, selectedVegetable }) => {
  const fetchVegetables = useCallback(async () => {
    const response = await apiFetch('/plantas');
    return response?.data || [];
  }, []);

  const { data: vegetables = [], loading, error, retry } = useAsyncRequest(
    fetchVegetables,
    [fetchVegetables]
  );

  // Mapeamento de status do cultivo para ícones
  const getVegetableIcon = (status) => {
    const iconMap = {
      'GERMINACAO': FaSeedling,
      'CRESCENDO': FaLeaf,
      'FLORECENDO': FaAppleAlt,
      'FRUTIFICANDO': FaPepperHot,
      'COLHIDA': FaCircle,
      'MORTA': FaSkullCrossbones,
    };
    return iconMap[status] || FaSeedling;
  };

  // Mapeamento de cores para os status do lote
  const getVegetableColor = (status) => {
    const colorMap = {
      'GERMINACAO': '#4CAF50',
      'CRESCENDO': '#4ECDC4',
      'FLORECENDO': '#FFE66D',
      'FRUTIFICANDO': '#FF9800',
      'COLHIDA': '#8BC34A',
      'MORTA': '#e74c3c',
    };
    return colorMap[status] || '#607D8B';
  };

  // Auto-seleciona o primeiro lote quando carregar
  useEffect(() => {
    if (Array.isArray(vegetables) && vegetables.length > 0 && !selectedVegetable) {
      onVegetableSelect(vegetables[0]);
    }
  }, [vegetables, selectedVegetable, onVegetableSelect]);

  const handleVegetableClick = (vegetable) => {
    onVegetableSelect(vegetable);
  };

  if (loading) {
    return (
      <div className={styles.selector}>
        <LoadingState message="Carregando cultivos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.selector}>
        <ErrorState message="Erro ao carregar cultivos" onRetry={retry} />
      </div>
    );
  }

  if (vegetables.length === 0) {
    return (
      <div className={styles.selector}>
        <EmptyState message="Nenhum cultivo cadastrado. Cadastre um lote para iniciar o monitoramento." />
      </div>
    );
  }

  return (
    <div className={styles.selector}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <FaSeedling className={styles.titleIcon} />
          Selecionar Cultivo
        </h3>
        <p className={styles.subtitle}>Escolha um lote para visualizar os sensores, alertas e câmeras</p>
      </div>
      
      <div className={styles.vegetableGrid}>
        {vegetables.map((vegetable) => {
          const IconComponent = getVegetableIcon(vegetable.status);
          const color = getVegetableColor(vegetable.status);
          const isSelected = selectedVegetable && selectedVegetable._id === vegetable._id;
          
          return (
            <div
              key={vegetable._id}
              className={`${styles.vegetableCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleVegetableClick(vegetable)}
              style={{ '--vegetable-color': color }}
            >
              <div className={styles.cardIcon}>
                <IconComponent />
              </div>
              <div className={styles.cardContent}>
                <h4 className={styles.vegetableName}>
                  {vegetable.especie}
                  {vegetable.variedade ? ` (${vegetable.variedade})` : ''}
                </h4>
                <p className={styles.vegetableType}>
                  {vegetable.status ? vegetable.status.replaceAll('_', ' ') : ''}
                </p>
                {vegetable.localizacao && (
                  <p className={styles.vegetableTime}>{vegetable.localizacao}</p>
                )}
              </div>
              {isSelected && (
                <div className={styles.selectedIndicator}>
                  <div className={styles.checkmark}>✓</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VegetableSelector;
