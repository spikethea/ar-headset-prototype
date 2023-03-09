// vite.config.js
import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
    server: {
        https: true,
    },
    plugins: [
        basicSsl()
    ],
    optimizeDeps: { exclude: ["@zappar/zappar-threejs"], include: ["ua-parser-js"] },
}