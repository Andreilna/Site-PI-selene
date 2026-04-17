import React, { useState } from 'react';
import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';

// Imports corrigidos conforme sua árvore de arquivos (Imagens 3, 4 e 5)
import Header from '../components/Header'; 
import Layout from '../components/Layout'; 

// Caso Button e UserForm ainda não existam como componentes isolados na 
// pasta 'components', você pode usar tags HTML básicas para o build passar.
// Substituirei por tags padrão aqui para garantir que o Vercel não trave.

export default function Users() {
  const { user, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  if (loading) {
    return (
      <div style={{ padding: '20px', color: 'white', background: '#121212', minHeight: '100vh' }}>
        Carregando...
      </div>
    );
  }

  // Proteção de rota
  if (!user) {
    return (
      <div style={{ padding: '20px', color: 'white', background: '#121212', minHeight: '100vh' }}>
        Acesso negado. Por favor, faça login.
      </div>
    );
  }

  const handleAddUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleSubmitUser = (userData) => {
    console.log('Dados do usuário:', userData);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <Layout>
      <Head>
        <title>Usuários - Selene</title>
      </Head>

      <div className="page-content">
        <div className="page-header">
          <div className="header-info">
            <h1>Gerenciar Usuários</h1>
            <p>Cadastre e gerencie os usuários do sistema</p>
          </div>
          
          <button className="btn-primary" onClick={handleAddUser}>
            + Novo Usuário
          </button>
        </div>

        {showForm ? (
          <div className="form-wrapper">
            {/* Formulário Simples para garantir o Build */}
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitUser({}); }}>
              <div className="input-group">
                <label>Nome do Usuário</label>
                <input type="text" placeholder="Digite o nome..." required />
              </div>
              <div className="actions">
                <button type="button" onClick={handleCancel} className="btn-cancel">Cancelar</button>
                <button type="submit" className="btn-save">Salvar</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="users-list">
            <div className="empty-card">
              <p>Lista de usuários será exibida aqui...</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-content {
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        h1 { margin: 0; font-size: 24px; color: #fff; }
        p { color: #888; margin-top: 5px; }

        .btn-primary {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .form-wrapper {
          max-width: 600px;
          background: #1e1e1e;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #333;
        }

        .input-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: #ccc; }
        input { 
          width: 100%; 
          padding: 12px; 
          background: #2a2a2a; 
          border: 1px solid #444; 
          border-radius: 6px; 
          color: white;
        }

        .actions { display: flex; gap: 10px; margin-top: 20px; }
        .btn-cancel { background: transparent; border: 1px solid #444; color: white; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
        .btn-save { background: #0070f3; border: none; color: white; padding: 10px 20px; border-radius: 6px; cursor: pointer; }

        .empty-card {
          background: #1e1e1e;
          padding: 80px;
          border-radius: 12px;
          text-align: center;
          border: 1px dashed #444;
          color: #666;
        }

        @media (max-width: 768px) {
          .page-header { flex-direction: column; align-items: flex-start; gap: 20px; }
        }
      `}</style>
    </Layout>
  );
}