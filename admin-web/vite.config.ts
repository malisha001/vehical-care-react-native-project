import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const apiBaseUrl = env.VITE_API_BASE_URL;
  const apiProxyTarget = apiBaseUrl ? new URL(apiBaseUrl).origin : undefined;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      ...(apiProxyTarget
        ? {
            proxy: {
              "/api": {
                target: apiProxyTarget,
                changeOrigin: true,
              },
            },
          }
        : {}),
    },
  };
});
