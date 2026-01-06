/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverNode: true,   // força Node.js runtime para rotas
  },
  serverExternalPackages: ["pdfkit"], // permite PDFKit no build
};

module.exports = nextConfig;
