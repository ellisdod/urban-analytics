// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuetify from 'vuetify'
import L from 'leaflet'
import 'vuetify/dist/vuetify.min.css'
import "vue-material-design-icons/styles.css"
import VeeValidate from 'vee-validate'
import Vuex from 'vuex'
import api from './api.js'
import colors from 'vuetify/es5/util/colors'
import {theme} from './plugins/theme.js'
import {featureAnalysis} from './plugins/featureAnalysis.js'
var flatten = require('flatten-obj')()

Vue.use(Vuetify, {
  options: {
    customProperties: true
  },
  theme: theme
})
Vue.use(VeeValidate)
Vue.use(Vuex)

Vue.config.productionTip = true

function getNested (p, o) {
  p = typeof p === 'string' ? p.split('.') : p
  if (!p) return o
  const n =  p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)
  //console.log('nested',n)
  return n
}

const store = new Vuex.Store({
  state : {
    _col_layers : [],
    _col_layers_selected:'',
    _col_layerAttributes : [],
    _col_layerAttributes_selected : '',
    _col_areas : [],
    _col_areas_selected : '',
    _col_areaLayers : [],
    _col_areaLayers_selected:'',
    _col_features : {},
    _col_features_selected : '',
    _col_indicators : [],
    _col_indicators_selected : '',
    _col_indicatorSections : [],
    _col_indicatorSections_selected : '',
    _col_indicatorBlocks : [],
    _col_indicatorBlocks_selected : '',
    neighbourhoodsTest:null,
    updateCount:0,
    indicators: [],
    collections:{},
    cityIndicators: [],
    neighbourhood: 2112,
    selectedFeature :'',
    areaLayer : '5cf510e19bfa58b6c509903b',
    year:2016,
    language:'en',
    languages: ['ar','en'],
    theme : theme,
    tab:'',
    map : {
      zoom:14,
      center: {lat: 31.827982118391024,lng: 35.22958321000619},
      defaultCenter: {lat: 31.827982118391024,lng: 35.22958321000619}
    },
    navigator : {
      zoom:11,
      center: { lat: 31.77487761850741, lng: 35.20328852089031 },
      defaultCenter: {lat: 31.77487761850741, lng: 35.20328852089031},
      indicator: {
        figure : 'pop_year_end',
        name : 'Population'
      }
    },
    geo : {
      areas : [],
      facilities : [],
      educational: [],
      features: [],
      selected: null,
    },
    layers : []
  },
  actions : {
    UPDATE_COLLECTION ({state, commit}, col) {
      //console.log('1. update collection',col)
      const params = {
        name : col.name || col,
        query : col.query || {},
        layer : col.layer,
      }

      if (params.name === 'features') {
        params.layer = params.layer || state._col_layers_selected
        if (!params.layer) rej('no feature layer defined')
        const filtered = state._col_layers.filter(x=>x._id === params.layer)[0].filtered
        if (filtered) {
          const areaLayerCode = state._col_areaLayers.filter(x=>x._id === state._col_areaLayers_selected )[0].code
          params.query['feature.properties.'+areaLayerCode ] = state.neighbourhood
          params.nestedKey = state.neighbourhood
        }
      }

      function update(data){
        if (params.name === 'features') {
          commit('UPDATE_FEATURES',{
            key: params.layer,
            value: data,
            nestedKey:params.nestedKey
          })
        } else {
          const key = '_col_' + params.name
          const selKey = key + '_selected'
          //console.log('before commiting update',key,i.data.map(x=>x._id),i.data  )
          commit('UPDATE',{
            key: key,
            value: data
          })
          if (!state[selKey]) {
            commit('UPDATE',{
              key: selKey,
              value: data[0]._id
            })
          }
      }
    }

      return new Promise((res,rej)=>{

          if (col.data) {
            console.log('supplied data', col.data)
            update(col.data)
            return res(col.data)
          }
          console.log('making api request',params.name,params.query,params.layer )
          api.find(params.name,params.query,'',{lean: true},params.layer).then(i=>{
            //console.log('data found: ',params.name,i.data.map(x=>x._id),i.data )
            update(i.data)
            //console.log('2. updated collection: _col_' + params.name,i.data.length, i.data[0])
            res(i.data)
          }).catch(error => {
            console.log('caught error',error)
            rej(error)
          })

      });
    },
    UPDATE_INDICATORS ({state,commit}) {
      api.find('indicators',{areaLayer:state.areaLayer})
      .then(i=> commit('UPDATE',{
        key:'indicators',
        value : i.data
      }))
      .catch(error => {
        console.log('failed to update indicators',error)
      })
    }
  },
  mutations : {
    GET_INDICATORS (state) {
      api.find('areas',{}).then(x=> {
        state.geo.areas = x.data;
      });

      api.find('indicators',{}).then(x=> {
        if(!x.data) {
          console.log('cannot retrieve in')
          return null;
        }
        const indicators = x.data.map(i=>{
          i.dependency_youth  = ((i.age_0_4 + i.age_5_14 + i.age_15_24) / i.pop_year_end *100).toFixed(1)
          i.growth_total  = (i.pop_growth_total / i.pop_year_end *100).toFixed(1)
          i.growth_natural  = (i.pop_growth_natural / i.pop_year_end *100).toFixed(1)
          i.household_size = (i.pop_year_end / i.dwellings_total).toFixed(1)
          i.dwelling_density = (i.dwelling_area_avg / i.household_size).toFixed(1)
          i.prevyear = x.data.filter(y=>y.name === i.name && y.year === (i.year - 1))[0]
          i.dwellings_new = i.prevyear ? i.dwellings_total - i.prevyear.dwellings_total : null
          i.dwelling_growth = (i.dwellings_new/i.dwellings_total*100).toFixed(1)
          i.age_distribution_labels = ['age_0_4',	'age_5_14',	'age_15_24',	'age_25_44',	'age_45_64',	'age_65_74',	'age_75_']
          i.age_distribution = i.age_distribution_labels.map(y => (i[y] / i.pop_year_end *100))
          i.dwelling_area_distribution_labels = ['dwellings_area_0_40',	'dwellings_area_41_60',	'dwellings_area_61_80',	'dwellings_area_81_100',	'dwellings_area_101_140',	'dwellings_area_141']
          i.dwelling_area_distribution = i.age_distribution_labels.map(y => (i[y] / i.dwellings_total *100) )
          return i
        })
        state.indicators = indicators.filter(x=> x.area_code !== 9999);
        state.cityIndicators = indicators.filter(x=> x.area_code === 9999);
        //console.log(state.indicators);
        //console.log('cityIndicators',state.cityIndicators);
        const fa = featureAnalysis();
        api.find('features',{}).then(x=>{
          state.geo.facilities = x.data
          state.facilities = x.data.map(x => x.feature.properties )
          console.log('facilities',state.facilities)
          let edu = x.data.filter(x=>x.feature.properties.Use === 'Educational')
          state.geo.educational = edu;

          edu = fa.sum(edu,['Sort1','Sort2','Gender','no_student','no_females','no_classes','Type'])

          state.indicators.forEach( (x,y) => {
            if (x.year===2015 && x.area_code) {
              state.indicators[y] = Object.assign({},x,edu[x.area_code.toString()])
              //console.log('edu',edu[x.area_code.toString()])
            }
          })
          state.cityIndicators.forEach( (x,y) => {
            if (x.year===2015) {
              state.cityIndicators[y] = Object.assign({},x,edu['total'])
              //console.log('eduCity',Object.assign({},x,edu['total']))
            }
          })
          console.log('cityindicators',state.cityIndicators)
          //console.log('ind',state.indicators.filter(x=>x.year===2016))

        })
      });
    },
    /*api.distinct('layers','feature.properties.neighbourhood').then(i=>{
    console.log(i.data)
    state.neighbourhoodsTest = i.data
  })*/

  UPDATE_FEATURES (state, obj) {
      console.log('updating feature', obj.nestedKey, obj.key,obj.value)
      if (obj.nestedKey) {
        state._col_features[obj.key] = state._col_features[obj.key] || {}
        Vue.set( state._col_features[obj.key], obj.nestedKey, obj.value )
      } else {
        Vue.set( state._col_features, obj.key, obj.value )
      }
  },
  UPDATE_FEATURE_PROPERTIES (state,obj) {
     //const feature = Object.assign({},state._col_features[obj.layer][obj.feature.feature.properties._index])
     //feature.feature.properties = obj.feature
     state._col_features[obj.layer].splice(obj.feature._index,1,obj.feature)
     const coords = obj.feature.feature.geometry.coordinates[0][0][0]
     console.log('coords',coords)
     state.map.center = {lat:coords[1],lng:coords[0]}
  },
  UPDATE (state, obj) {
    //console.log(obj.value)
    if (Array.isArray(obj.key)) {
      console.log('updating store nested: ' + JSON.stringify(obj.key), obj.value)
      const nested =  obj.key.slice(0,obj.key.length-1).reduce((acc,x) =>
      (acc && acc[x] !== 'undefined') ? acc[x] : undefined
      , state)
      //nested[obj.key.slice(-1)[0]] = obj.value
      const obj2 = {}
      obj2[obj.key.slice(-1)[0]] = obj.value
      Object.assign(nested, obj2);
    } else {
      //console.log('is array', Array.isArray(obj.value), obj.value )
      const ids = (obj.value[0] && obj.value[0]._id) ? obj.value.map(x=>x._id) : ''
      console.log('updating store value: ' + obj.key, obj.value, ids)
      state[obj.key] = obj.value
    }

  },
  UPDATE_AREA (state, code) {
    const e = state.geo.areas.filter(x=>x.feature.properties.id === code)[0]
    console.log(e);
    state.neighbourhood = code
    state.map.center = {
      lon:e.feature.properties.Centroids_x,
      lat:e.feature.properties.Centroids_y
    }
  }
},
getters : {
  areaSelect: (state, getters) => {
    if (!state.indicators) return []
    //console.log('areaSelect',getters.dataByYear.concat(getters.dataByCityYear))
    return  getters.dataByYear.concat(getters.dataByCityYear)
  },
  neighbourhoods : (state, getters) => {
    if (!state.indicators) return []
    return state.indicators.reduce((acc,x)=>{
      acc= acc || []
      if (acc.indexOf(x.name) === -1 ) acc.push(x.name)
      return acc;
    },[])
  },
  years : state => {
    if (!state.indicators) return []
    return state.indicators.reduce((acc,x)=>{
      acc= acc ||[]
      if (acc.indexOf(x.year) === -1 && x.year ) acc.push(x.year)
      return acc;
    },[])
  },
  dataByYear : state => {
    if (!state.indicators) return []
    return state.indicators.filter(x=>x.year === state.year)
  },
  dataByNeighbourhood : state => {
    if (!state.indicators) return []
    const data = state.indicators.filter(x=>x.area_code === state.neighbourhood)
    return data.length > 0 ? data : state.cityIndicators

  },
  dataByHoodYear : (state, getters) => {
    return state._col_indicators.filter(x=>x.areaCode === state.neighbourhood && x.year === state.year)[0] || {}
  },
  dataByCityYear : state => {
    return state.cityIndicators.filter(x=>x.year===state.year)[0] || {}
  },
  educationalByHood : state => {
    console.log('edubyhood - init',state.geo.educational);
    const edu = state.geo.educational.reduce((acc,x)=>{
      if(x.feature.properties.mygeodat_5 === state.neighbourhood) {
        acc.push(x.feature.properties)
      }
      return acc;
    },[])
    console.log('edubyhood',edu);
    return edu
  },
  educationalGeoByHood : state => {
    if (!state.geo.educational) return []
    const d = state.geo.educational.filter(x=>x.feature.properties.mygeodat_5 === state.neighbourhood)
    console.log('educational geo', d)
    return d;
  },
  selectedFeature : state => {
    return state._col_features.filter(x=>x.feature.properties._id === state.selectedFeature)[0]
  },
  selectedAreas : state => {
    //console.log('areas',state._col_areas.filter(x=> x.layer === state._col_areaLayers_selected ))
    return state._col_areas.filter(x=> x.layer === state._col_areaLayers_selected && x.feature.properties.id)
  },
  selectedArea : (state, getters) => {
    return getters.selectedAreas.filter(x=> x.feature.properties.id === state.neighbourhood)[0]
  },
  geojson : state => {
    if (!state._col_features) return []
    return state._col_features.map(x=>x.feature)
  },
  selectedLayer : state => {
    if (!state._col_layers) return null;
    return state._col_layers.filter(x=>x._id===state._col_layers_selected)[0]
  },
  selectedLayerAttributes : state => {
    if (!state._col_layerAttributes) return null;
    return state._col_layerAttributes.filter(x=>x.layer===state._col_layers_selected)
  },
  selectedIndicatorBlocks : state => {
    if (!state._col_indicatorBlocks) return null;
    return state._col_indicatorBlocks.filter(x=>x.active&&x.layer===state._col_indicatorSections_selected)
  },
  selectedIndicatorSection : state => {
    if (!state._col_indicatorSections_selected) return null;
    return state._col_indicatorSections.filter(x=>x._id===state._col_indicatorSections_selected)[0]
  },
  allIndicatorsByYear : state => {
    if (!state._col_indicators) return null;
    return state._col_indicators.reduce((acc,x)=>{
      if (!x.year) return acc
      acc[x.year] = acc[x.year] || []
      acc[x.year].push(flatten(x))
      return acc
    },{})
  },
  allIndicatorsByArea : state => {
    if (!state._col_indicators) return null;
    return state._col_indicators.reduce((acc,x)=>{
      if (!x.areaCode) return acc
      acc[x.areaCode] = acc[x.areaCode] || []
      acc[x.areaCode].push(flatten(x))
      return acc
    },{})
  },
  allIndicatorsByAreaYear : state => {
    if (!state._col_indicators) return null;
    return state._col_indicators.reduce((acc,x)=>{
      if (!x.areaCode) return acc
      acc[x.areaCode] = acc[x.areaCode] || {}
      acc[x.areaCode][x.year] = x
      return acc
    },{})
  },
  indicatorsForSelectedYear : (state,getters) => {
    if (getters.allIndicatorsByYear) return getters.allIndicatorsByYear[state.year]
  },
  indicatorsForSelectedArea : (state,getters) => {
    if (getters.allIndicatorsByArea&& getters.allIndicatorsByArea[state.neighbourhood]) return getters.allIndicatorsByArea[state.neighbourhood].sort((a,b)=> a.year - b.year)
  },
  selectedIndicator : (state,getters) => {
    return getNested( [state.neighbourhood,state.year] , getters.allIndicatorsByAreaYear)
  }
}
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
