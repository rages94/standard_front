import { createApp } from 'vue';
import BootstrapVue3 from 'bootstrap-vue-3';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';
import App from './App.vue';
import router from './router';
import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap'
import { createPinia } from 'pinia'
import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const pinia = createPinia()
const app = createApp(App);

app.use(Vue3Toastify, {
        autoClose: 3000,
        position: 'bottom-right',
    })
app.use(BootstrapVue3);
app.use(pinia)
app.use(router);
app.mount('#app');
