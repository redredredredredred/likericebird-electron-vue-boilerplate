import Vue from 'vue';
// 将electron电子应用程序的APIs添加到Vue对象上，通过this.$electron获取所有的电子接口
import VueElectron from 'vue-electron';


import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

// vue-electron；这个插件好处在于链接了俩个框架的api接口，但是想要实现应用层代码分离解耦
Vue.use(VueElectron);

console.log('TCL: router', router);
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
