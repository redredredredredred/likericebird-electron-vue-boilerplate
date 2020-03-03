import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default new Router({
  // 在单页面应用中，必须配合服务器或者nginx进行路由设置，所以在elecctron中此处配置为hash模式
  // mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/file-transfer',
      name: 'file-transfer',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "file-transfer" */ '@/views/FileTransfer.vue'),
    },
    {
      path: '/badge',
      name: 'badge',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "badge" */ '@/views/Badge.vue'),
    },
    {
      path: '/auto-upgrade',
      name: 'auto-upgrade',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "auto-upgrade" */ '@/views/AutoUpgrade.vue'),
    },
    {
      path: '/account-preferences.vue',
      name: 'account-preferences',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "account-preferences" */ '@/views/AccountPreferences.vue'),
    },
  ],
});
