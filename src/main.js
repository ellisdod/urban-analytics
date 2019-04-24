// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuetify from 'vuetify'
import L from 'leaflet'
import 'vuetify/dist/vuetify.min.css'
import "vue-material-design-icons/styles.css"
import VeeValidate from 'vee-validate';

Vue.use(Vuetify)
Vue.use(VeeValidate);

Vue.config.productionTip = true

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
