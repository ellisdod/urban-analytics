import Vue from 'vue'
import axios from 'axios'

//const port = process.env.PORT || 8080;

const origin = window.location.origin === 'http://localhost:8080' ? 'http://localhost:8081' :  window.location.origin

const client = axios.create({
  baseURL: window.location.origin, //window.location.origin //http://localhost:8081/
  json: true
})

export default {
  async execute (method, resource, data, headers) {
    console.log('making request from:', origin)
    headers = headers || {};
    data = data || {};
    // inject the accessToken for each request
    let accessToken = await Vue.prototype.$auth.getAccessToken()
    return client({
      method,
      url: resource,
      data,
      headers: Object.assign({
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }, headers)
    })
  },
  getSurveyData (neighbourhood) {
    return this.execute('get', `/neighbourhood/${neighbourhood}`)
  },
  getSurveyNames () {
    return this.execute('get', `/survey/buildings`)
  },
  updateBuilding (id, building) {
    return this.execute('put', `/building/${id}`,building)
  },
  uploadData (data, type, headers) {
    return this.execute('post', `/create/${type}` ,data, headers);
  },
  getIndicators () {
    return this.execute('get', `/indicators`)
  },
  getAreas () {
    return this.execute('get', `/areas`)
  },
}
