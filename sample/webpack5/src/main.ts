import Vue from 'vue';
import 'view-design/dist/styles/iview.css'
import router from './router';
import App from './app.vue';

export default new Vue({
	router,
	render: (h) => h(App),
}).$mount('#app');
