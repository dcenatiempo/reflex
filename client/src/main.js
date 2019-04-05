// if (sessionStorage.getItem('currentUser')) {
//   if (2 === performance.navigation.type) {
//     sessionStorage.removeItem('currentUser');
//     sessionStorage.removeItem('currentRoom');
//   }
// }

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import { VueHammer } from 'vue2-hammer';

Vue.config.productionTip = false;

Vue.use(require('vue-moment'));

Vue.use(VueHammer);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');


