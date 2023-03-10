// vite.config.js
import basicSsl from '@vitejs/plugin-basic-ssl';
import { qrcode } from 'vite-plugin-qrcode';

export default {
    server: {
        https: true,
    },
    plugins: [
        basicSsl(),
        qrcode()
    ],
    optimizeDeps: { exclude: ["@zappar/zappar-threejs"], include: ["ua-parser-js"] },
}