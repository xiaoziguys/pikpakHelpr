import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.js',
      userscript: {
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=mypikpak.com',
        namespace: 'http://tampermonkey.net/',
        match: ['https://mypikpak.com/*'],
        author: 'xiaoziguys',
        grant: ['unsafeWindow', 'GM_xmlhttpRequest'],
        license: 'MIT',
        runAt: 'document-start',
        name: 'pikpak助手',
        description: 'pikpak网盘助手，绕过ip限制，支持aria2下载!'
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
});
