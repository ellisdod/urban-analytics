import Vue from 'vue'
import Router from 'vue-router'
import Indicators from './../components/IndicatorsNew.vue'
import MapFull from './../components/MapFull.vue'
import Upload from './../components/Upload.vue'
import ManageData from './../components/ManageDataMaster.vue'
import Auth from '@okta/okta-vue'
import Help from './../components/Help.vue'

const origin = window.location.origin === 'http://localhost:8080' ? 'http://localhost:8081' :  window.location.origin
console.log('routing from',{redirect_uri: window.location.origin + '/implicit/callback'});
Vue.use(Auth, {
  client_id: '***REMOVED***',
  issuer: 'https://dev-160658.okta.com/oauth2/default',
  redirect_uri: window.location.origin + '/implicit/callback',
  scope: 'openid profile email groups',
  response_type: 'id_token'
})

Vue.use(Router)

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Indicators
    },
    {
      path: '/upload',
      component: Upload,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/manage',
      component: ManageData,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/map',
      component: MapFull
    },
    {
      path: '/indicators',
      component: Indicators
    },
    {
      path: '/implicit/callback',
      component: Auth.handleCallback()
    },
    {
      path: '/help',
      component: Help
    }
  ]
})

router.beforeEach(Vue.prototype.$auth.authRedirectGuard())

export default router
