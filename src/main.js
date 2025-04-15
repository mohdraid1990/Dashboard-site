import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { createI18n } from 'vue-i18n';
import messages from './locales';
import 'animate.css';
import './assets/styles/main.scss';
import '@fortawesome/fontawesome-free/css/all.css';

const i18n = createI18n({
  legacy: false, // استخدام Composition API
  locale: localStorage.getItem('language') || 'ar',
  fallbackLocale: 'en',
  messages,
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.mount('#app');