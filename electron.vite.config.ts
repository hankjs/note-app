import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import UnoCSS from 'unocss/vite'
import veaury from 'veaury/vite/index.js';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src'),
      }
    },
    plugins: [
      // react in vue
      veaury({
        type: 'vue',
      }),
      // vue(),
      UnoCSS()
    ],
      define: {
        'process.env.IS_PREACT': JSON.stringify('true'),
      },
  }
})
