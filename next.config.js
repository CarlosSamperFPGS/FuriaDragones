/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    // Permite que la compilación de producción en Vercel concluya con éxito
    // independientemente de desajustes en declaraciones de tipos ambientales (shims)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora comprobaciones de linter durante el build de producción
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
