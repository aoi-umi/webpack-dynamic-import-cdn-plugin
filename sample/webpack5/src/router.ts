import Vue from 'vue';
import Router, { RouteConfig } from 'vue-router';

Vue.use(Router);
export const routerConfig = {
    index: {
        path: '/',
        text: 'Home',
    },
    dynamicCdn: {
        path: '/dynamicCdn',
        text: 'dynamicCdn',
        component: () => import('./views/dynamic-cdn.vue')
    },
};

let routes: RouteConfig[] = Object.values(routerConfig);
const router = new Router({
    mode: 'history',
    // base: process.env.BASE_URL,
    routes,
});
export default router;
