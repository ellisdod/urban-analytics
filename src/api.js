import Vue from 'vue'
import axios from 'axios'

//const port = process.env.PORT || 8080;

const client = axios.create({
  baseURL: 'window.location.origin', //window.location.origin //http://localhost:8081/
  json: true
})

export default {
  async execute (method, resource, data, headers) {
    headers = headers || {};
    // inject the accessToken for each request
    let accessToken = await Vue.prototype.$auth.getAccessToken()
    return client({
      method,
      url: resource,
      data,
      headers: Object.assign({
        Authorization: `Bearer ${accessToken}`
      }, headers)
    })
  },
  getSurveyData (neighbourhood) {
    return this.execute('get', `/neighbourhood/${neighbourhood}`)
  },
  getSurveyNames () {
    return this.execute('get', `/survey/buildings`)
  },
  getPost (id) {
    return this.execute('get', `/posts/${id}`)
  },
  create (data, headers) {
    return this.execute('post', '/create', data, headers)
  },
  updatePost (id, data) {
    return this.execute('put', `/posts/${id}`, data)
  },
  deletePost (id) {
    return this.execute('delete', `/posts/${id}`)
  }
}
