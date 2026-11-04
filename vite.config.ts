import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// Clean process.env keys: sanitize any keys with whitespace (e.g. from accidental UI space typos)
for (const key of Object.keys(process.env)) {
  if (/\s/.test(key)) {
    const cleanKey = key.replace(/\s+/g, '_');
    if (!process.env[cleanKey]) {
      process.env[cleanKey] = process.env[key];
    }
    delete process.env[key];
  }
}

function sanitizeEnvPlugin(): Plugin {
  return {
    name: 'sanitize-env-defines',
    config(config) {
      if (config.define) {
        for (const key of Object.keys(config.define)) {
          if (/\s/.test(key)) {
            delete config.define[key];
          }
        }
      }
    },
    configResolved(resolvedConfig) {
      // Clean resolvedConfig.env so Vite does not create invalid define keys
      if (resolvedConfig.env) {
        for (const key of Object.keys(resolvedConfig.env)) {
          if (/\s/.test(key)) {
            const cleanKey = key.replace(/\s+/g, '_');
            if (!resolvedConfig.env[cleanKey]) {
              resolvedConfig.env[cleanKey] = resolvedConfig.env[key];
            }
            delete resolvedConfig.env[key];
          }
        }
      }
      if (resolvedConfig.define) {
        for (const key of Object.keys(resolvedConfig.define)) {
          if (/\s/.test(key)) {
            delete resolvedConfig.define[key];
          }
        }
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [sanitizeEnvPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
