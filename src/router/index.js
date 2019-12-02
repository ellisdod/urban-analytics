import Vue from 'vue'
import Router from 'vue-router'
import Indicators from './../components/IndicatorsNew.vue'
import IndicatorsReport from './../components/IndicatorsReport.vue'
import MapFull from './../components/MapFull.vue'
import Upload from './../components/Upload.vue'
import ManageData from './../components/ManageDataMaster.vue'
import Auth from '@okta/okta-vue'
import Help from './../components/Help.vue'

console.log('process.env',process.env.NODE_ENV,process.env.OKTA_CLIENT_ID,process.env.VUE_APP_OKTA_CLIENT_ID,process.env.VUE_APP_OKTA_URI_)

const origin = window.location.origin === 'http://localhost:8080' ? 'http://localhost:8081' :  window.location.origin
console.log('routing from',{redirect_uri: window.location.origin + '/implicit/callback'});
Vue.use(Auth, {
  client_id: process.env.VUE_APP_OKTA_CLIENT_ID,
  issuer: process.env.VUE_APP_OKTA_URI,
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
      component: MapFull
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
      path: '/reports/:areaId',
      component: IndicatorsReport
    },
    {
      path: '/reports',
      component: IndicatorsReport
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
