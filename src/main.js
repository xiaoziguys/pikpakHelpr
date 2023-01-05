import { createApp } from 'vue';
import App from './App.vue';

document.cookie = "pp_access_to_visit=true"

setTimeout(() => {
  createApp(App).mount(
    (() => {
      let pikpakContainer = document.getElementById('app')
      const app = document.createElement('div');
      document.body.insertBefore(app, pikpakContainer)
      return app;
    })(),
  );
}, 1000)
