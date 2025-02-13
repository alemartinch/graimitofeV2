import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

const registerType = import.meta.env && 'VITE_REGISTER_TYPE' in import.meta.env
  ? import.meta.env.VITE_REGISTER_TYPE
  : 'autoUpdate';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      base: '/',
      filename: 'service-worker.js',
      registerType: registerType,
      strategies: 'generateSW',
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
        cleanupOutdatedCaches: true,
        sourcemap: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'tcmt-cache-pages',
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'tcmt-cache-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
      manifest: {
        name: "TCMT",
        short_name: "TCMT",
        start_url: ".",
        display: "standalone",
        theme_color: "#4DBA87",
        background_color: "#000000",
        icons: [
          {
            src: "./img/icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "./img/icons/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "./img/icons/android-chrome-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "./img/icons/android-chrome-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // This block is used by Vite to load our variables in every scss file (and SFC files)
        additionalData: [
          '@import "vuetify/dist/vuetify.min.css";',
          '@import "vuetify/src/styles/settings/_variables.scss";',
          '@import "@/styles/variables.scss";',
          '',
        ].join('\n'),
      },
      sass: {
        // This block is used by Vuetify ONLY, to load the overrides into its components (VBtn and so on)
        additionalData: [
          // '@import "vuetify/dist/vuetify.min.css"',
          '@import "vuetify/src/styles/settings/_variables.scss"',
          '@import "@/styles/variables.scss"',
          '',
        ].join('\n'),
      },
    },
  },
  build: {
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 8080,
  },
  define: {
    'process.env': process.env,
  },
});
