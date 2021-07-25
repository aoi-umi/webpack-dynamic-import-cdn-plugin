import Vue from 'vue';
import App from './app.vue';
import router from './router';

export default new Vue({
	router,
	render: (h) => h(App),
}).$mount('#app');
