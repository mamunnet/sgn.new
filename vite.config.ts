import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
        jsxImportSource: 'react',
        babel: {
          plugins: ['@babel/plugin-transform-react-jsx']
        }
      })
    ],
    base: '/',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        'react': resolve(__dirname, './node_modules/react'),
        'react-dom': resolve(__dirname, './node_modules/react-dom')
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
          },
          assetFileNames: 'assets/[hash][extname]',
          chunkFileNames: 'assets/[hash].js',
          entryFileNames: 'assets/[hash].js'
        }
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    },
    esbuild: {
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment'
    },
    define: {
      'process.env': {},
      global: {},
      'process.env.FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY || ''),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN || ''),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID || ''),
      'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET || ''),
      'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''),
      'process.env.FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID || ''),
      'process.env.FIREBASE_MEASUREMENT_ID': JSON.stringify(env.VITE_FIREBASE_MEASUREMENT_ID || '')
    }
  };
});