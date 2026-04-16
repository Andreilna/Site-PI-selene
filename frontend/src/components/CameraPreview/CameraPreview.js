import styles from './CameraPreview.module.css';
import { 
  FaVideo, 
  FaCamera, 
  FaPlay, 
  FaExpand,
  FaDownload,
  FaEye,
  FaCog
} from 'react-icons/fa';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/services/api';

export default function CameraPreview({ selectedVegetable }) {
  const [photos, setPhotos] = useState({ main: null, secondary: null });

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_API_BASE_URL !== ""
      ? process.env.NEXT_PUBLIC_API_BASE_URL
      : "http://localhost:4000";

  const buildPhotoUrl = useCallback((fotoPath) => {
    if (!fotoPath) return null;
    if (fotoPath.startsWith('http')) return fotoPath;
    return `${API_BASE_URL}${fotoPath}`;
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchLastPhoto = async (dispositivoId) => {
      const resp = await apiFetch(
        `/leituras/${dispositivoId}/historico?limit=1&page=1`
      );
      const leitura = resp?.data?.[0];
      const fotoPath =
        leitura?.dados?.foto_path || leitura?.dados?.fotoPath || null;
      return buildPhotoUrl(fotoPath);
    };

    const camDevices = selectedVegetable?.dispositivos?.filter(
      (d) => d.tipo === 'ESP32_CAM'
    );

    if (!selectedVegetable || !camDevices || camDevices.length === 0) {
      setPhotos({ main: null, secondary: null });
      return;
    }

    const mainId = camDevices[0]?._id;
    const secondaryId = camDevices[1]?._id;

    Promise.all([
      mainId ? fetchLastPhoto(mainId) : Promise.resolve(null),
      secondaryId ? fetchLastPhoto(secondaryId) : Promise.resolve(null),
    ])
      .then(([main, secondary]) => setPhotos({ main, secondary }))
      .catch((e) => {
        console.error('Erro ao carregar fotos das câmeras:', e);
        setPhotos({ main: null, secondary: null });
      });
  }, [buildPhotoUrl, selectedVegetable]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconContainer}>
            <FaVideo className={styles.headerIcon} />
          </div>
          <div className={styles.headerContent}>
            <h4 className={styles.title}>
              CÂMERAS E ANOMALIAS
              {selectedVegetable && (
                <span className={styles.vegetableName}>
                  - {selectedVegetable.especie}
                  {selectedVegetable.variedade ? ` (${selectedVegetable.variedade})` : ''}
                </span>
              )}
            </h4>
            <div className={styles.subtitle}>
              <FaEye className={styles.subtitleIcon} />
              <span>
                {selectedVegetable ? 
                  `Monitorando ${selectedVegetable.especie}` :
                  'Monitoramento visual em tempo real'
                }
              </span>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.settingsButton}>
            <FaCog className={styles.settingsIcon} />
          </button>
        </div>
      </div>
      
      <div className={styles.cameras}>
        <div className={styles.cameraBox}>
          <div className={styles.cameraHeader}>
            <div className={styles.cameraInfo}>
              <FaCamera className={styles.cameraIcon} />
              <span className={styles.cameraName}>Câmera do cultivo</span>
            </div>
            <div className={styles.cameraStatus}>
              <div
                className={styles.statusDot}
                style={{
                  background: selectedVegetable?.dispositivos?.find(d => d.tipo === 'ESP32_CAM')?.online
                    ? '#27ae60'
                    : '#e74c3c',
                }}
              ></div>
              <span>
                {selectedVegetable?.dispositivos?.find(d => d.tipo === 'ESP32_CAM')?.online
                  ? 'Online'
                  : 'Offline'}
              </span>
            </div>
          </div>
          <div className={styles.imageContainer}>
            <img
              src={photos.main || '/background.jpg'}
              alt="cam1"
              className={styles.cameraImage}
            />
            <div className={styles.imageOverlay}>
              <button className={styles.playButton}>
                <FaPlay className={styles.playIcon} />
              </button>
            </div>
          </div>
          <div className={styles.cameraActions}>
            <button className={styles.actionButton}>
              <FaCamera className={styles.actionIcon} />
              <span>Snapshot</span>
            </button>
            <button className={styles.actionButton}>
              <FaDownload className={styles.actionIcon} />
              <span>Exportar</span>
            </button>
            <button className={styles.actionButton}>
              <FaExpand className={styles.actionIcon} />
              <span>Expandir</span>
            </button>
          </div>
        </div>
        
        <div className={styles.cameraBox}>
          <div className={styles.cameraHeader}>
            <div className={styles.cameraInfo}>
              <FaCamera className={styles.cameraIcon} />
              <span className={styles.cameraName}>Câmera auxiliar</span>
            </div>
            <div className={styles.cameraStatus}>
              <div
                className={styles.statusDot}
                style={{
                  background: selectedVegetable?.dispositivos?.filter(d => d.tipo === 'ESP32_CAM')?.[1]?.online
                    ? '#27ae60'
                    : '#e74c3c',
                }}
              ></div>
              <span>
                {selectedVegetable?.dispositivos?.filter(d => d.tipo === 'ESP32_CAM')?.[1]?.online
                  ? 'Online'
                  : 'Offline'}
              </span>
            </div>
          </div>
          <div className={styles.imageContainer}>
            <img
              src={photos.secondary || '/background.jpg'}
              alt="cam2"
              className={styles.cameraImage}
            />
            <div className={styles.imageOverlay}>
              <button className={styles.playButton}>
                <FaPlay className={styles.playIcon} />
              </button>
            </div>
          </div>
          <div className={styles.cameraActions}>
            <button className={styles.actionButton}>
              <FaCamera className={styles.actionIcon} />
              <span>Snapshot</span>
            </button>
            <button className={styles.actionButton}>
              <FaDownload className={styles.actionIcon} />
              <span>Exportar</span>
            </button>
            <button className={styles.actionButton}>
              <FaExpand className={styles.actionIcon} />
              <span>Expandir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
