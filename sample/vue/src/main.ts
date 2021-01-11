import Vue from 'vue';
import iView from 'iview';
import 'iview/dist/styles/iview.css';

Vue.use(iView);
// import Element from 'element-ui';

// Vue.use(Element);
import App from './App';
import router from './router';

Vue.config.productionTip = false;
new Vue({
    router,
    render: (h) => h(App),
}).$mount('#app');
