//console.log// The Vue build version to load with the `import` command
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
import chroma from 'chroma-js'
import colors from 'vuetify/es5/util/colors'
import {theme} from './plugins/theme.js'
import {featureAnalysis} from './plugins/featureAnalysis.js'
import VueMasonry from 'vue-masonry-css'
const dbconfig = require('./db.config')
const flatten = require('flatten-obj')()
const arrayUtils = require('./plugins/arrayUtils')


global.DEBUG = process.env.NODE_ENV === 'dev' ? true : false

Vue.use(Vuetify, {
  options: {
    customProperties: true
  },
  theme: theme
})
Vue.use(VeeValidate)
Vue.use(Vuex)
Vue.use(VueMasonry);

Vue.config.productionTip = true

const collections = Object.keys(dbconfig).reduce((acc,key)=>{
  acc[`_col_${key}`] = dbconfig[key].storeByLayer ? {} : []
  acc[`_col_${key}_selected`] = ''
  return acc
},{})

const store = new Vuex.Store({
  state : Object.assign({
    hideToolbar:false,
    mode:null,
    activeUser : {},
    selectedFeatureLayers:[],
    updateCount:0,
    indicators: [],
    collections:{},
    cityIndicators: [],
    neighbourhood: 2412,
    areaLayer : '5cf510e19bfa58b6c509903b',
    year:2019,
    language:'en',
    languages: {
      en : {
        text:'English',
        rtl:false,
      },
      ar : {
        text:'العربية',
        rtl:true,
      }
    },
    theme : theme,
    tab:'',
    colorScale : chroma.scale([theme.scaleMin,theme.scaleMax]),
    colors : ['#ff267e', '#26ffa7', '#267eff','#000','#f46441'],
    map : {
      zoom:15,
      center: {lat: 31.827982118391024,lng: 35.22958321000619},
      defaultCenter: {lat: 31.78845754836993, lng: 35.2121981978},
      opacity:1,
    },
    hidden : {},
    navigator : {
      zoom:11.8,
      center: {lat: 31.827982118391024,lng: 35.22958321000619}, //800 = 35.14004811644555 1200 35.07534384727479
      defaultCenter: {lat: 31.827982118391024,lng: 35.22958321000619},
      indicator: {
        figure : 'pop_year_end',
        name : 'Population'
      }
    },
    styles : {},
    legendStyles : {},
    geo : {
      areas : [],
      facilities : [],
      educational: [],
      features: [],
      selected: null,
    },
    layers : []
  },collections),
  actions : {
    UPDATE_COLLECTION ({state, commit}, col) {
      //console.log('1. update collection',col)
      const params = {
        name : col.name || col,
        query : col.query || {},
        layer : col.layer,
      }

      if (dbconfig[params.name].storeByLayer) {
        params.layer = params.layer || state._col_layers_selected
        if (!params.layer) rej('no feature layer defined')
       //console.log(params.layer)
        const layer = state['_col_'+dbconfig[params.name].layerCollection].filter(x=>x._id === params.layer)[0]
        if (layer.filtered) {
          const areaLayerCode = state._col_areaLayers.filter(x=>x._id === state._col_areaLayers_selected )[0].code
          params.query['feature.properties.'+areaLayerCode ] = state.neighbourhood
          params.nestedKey = state.neighbourhood
        }
      } else if (params.name === 'areaAttributes') {
        //params.layer = 'areas'
      }

      function update(data){
        if (dbconfig[params.name].storeByLayer) {
          commit('UPDATE_FEATURES',{
            collection: params.name,
            key: params.layer,
            value: data, //Object.freeze(data),
            nestedKey: params.nestedKey
          })
        } else {
          const key = '_col_' + params.name
          const selKey = key + '_selected'
          //console.log('before commiting update',key,i.data.map(x=>x._id),i.data  )
          commit('UPDATE',{
            key: key,
            value: data //Object.freeze(data)
          })
          if (!state[selKey]&&data[0]) {
            commit('UPDATE',{
              key: selKey,
              value: data[0]._id
            })
          }
        }
      }

      return new Promise((res,rej)=>{

        if (col.data) {
          //console.log('supplied data', col.data)
          update(col.data)
          return res(col.data)
        }
       //console.log('making api request',params.name,params.query,params.layer)
        //update([])
        api.find(params.name,params.query,'',{lean: true},params.layer).then((i,err)=>{
          if (err) {
           //console.log('api error',err)
            rej(err)
          }
          //console.log('data found: ',params.name,i.data.map(x=>x._id),i.data )
          update(i.data)
          //console.log('2. updated collection: _col_' + params.name,i.data.length, i.data[0])
          res(i.data)
        }).catch(err=>{
          if (err.response) console.log('api error: ' + params.name, err.response)
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
         //console.log('facilities',state.facilities)
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
         //console.log('cityindicators',state.cityIndicators)
          //console.log('ind',state.indicators.filter(x=>x.year===2016))

        })
      });
    },
    /*api.distinct('layers','feature.properties.neighbourhood').then(i=>{
    console.log(i.data)
    state.neighbourhoodsTest = i.data
  })*/

  UPDATE_FEATURES (state, obj) {

    //console.log('updating feature', obj.nestedKey, obj.key, obj.value)
    const sortPath = dbconfig[obj.collection].sort
    const embedIdsPath = dbconfig[obj.collection].embedIds
    if (obj.value&&sortPath) obj.value = arrayUtils.sort(obj.value,false,sortPath)
    if (obj.value&&embedIdsPath ) obj.value = obj.value.map(x=>{
      arrayUtils.getNested(embedIdsPath, x)._id = x._id
      return x
    })
    Vue.set( state['_col_'+obj.collection], obj.key, obj.value )
    /*
    if (obj.nestedKey) {
    state._col_features[obj.key] = state._col_features[obj.key] || {}
    const newObj = {}
    newObj[obj.nestedKey] = obj.value
    Object.assign(newObj, state._col_features[obj.key])
    Vue.set( state._col_features, obj.key, newObj )
  } else {
  Vue.set( state._col_features, obj.key, obj.value )
}
*/
},
UPDATE_FEATURE_PROPERTIES (state,obj) {
  function getFirstCoordinates(feature){
    if(Array.isArray(feature)) {
      if (typeof feature[0] === 'number') return feature
      else getFirstCoordinates(feature[0])
    }
    else {
      getFirstCoordinates(feature.geometry.coordinates)
    }
  }
  //const feature = Object.assign({},state._col_features[obj.layer][obj.feature.feature.properties._index])
  //feature.feature.properties = obj.feature
  state._col_features[obj.layer].splice(obj.feature._index,1,obj.feature)
  let coords = getFirstCoordinates(obj.feature.feature.geometry.coordinates)
  //console.log('coords',coords)
  state.map.center = {lat:coords[1],lng:coords[0]}
},
SET_HIDDEN (state,obj) {
  //
  if (!obj.value) {
    Vue.delete(state.map,obj.key)
  } else {
    Vue.set(state.map,obj.key,obj.value)
  }
  //Object.assign(state.map,newObj)
},
UPDATE_USER (state,obj) {
  obj.groups = Array.from(obj.groups).reduce((acc,x)=> {
    acc[x] = true
    return acc
  },{})

  state.activeUser = obj
},
UPDATE (state, obj) {
  //console.log(obj.value)
  var base,key;

  if (Array.isArray(obj.key)) {
    if (obj.key.length < 3) {
      base = state[obj.key[0]]
      key = obj.key[1]
      //Vue.set(state[obj.key[0]], obj.key[1], obj.value);
    } else {

      base = arrayUtils.getNested(obj.key.slice(0,obj.key.length - 1),state)
      key = obj.key[obj.key.length - 1]
      //Vue.set(nested, obj.key[obj.key.length - 1], obj.value)
    }
    //console.log('updating store nested: ' + key, obj.value, base)
  } else {
    //console.log('is array', Array.isArray(obj.value), obj.value )
    //const ids = (obj.value[0] && obj.value[0]._id) ? obj.value.map(x=>x._id) : ''
    //console.log('updating store value: ' + obj.key, obj.value)
    base = state
    key = obj.key
  }

  if (typeof obj.value !== 'object' || Array.isArray(obj.value) ) {
    Vue.set(base, key, obj.value)
  } else {
    Object.keys(obj.value).forEach(valKey=>{
      Vue.set(base[key], valKey, obj.value[valKey])
    })
  }


},
UPDATE_AREA (state, code) {
  const e = state.geo.areas.filter(x=>x.feature.properties.id === code)[0]
  //console.log(e);
  state.neighbourhood = code
  state.map.center = {
    lon:e.feature.properties.Centroids_x,
    lat:e.feature.properties.Centroids_y
  }
},

},
getters : {
  styles : state => {
    const styles = state._col_styles.reduce((acc,x)=>{
      acc[x.layer] = acc[x.layer] || {}
      //acc[x.layer][x.name] = x
      acc[x.layer][x.attribute] = acc[x.layer][x.attribute] || {}
      acc[x.layer][x.attribute][x.name] = x
      return acc
    },{})

    Object.keys(styles).forEach(layer=>{
      Object.keys(styles[layer]).forEach(attr=>{
        const values = Object.keys(styles[layer][attr])
        let colors = state.colors
        if (values.length > state.colors.length) {
          colors = chroma.scale(state.colors).mode('lch').colors(values.length)
        }
        const attribute = styles[layer][attr]
        values.forEach((val,index)=>{
          attribute[val].on = true
          const styleDefault = {
            borderColor : colors[index],
            fillColor : colors[index],
            borderWidth : 2
          }
          attribute[val].style = Object.assign({}, styleDefault, attribute[val].style)
        })
      })
    })

    return styles
  },
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
    //console.log('edubyhood - init',state.geo.educational);
    const edu = state.geo.educational.reduce((acc,x)=>{
      if(x.feature.properties.mygeodat_5 === state.neighbourhood) {
        acc.push(x.feature.properties)
      }
      return acc;
    },[])
    //console.log('edubyhood',edu);
    return edu
  },
  educationalGeoByHood : state => {
    if (!state.geo.educational) return []
    const d = state.geo.educational.filter(x=>x.feature.properties.mygeodat_5 === state.neighbourhood)
    //console.log('educational geo', d)
    return d;
  },
  selectedAreas : state => {
    //console.log('areas',state._col_areas.filter(x=> x.layer === state._col_areaLayers_selected ))
    return state._col_areas.filter(x=> x.layer === state._col_areaLayers_selected)
  },
  selectedArea : (state, getters) => {
    return getters.selectedAreas.filter(x=> x.feature.properties.areaCode === state.neighbourhood)[0]
  },
  areaNames : (state,getters) => {
    if (!getters.selectedAreas) return null;
    return getters.selectedAreas.reduce((acc,x)=>{
      acc[x.feature.properties.areaCode] = x.feature.properties.name
      return acc
    },{})
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
  allIndicatorKeyYears: (state,getters) => {
    const ind = getters.allIndicatorsByYear;
    if (!ind) return null;
    return Object.keys(ind).reduce((acc,year)=>{
      const y = parseInt(year)
      ind[year].forEach(area=>{
        Object.keys(area).forEach(key=>{
          acc[key] = acc[key] || []
          if (area[key] && acc[key].indexOf(y)===-1) acc[key].push(y)
        })

      })
      return acc
    },{})
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
      acc[x.areaCode][x.year] = flatten(x)
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
    return arrayUtils.getNested( [state.neighbourhood,state.year] , getters.allIndicatorsByAreaYear)
  },
  featuresBySelectedArea : (state) => {
    return Object.keys(state._col_features).reduce((acc,key)=>{
      acc[key] = state._col_features[key][state.neighbourhood]
      return acc
    },{})
  },
  selectedFeatures : (state,getters) => {
    let layerIds;
    if (state.mode === 'indicatorSections') {
      layerIds = getters.selectedIndicatorSection ? getters.selectedIndicatorSection.geodata : null
    } else if (state.mode === 'layers') {
      layerIds = [ state._col_layers_selected ]
    }
    if (!layerIds || !layerIds[0]) return null
    return layerIds.map(x => {
      let features = state._col_features[x]
      if (!features) return [state._col_features, x, state._col_features[x], Object.keys(state._col_features), typeof state._col_features];

      return features.map(x=>x.feature)

    })
  },

  nestedAttributes : state => {
    return (store,edited) => {

      const proxyFunction = '%%%'

      let layers = state._col_layers.map(b => Object.assign({},b));
      const surveyLayers = state._col_surveyLayers.map(b => Object.assign({},b));

      layers = layers.concat(surveyLayers)

      if (state.tab!=='features') {
        const areaLayer = state._col_areaLayers.filter(b => b._id === state._col_areaLayers_selected)
        layers = layers.concat(areaLayer)
      }

      const layersObj = layers.reduce((acc,x)=>{
        acc[x._id]= x
        return acc
      },{})

      if (edited.type==='Map') {
        return layers.reduce((acc,x)=>{
          acc.push({'name': x.text_en,'value':x._id})
          return acc
        },[])
      } /*else if (!edited.areaLayer) {
        return {error:{name:'First select a spatial intersect',value:'error'}}
      }*/

      //attrs = state._col_indicatorAttributes.concat()

      const areaAttrs = state._col_indicatorAttributes.map(x => Object.assign({},x,{
        func : [proxyFunction]
      }))

      const layerCalcs = state._col_layerCalcs.map(x => Object.assign({},x,{
        func : [proxyFunction]
      }))

      const attrs = state._col_layerAttributes
      .concat(areaAttrs)
      .concat(layerCalcs)
      .concat(state._col_surveyLayerAttributes)

     //console.log('options attrs',attrs)

      /*const filtered = layers.reduce((acc,x)=>{
      if(x.spatial_intersect.some(a=>edited.areaLayer.indexOf(a)>-1)) acc.push(x._id)
      return acc
    },[areaKey])*/
    const filtered = layers.map(x=>x._id)


    return attrs.reduce((acc,att)=>{

      const index = filtered.indexOf(att.layer)
      const id = filtered[index]

      if (att.func.length === 0 || !id ) return acc

      const prefix = layersObj[id].featureLayer ? 'Survey: ' : ''

      acc[id] = acc[id] || { name: prefix + (layersObj[id].text_en || layersObj[id].name), items : [] }
      att.func.forEach(func=>{
        if (func) acc[id].items.push((att.name+'.'+func).replace('.'+proxyFunction,''))
      })

      return acc
    },{})

  }
},
collectionSchema : state => {
  return (collection,filter) => {
    let schema = Object.assign({},dbconfig[collection])
    if (typeof schema.schema === 'string') {
      let attributes = state[`_col_${schema.schema}`].filter(x=>x.layer === state[`_col_${filter}_selected`] ) // need to filter!
      const translate = dbconfig[schema.schema].translate

      schema.schema = Array.from(attributes).reduce((acc,x)=> {
        if (translate) translate.forEach(key => {
          x[key] = x[key+'_'+state.language]
        })
        x._text = x._text || x.name
        acc[x.name] = x
        return acc
      },{})

     //console.log('collectionSchema translate', translate)
    }
    console.log('collectionSchema',schema)
    return schema || {}
  }
},
getSelected : state => {
  return (collection) => {
    const id = state[`_col_${collection}_selected`]
    const selected = state[`_col_${collection}`].filter( x => x._id === id )[0]
    return selected || {}
  }
},
surveyRecordsByFeature : state => {
  if (!state._col_surveyRecords[state._col_surveyLayers_selected]) return null
  return state._col_surveyRecords[state._col_surveyLayers_selected].reduce((acc,x) =>{
    acc[x.linkedFeature] = acc[x.linkedFeature] || []
    acc[x.linkedFeature].push(x)
    return acc
  },{})
}
}
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
