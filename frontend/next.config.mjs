/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  // Removido o serverComponents: false que estava causando erro
  experimental: {}, 
  
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  async rewrites() {
    // Na Vercel, certifique-se de configurar a variável BACKEND_URL nas Environment Variables
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;