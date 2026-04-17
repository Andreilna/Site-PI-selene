import '../styles/globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

export default function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evita erro de hidratação
  if (!mounted) {
    return <div style={{ visibility: 'hidden', height: '100vh' }} />;
  }

  return (
    <ThemeProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}