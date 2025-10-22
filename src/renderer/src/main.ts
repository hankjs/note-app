import './components/playground/assets/style.css'
import 'uno.css'

import './utils/prism'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Handle runtime errors
const showErrorOverlay = (err: Event) => {
  const ErrorOverlay = customElements.get('vite-error-overlay');
  if (!ErrorOverlay) {
    return;
  }
  const overlay = new ErrorOverlay(err || 'Unknown error');
  const body = document.body;
  if (body !== null) {
    body.appendChild(overlay);
  }
};

window.addEventListener('error', showErrorOverlay);
window.addEventListener('unhandledrejection', ({reason}) =>
  showErrorOverlay(reason),
);

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
console.log('app mounted')
