import Vue from 'vue'
import Router from 'vue-router'
import Hello from './../components/Hello.vue'
import MapView from './../components/MapView.vue'
import Upload from './../components/Upload.vue'
import PostsManager from './../components/PostsManager.vue'
import Auth from '@okta/okta-vue'

console.log(window.location.origin);

Vue.use(Auth, {
  clientId: '***REMOVED***',
  issuer: 'https://dev-160658.okta.com/oauth2/default',
  redirect_uri: window.location.origin + '/implicit/callback',
  scope: 'openid profile email'
})

Vue.use(Router)

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: MapView
    },
    {
      path: '/upload',
      component: Upload
    },
    {
      path: '/map',
      component: MapView
    },
    {
      path: '/implicit/callback',
      component: Auth.handleCallback()
    },
    {
      path: '/posts-manager',
      name: 'PostsManager',
      component: PostsManager,
      meta: {
        requiresAuth: true
      }
    }
  ]
})

router.beforeEach(Vue.prototype.$auth.authRedirectGuard())

export default router
