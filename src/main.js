import Vue from 'vue';
// 将electron电子应用程序的APIs添加到Vue对象上，通过this.$electron获取所有的电子接口
import VueElectron from 'vue-electron';


import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.use(VueElectron);

console.log('TCL: router', router);
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
