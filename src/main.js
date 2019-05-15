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
    indicators: [],
    cityIndicators: [],
    neighbourhood:2112,
    year:2016,
    language:'en',
    languages: ['ar','en'],
    theme : theme,
    tab:'demographics',
    map : {
      zoom:14,
      center: {lat: 31.827982118391024,lng: 35.22958321000619},
      defaultCenter: {lat: 31.827982118391024,lng: 35.22958321000619}
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
      areas : [],
      facilities : [],
      educational: []
    }
  },
  mutations : {
    GET_INDICATORS (state) {
      api.getAreas().then(x=>{
        state.geo.areas = x.data;
      })
      api.getIndicators().then(x=> {
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
        api.getFacilities().then(x=>{
          state.geo.facilities = x.data
          state.facilities = x.data.map(x => x.feature.properties )
          console.log('facilities',state.facilities)
          let edu = x.data.filter(x=>x.feature.properties.Use === 'Educational')
          state.geo.educational = edu;

          edu = edu.reduce((acc,x)=>{
            if (!x.feature.properties.mygeodat_5) return acc

            //console.log(loc)
            const prop = x.feature.properties

            //console.log(acc[loc])
            const keys = ['Sort1','Sort2','Gender','no_student','no_females','no_classes','Type']
            const hoodCode = x.feature.properties.mygeodat_5.toString()
            const areaCodes = ['9999',hoodCode]

            areaCodes.forEach(function(code) {
              acc[code] = acc[code] || {};
              acc[code].types = acc[code].types || {}
              keys.forEach(function(i){
                if (typeof prop[i] === 'string') {
                  acc[code].types[prop[i]] = !acc[code].types[prop[i]] ? 1 : acc[code].types[prop[i]] + 1
                } else {
                  acc[code][i] = !acc[code][i] ? prop[i] || 0 : acc[code][i] + prop[i]
                }
              })
            })

            return acc;
          },{})
          console.log('edu',edu)

          state.indicators.forEach( (x,y) => {
            if (x.year===2015 && x.area_code) {
              state.indicators[y] = Object.assign({},x,edu[x.area_code.toString()])
              //console.log('edu',edu[x.area_code.toString()])
            }
          })
          state.cityIndicators.forEach( (x,y) => {
            if (x.year===2015) {
              state.cityIndicators[y] = Object.assign({},x,edu['9999'])
              console.log('eduCity',Object.assign({},x,edu['9999']))
            }
          })
          console.log('cityindicators',state.cityIndicators)
          //console.log('ind',state.indicators.filter(x=>x.year===2016))

        })
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
      if (!state.indicators) return []
      //console.log('areaSelect',getters.dataByYear.concat(getters.dataByCityYear))
      return  getters.dataByYear.concat(getters.dataByCityYear)
    },
    neighbourhoods : (state, getters) => {
      if (!state.indicators) return []
      return state.indicators.reduce((acc,x)=>{
        acc= acc ||[]
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
      return state.indicators.filter(x=>x.area_code === state.neighbourhood && x.year === state.year)[0] || getters.dataByCityYear || {}
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
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
