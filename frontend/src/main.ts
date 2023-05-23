import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './main.css';
import axios from 'axios';

const pinia = createPinia()
const app = createApp(App)

axios.defaults.withCredentials = true;
app.use(router)
app.use(pinia)
app.mount('#app');
