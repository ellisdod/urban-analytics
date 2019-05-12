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

Vue.use(Vuetify, {
  options: {
    customProperties: true
  },
  theme: theme
})
Vue.use(VeeValidate)
Vue.use(Vuex)

Vue.config.productionTip = true

const store = new Vuex.Store({
  state : {
    indicators: null,
    cityIndicators: null,
    neighbourhood:2511,
    year:2016,
    language:'en',
    languages: ['ar','en'],
    theme : theme,
    map : {
      zoom:14,
      center: L.latLng(31.778837,35.243452),
      defaultCenter: L.latLng(31.778837,35.243452),
    },
    navigator : {
      zoom:11,
      center: {lat: 31.809357074964257, lng: 35.18584083885216},
      defaultCenter: {lat: 31.809357074964257, lng: 35.18584083885216},
      indicator: {
        figure : 'pop_year_end',
        name : 'Population'
      }
    },
    geo : {
      areas : []
    }
  },
  mutations : {
    GET_INDICATORS (state) {
      api.getAreas().then(x=>{
        state.geo.areas = x.data;
      })
      api.getIndicators().then(x=> {
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
        console.log(state.indicators);
        console.log('cityIndicators',state.cityIndicators);
      });
    },
    UPDATE (state, obj) {
      //console.log(obj.value)
      if (Array.isArray(obj.key)) {
        const nested =  obj.key.slice(0,obj.key.length-1).reduce((acc,x) =>
        (acc && acc[x] !== 'undefined') ? acc[x] : undefined
      , state)
       nested[obj.key.slice(obj.key.length-1,obj.key.length)] = obj.value
     } else {
       state[obj.key] = obj.value
     }

    },
    UPDATE_AREA (state, code) {
      const e = state.geo.areas.filter(x=>x.feature.properties.id ==code)[0]
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
      if (!state.indicators) return null
      //console.log('areaSelect',getters.dataByYear.concat(getters.dataByCityYear))
      return  getters.dataByYear.concat(getters.dataByCityYear)
    },
    neighbourhoods : (state, getters) => {
      if (!state.indicators) return null
      return state.indicators.reduce((acc,x)=>{
        if (acc.indexOf(x.name) === -1 ) acc.push(x.name)
        return acc;
      },[])
    },
    years : state => {
      if (!state.indicators) return null
      return state.indicators.reduce((acc,x)=>{
        if (acc.indexOf(x.year) === -1 ) acc.push(x.year)
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
      if (!state.neighbourhood) return {}
      return state.indicators.filter(x=>x.area_code === state.neighbourhood && x.year === state.year)[0] || getters.dataByCityYear
    },
    dataByCityYear : state => {
      return state.cityIndicators.filter(x=>x.year===state.year)[0]
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
