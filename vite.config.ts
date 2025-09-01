import { defineConfig, loadEnv } from "vite";
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    base: "./",
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.DEEPSEEK_API_KEY": JSON.stringify(env.DEEPSEEK_API_KEY),
      // 为 Vite 环境添加前缀版本
      "import.meta.env.VITE_DEEPSEEK_API_KEY": JSON.stringify(
        env.DEEPSEEK_API_KEY
      ),
      "import.meta.env.VITE_GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            electron: ["electron"],
          },
        },
      },
    },
    server: {
      port: 5173,
    },
  };
});
