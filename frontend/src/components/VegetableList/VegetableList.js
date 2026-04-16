import React, { useCallback, useState } from "react";
import { useRouter } from "next/router";
import {
  FaLeaf,
  FaClock,
  FaTags,
  FaCamera,
  FaSeedling,
  FaTrash,
  FaEdit,
  FaMicrochip,
} from "react-icons/fa";
import { apiFetch } from "@/services/api";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import { useToast } from "@/components/ToastContainer/ToastContainer";
import useAsyncRequest from "@/hooks/useAsyncRequest";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import styles from "@/components/VegetableList/VegetableList.module.css";

const VegetableList = () => {
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { showToast } = useToast();

  const fetchCultivos = useCallback(async () => {
    const response = await apiFetch("/plantas");
    const plantas = response?.data || [];

    return plantas.map((planta) => {
      const dispositivos = planta?.dispositivos || [];
      const sensores = dispositivos.filter((item) => item.tipo === "ESP32_SENSORES");
      const cameras = dispositivos.filter((item) => item.tipo === "ESP32_CAM");
      const plantio = planta?.data_plantio ? new Date(planta.data_plantio) : null;
      const colheita = planta?.data_colheita_estimada
        ? new Date(planta.data_colheita_estimada)
        : null;

      const tempoEstimadoDias =
        plantio &&
        colheita &&
        !Number.isNaN(plantio.getTime()) &&
        !Number.isNaN(colheita.getTime())
          ? Math.max(
              0,
              Math.floor(
                (colheita.getTime() - plantio.getTime()) / (1000 * 60 * 60 * 24)
              )
            )
          : null;

      return {
        _id: planta._id,
        nome: planta.especie,
        variedade: planta.variedade,
        status: planta.status,
        tempoEstimado: tempoEstimadoDias,
        localizacao: planta.localizacao || "Sem localização",
        sensores: sensores.length,
        cameras: cameras.length,
        dispositivosOnline: dispositivos.filter((item) => item.online).length,
        dispositivosTotal: dispositivos.length,
        createdAt: planta.criado_em || planta.createdAt || null,
      };
    });
  }, []);

  const {
    data: cultivos = [],
    loading,
    error,
    retry: retryCultivos,
  } = useAsyncRequest(fetchCultivos, [fetchCultivos]);

  const handleEdit = (id) => {
    router.push(`/admin?id=${id}`);
  };

  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await apiFetch(`/plantas/${deleteConfirm}`, {
        method: "PUT",
        body: JSON.stringify({ ativo: false }),
      });
      showToast("Cultivo arquivado com sucesso.", "success", 3000);
      setDeleteConfirm(null);
      await retryCultivos();
    } catch (err) {
      console.error("Erro ao arquivar cultivo:", err);
      showToast(err.message || "Erro ao arquivar cultivo", "error", 5000);
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingState message="Carregando cultivos e dispositivos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorState
          message={`Erro ao carregar cultivos: ${error?.message || "erro inesperado"}`}
          onRetry={retryCultivos}
        />
      </div>
    );
  }

  if (cultivos.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <EmptyState message="Nenhum cultivo cadastrado. Cadastre o primeiro lote para habilitar a visão administrativa." />
      </div>
    );
  }

  return (
    <div className={styles.vegetableListPage}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <FaMicrochip />
        </div>
        <div>
          <h1 className={styles.title}>Dispositivos e Cultivos</h1>
          <p className={styles.subtitle}>
            {cultivos.length} lote{cultivos.length !== 1 ? "s" : ""} monitorado{cultivos.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className={styles.vegetablesGrid}>
        {cultivos.map((cultivo) => (
          <div key={cultivo._id} className={styles.vegetableCard}>
            <div className={styles.cardHeader}>
              <div className={styles.vegetableInfo}>
                <h3 className={styles.vegetableName}>
                  <FaLeaf /> {cultivo.nome}
                  {cultivo.variedade ? ` (${cultivo.variedade})` : ""}
                </h3>
                <span className={styles.vegetableType}>
                  <FaTags /> {cultivo.status || "Sem status"}
                </span>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.actionButton}
                  title="Abrir gestão técnica"
                  onClick={() => handleEdit(cultivo._id)}
                >
                  <FaEdit />
                </button>
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  title="Arquivar cultivo"
                  onClick={() => handleDelete(cultivo._id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>
                    <FaClock /> Ciclo previsto
                  </label>
                  <span className={styles.infoValue}>
                    {cultivo.tempoEstimado ? `${cultivo.tempoEstimado} dias` : "N/A"}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>
                    <FaTags /> Localização
                  </label>
                  <span className={styles.infoValue}>
                    {cultivo.localizacao}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>
                    <FaMicrochip /> Sensores
                  </label>
                  <span className={styles.infoValue}>
                    {cultivo.sensores}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>
                    <FaCamera /> Câmeras
                  </label>
                  <span className={styles.infoValue}>
                    {cultivo.cameras}
                  </span>
                </div>
              </div>

              <div className={styles.fertilizantesSection}>
                <label className={styles.infoLabel}>
                  <FaMicrochip /> Disponibilidade operacional
                </label>
                <span className={styles.noData}>
                  {cultivo.dispositivosOnline}/{cultivo.dispositivosTotal} dispositivo{cultivo.dispositivosTotal !== 1 ? "s" : ""} online
                </span>
              </div>

              <div className={styles.dateInfo}>
                <small>
                  Cadastrado em: {formatDate(cultivo.createdAt)}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <ConfirmModal
          message="Deseja arquivar este cultivo na administração SELENE?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          confirmText="Arquivar"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
};

export default VegetableList;
