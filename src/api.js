import Vue from 'vue'
import axios from 'axios'
const functions = require('./api.functions')
require('axios-debug-log')

//const port = process.env.PORT || 8080;

const origin = window.location.origin === 'http://localhost:8080' ? 'http://localhost:8081' :  window.location.origin

const client = axios.create({
  baseURL: origin, //window.location.origin //http://localhost:8081/
  json: true
})

const execute = async function (method, resource, data, headers) {
  //console.log('making request from:', origin)
  headers = headers || {};
  data = data || {};
  console.log('execute function')
  // inject the accessToken for each request
  let accessToken = await Vue.prototype.$auth.getAccessToken()
  return client({
    method,
    url: resource,
    data,
    headers: Object.assign({
      Authorization: `Bearer ${accessToken}`,
      //'Content-Type': 'application/json'
    }, headers)
  })
}

function parseParams(params) {
  params = typeof params === 'object' && params ? JSON.stringify(params) : params
  params = params ? '/' + params : ''
  return params
}

export default functions.reduce((obj,func) => {
  obj[func.name] = function(collection, params, data, headers, collectionParams) {
    //console.log('params',params, typeof params)
    params = parseParams(params)
    collectionParams = parseParams(collectionParams)
    //console.log('params',params, typeof params)
    console.log(func.method, `${collection}${collectionParams}/${func.name}${params}`,data, headers)
    return execute(func.method, `${collection}${collectionParams}/${func.name}${params}`,data, headers)
  }
  return obj
},{})

/*
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
getAreaIndicators () {
return this.execute('get', `/indicators`)
},
getAreas () {
return this.execute('get', `/areas`)
},
getFacilities () {
return this.execute('get', `/facilities`)
},

del (collection,id) {
  return execute('post', `/${collection}/delete/${id}`)
},
update (collection,id,data) {
  return execute('post', `/${collection}/update/${id}`,data)
},
getAll (collection) {
  return execute('get', `/${collection}`)
},
find (collection, query) {
  query = JSON.stringify(query)
  return execute('get', `/features/find/${query}`)
},
*/




//console.log('api', module.exports)
