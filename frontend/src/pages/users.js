import React, { useState } from 'react';
import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';

// Imports baseados na sua estrutura real de pastas (Imagens 3 e 4)
import Header from '../components/Header'; 
import Layout from '../components/Layout'; 

export default function Users() {
  const { user, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);

  if (loading) {
    return (
      <div style={{ padding: '20px', color: 'white', background: '#121212', minHeight: '100vh' }}>
        Carregando...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', color: 'white', background: '#121212', minHeight: '100vh' }}>
        Acesso negado. Por favor, faça login.
      </div>
    );
  }

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
          
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Novo Usuário
          </button>
        </div>

        {showForm ? (
          <div className="form-wrapper">
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Novo Usuário</h2>
            <form onSubmit={(e) => { e.preventDefault(); setShowForm(false); }}>
              <input type="text" placeholder="Nome Completo" className="custom-input" required />
              <input type="email" placeholder="E-mail" className="custom-input" required />
              <div className="actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="users-list">
            <div className="empty-card">
              <p>A lista de usuários será carregada aqui...</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-content { padding: 20px; }
        .page-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 40px; 
        }
        h1 { margin: 0; font-size: 24px; color: #fff; }
        p { color: #888; margin-top: 5px; }
        .btn-primary { 
          background: #0070f3; 
          color: white; 
          border: none; 
          padding: 12px 24px; 
          border-radius: 8px; 
          cursor: pointer; 
          font-weight: bold; 
        }
        .form-wrapper { 
          max-width: 500px; 
          background: #1e1e1e; 
          padding: 30px; 
          border-radius: 12px; 
          border: 1px solid #333; 
        }
        .custom-input { 
          width: 100%; 
          padding: 12px; 
          margin-bottom: 15px; 
          background: #2a2a2a; 
          border: 1px solid #444; 
          border-radius: 6px; 
          color: white; 
        }
        .actions { display: flex; gap: 10px; margin-top: 10px; }
        .btn-cancel { 
          background: transparent; 
          border: 1px solid #444; 
          color: white; 
          padding: 10px 20px; 
          border-radius: 6px; 
          cursor: pointer; 
        }
        .btn-save { 
          background: #0070f3; 
          border: none; 
          color: white; 
          padding: 10px 20px; 
          border-radius: 6px; 
          cursor: pointer; 
        }
        .empty-card { 
          background: #1e1e1e; 
          padding: 80px; 
          border-radius: 12px; 
          text-align: center; 
          border: 1px dashed #444; 
          color: #666; 
        }
      `}</style>
    </Layout>
  );
}