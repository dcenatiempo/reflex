import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import fb from './firebaseConfig';
import { VueHammer } from 'vue2-hammer';

Vue.config.productionTip = false;

Vue.use(require('vue-moment'));

Vue.use(VueHammer);

Vue.prototype.$fb = fb;

let app
fb.auth.onAuthStateChanged( () => {
    if (!app) {
      app = new Vue({
        router,
        store,
        render: h => h(App)
      }).$mount('#app');
    }
});
