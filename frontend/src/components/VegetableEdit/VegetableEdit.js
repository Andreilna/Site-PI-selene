import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  FaLeaf,
  FaClock,
  FaTags,
  FaSeedling,
  FaSave,
  FaUndo,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaSlidersH,
} from "react-icons/fa";
import { apiFetch } from "@/services/api";
import { useToast } from "@/components/ToastContainer/ToastContainer";
import styles from "@/components/VegetableEdit/VegetableEdit.module.css";

const VegetableEdit = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [form, setForm] = useState({
    especie: "",
    variedade: "",
    diasEstimados: "",
    localizacao: "",
    status: "GERMINACAO",
    notas: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const fetchCultivo = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch(`/plantas/${id}`);
      
      if (response?.data) {
        const planta = response.data;
        const diasEstimados =
          planta?.data_colheita_estimada
            ? Math.max(
                0,
                Math.ceil(
                  (new Date(planta.data_colheita_estimada).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
              )
            : "";

        setForm({
          especie: planta?.especie || "",
          variedade: planta?.variedade || "",
          diasEstimados: diasEstimados === "" ? "" : diasEstimados.toString(),
          localizacao: planta?.localizacao || "",
          status: planta?.status || "GERMINACAO",
          notas: planta?.notas || "",
        });
      }
    } catch (err) {
      console.error("Erro ao buscar cultivo:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCultivo();
  }, [fetchCultivo]);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const e = {};
    if (!form.especie.trim()) e.especie = "Informe a espécie.";
    if (!form.localizacao.trim()) e.localizacao = "Informe a localização.";
    if (form.diasEstimados !== "" && (Number.isNaN(Number(form.diasEstimados)) || Number(form.diasEstimados) < 0)) {
      e.diasEstimados = "Valor inválido.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleReset() {
    fetchCultivo();
    setErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    const diasEstimados = form.diasEstimados === "" ? null : Number(form.diasEstimados);

    const dataColheitaEstimada =
      diasEstimados !== null && !Number.isNaN(diasEstimados)
        ? new Date(Date.now() + diasEstimados * 24 * 60 * 60 * 1000).toISOString()
        : null;

    const payload = {
      especie: form.especie.trim(),
      variedade: form.variedade.trim() || null,
      data_plantio: null,
      localizacao: form.localizacao.trim(),
      status: form.status,
      notas: form.notas.trim() || null,
      data_colheita_estimada: dataColheitaEstimada,
    };

    try {
      await apiFetch(`/plantas/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      showToast("Configuração técnica atualizada com sucesso.", "success", 3000);
      setTimeout(() => {
        router.push("/dispositivos");
      }, 1000);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Erro ao atualizar cultivo", "error", 5000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Carregando configuração técnica...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <FaExclamationTriangle className={styles.errorIcon} />
        <p>Erro ao carregar cultivo: {error}</p>
        <button onClick={fetchCultivo} className={styles.retryButton}>
          Tentar novamente
        </button>
        <button onClick={() => router.push("/dispositivos")} className={styles.backButton}>
          <FaArrowLeft /> Voltar para dispositivos
        </button>
      </div>
    );
  }

  return (
    <div className={styles.editPage}>
      <div className={styles.header}>
        <button 
          onClick={() => router.push("/dispositivos")} 
          className={styles.backButton}
        >
          <FaArrowLeft /> Voltar
        </button>
        <div className={styles.headerContent}>
          <div className={styles.iconWrap}>
            <FaSeedling />
          </div>
          <div>
            <h1 className={styles.title}>Gestão Técnica do Cultivo</h1>
            <p className={styles.subtitle}>Atualize os parâmetros operacionais, localização e status do lote.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.editCard}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label}>
              <FaLeaf /> Espécie <span className={styles.req}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.especie ? styles.isError : ""}`}
              placeholder="Ex.: Pleurotus ostreatus"
              value={form.especie}
              onChange={(e) => setField("especie", e.target.value)}
            />
            {errors.especie && (
              <span className={`${styles.help} ${styles.error}`}>{errors.especie}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <FaTags /> Variedade
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ex.: Shimeji branco"
              value={form.variedade}
              onChange={(e) => setField("variedade", e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <FaTags /> Localização <span className={styles.req}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.localizacao ? styles.isError : ""}`}
              placeholder="Ex.: Sala 1 / Prateleira A"
              value={form.localizacao}
              onChange={(e) => setField("localizacao", e.target.value)}
            />
            {errors.localizacao && (
              <span className={`${styles.help} ${styles.error}`}>{errors.localizacao}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}><FaClock /> Janela estimada (dias)</label>
            <input
              type="number"
              min={0}
              className={`${styles.input} ${errors.diasEstimados ? styles.isError : ""}`}
              placeholder="Ex.: 35"
              value={form.diasEstimados}
              onChange={(e) => setField("diasEstimados", e.target.value)}
            />
            {errors.diasEstimados && (
              <span className={`${styles.help} ${styles.error}`}>{errors.diasEstimados}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}><FaSlidersH /> Status operacional</label>
            <select
              className={styles.input}
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
            >
              <option value="GERMINACAO">Germinação</option>
              <option value="CRESCENDO">Colonização</option>
              <option value="FLORECENDO">Frutificação</option>
              <option value="FRUTIFICANDO">Produção intensa</option>
              <option value="COLHIDA">Colheita concluída</option>
              <option value="MORTA">Descartado</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <FaTags /> Observações técnicas
            </label>
            <textarea
              className={styles.input}
              placeholder="Ex.: reforçar inspeção visual por câmera no período noturno."
              value={form.notas}
              onChange={(e) => setField("notas", e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <div className={styles.actions}>
          <button 
            type="submit" 
            className={`${styles.btn} ${styles.primary}`}
            disabled={saving}
          >
            {saving ? <FaSpinner className={styles.spinner} /> : <FaSave />} 
            <span>{saving ? "Salvando..." : "Salvar"}</span>
          </button>
          <button type="button" onClick={handleReset} className={`${styles.btn} ${styles.secondary}`}>
            <FaUndo /> <span>Restaurar</span>
          </button>
        </div>

        <p className={styles.foot}>
          Esta tela substitui a edição antiga e concentra a gestão operacional do lote monitorado pela `SELENE`.
        </p>
      </form>
    </div>
  );
};

export default VegetableEdit;
