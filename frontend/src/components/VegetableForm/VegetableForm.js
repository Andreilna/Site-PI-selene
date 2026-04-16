import React, { useState } from "react";
import {
  FaLeaf,
  FaTags,
  FaSeedling,
  FaSave,
  FaUndo,
  FaSlidersH,
} from "react-icons/fa";
import { apiFetch } from "@/services/api";
import { useToast } from "@/components/ToastContainer/ToastContainer";
import styles from "@/components/VegetableForm/VegetableForm.module.css";

const VegetableForm = () => {
  const [form, setForm] = useState({
    especie: "Pleurotus ostreatus",
    variedade: "Shimeji",
    localizacao: "",
    status: "GERMINACAO",
    diasEstimados: "",
    notas: "",
  });
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const e = {};
    if (!form.especie.trim()) e.especie = "Informe a espécie.";
    if (!form.localizacao.trim()) e.localizacao = "Informe a localização do lote.";
    if (form.diasEstimados !== "" && (Number.isNaN(Number(form.diasEstimados)) || Number(form.diasEstimados) < 0)) {
      e.diasEstimados = "Informe um valor válido em dias.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleReset() {
    setForm({
      especie: "Pleurotus ostreatus",
      variedade: "Shimeji",
      localizacao: "",
      status: "GERMINACAO",
      diasEstimados: "",
      notas: "",
    });
    setErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const diasEstimados = form.diasEstimados === "" ? null : Number(form.diasEstimados);

    const dataColheitaEstimada =
      diasEstimados !== null && !Number.isNaN(diasEstimados)
        ? new Date(Date.now() + diasEstimados * 24 * 60 * 60 * 1000).toISOString()
        : null;

    const payload = {
      especie: form.especie.trim(),
      variedade: form.variedade.trim() || null,
      data_plantio: new Date().toISOString(),
      localizacao: form.localizacao.trim(),
      status: form.status,
      notas: form.notas.trim() || null,
      data_colheita_estimada: dataColheitaEstimada,
    };

    try {
      await apiFetch("/plantas", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      showToast("Lote cadastrado com sucesso no painel SELENE.", "success", 3000);
      handleReset();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Erro ao salvar parâmetros do cultivo", "error", 5000);
    }
  }

  return (
    <div className={styles.hortaPage}>
      <form onSubmit={handleSubmit} className={styles.hortaCard}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrap}><FaSeedling /></div>
          <div>
            <h1 className={styles.title}>Administração do Cultivo</h1>
            <p className={styles.subtitle}>Cadastre um novo lote e defina os parâmetros iniciais do monitoramento.</p>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label}>
              <FaLeaf /> Espécie monitorada <span className={styles.req}>*</span>
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
              <FaTags /> Localização do lote <span className={styles.req}>*</span>
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
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}><FaSlidersH /> Janela estimada (dias)</label>
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
            <label className={styles.label}><FaTags /> Observações técnicas</label>
            <textarea
              className={styles.input}
              placeholder="Ex.: lote prioritário para acompanhamento de contaminação visual."
              value={form.notas}
              onChange={(e) => setField("notas", e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={`${styles.btn} ${styles.primary}`}>
            <FaSave /> <span>Salvar</span>
          </button>
          <button type="button" onClick={handleReset} className={`${styles.btn} ${styles.secondary}`}>
            <FaUndo /> <span>Limpar</span>
          </button>
        </div>

        <p className={styles.foot}>
          Os campos com <code>*</code> são obrigatórios. Esta tela substitui o cadastro antigo e passa a registrar lotes e parâmetros iniciais da `SELENE`.
        </p>
      </form>
    </div>
  );
};

export default VegetableForm;
