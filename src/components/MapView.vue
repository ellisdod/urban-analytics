<template>
    <div ref="container" v-bind:style="mapStyle">
      <l-map
      v-if="layers"
      ref="myMap"
      :zoom="$store.state.map.zoom"
      :center="$store.state.map.center"
      :options="mapOptions"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
      class="main-map"
      :id="'map_'+featuresCollection"
      v-bind:style="{height:mapHeight}"
      >

      <l-protobuf v-if="baseMap==='detailed'" url="https://maps.tilehosting.com/data/v3/{z}/{x}/{y}.pbf?key=ArAI1SXQTYA6P3mWFnDs" :options="protobufOpts"></l-protobuf>
      <l-tile-layer v-if="baseMap==='basic'" url="https://cartodb-basemaps-b.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png" :options="protobufOpts"></l-tile-layer>

      <!--<l-geo-json
      v-if="areas"
      :geojson="areasGeoJson"
      :options-style="areaStyle"
      :options="getGeoJsonOptions()"/>
-->    <l-geo-json
v-if="featuresCollection==='areas'"
:geojson="areasGeoJson"
:options="getGeoJsonOptions()"
:options-style="getAreaStyle()"
/>

      <l-geo-json
      v-else v-for="(val,key) in layers"
      v-if="layers[key].on && layers[key].features"
      :key="key"
      :geojson="layers[key].features"
      :options="getGeoJsonOptions(key)"
      :options-style="geoJsonStyle(key)"
      />



      <!--

      <l-geo-json
      v-else-if="survey"
      v-for="(item, i) in surveyData"
      :key="item._id"
      :options="geoJsonOptions"
      :options-stylce="item.feature.properties.style"
      :geojson="item.feature"
      >
    </l-geo-json>
    <l-geo-json
    v-else-if="layers.areas"
    v-for="(item, i) in $store.state.geo.areas"
    :key="item._id"
    :geojson="item.feature"
    v-bind:options-style="getAreaStyle(item.feature.properties.id)"
    >
  </l-geo-json>
  <l-geo-json
  v-else-if="$store.state.geo.features[0]"
  v-for="(item, i) in $store.state.geo.features"
  :key="item._id"
  :geojson="item.feature"
  :options="geoJsonPointOptions(dataType,item)"
  >
</l-geo-json>-->
<div class="map-menu">
  <v-menu min-width="300px" flat>
    <v-spacer></v-spacer>
    <template v-slot:activator="{ on }">
      <v-btn icon v-on="on">
        <v-icon>more_vert</v-icon>
      </v-btn>
    </template>

    <v-list dense>
      <div class="px-4">
        <div>Base Map</div>
        <template v-for="(map,i) in baseMaps">
          <v-switch
          color="primary"
          :key="i"
          :label="map.text"
          v-model="map.selected"
          @click.native="updateBaseMap(map.type, map.selected)"/>
        </template>
        <v-switch
        color="primary"
        label="Legend"
        v-model="showLegend"/>
      </div>
    </v-list>
  </v-menu>
</div>

<div v-if="loading" style="position:absolute;top:180px;z-index:10;width:100%;">
  <div class="text-xs-center">
    <v-progress-circular indeterminate></v-progress-circular>
    <div class="mt-5">Loading data...</div>
  </div>
</div>

</l-map>



<div class="legend-right" id="map-legend" v-if="showLegend" :style="legendStyle">
  <area-select v-if="options&&options.areaSelect" titleclass="pb-0 pt-3 px-3 font-weight-medium" class="ejmap-border-bottom px-3" style="height:50px; flex: 0;"></area-select>
  <div v-if="allLayers" style="flex:2; overflow-y: auto; max-height:85vh">
  <v-expansion-panel expand v-model="layerPanels">
    <v-expansion-panel-content v-for="(item,key) in layers" :key="key">
      <template v-slot:header>
        {{item.text_en}}
      </template>

      <v-card class="pt-0">
          <v-card-text class="pt-0">
            <map-legend
              v-if="layers[key].on"
              :legend="layers[key].legend"
              :value="layers[key].attribute"
              v-bind:items="Object.keys(layers[key].attributes)"
              @input="function(e){updateAttributeKey(key,e)}"
              ></map-legend>
            </v-card-text>
    </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </div>

  <v-card v-else class="pt-0">
<v-card-text class="pt-0">
  <map-legend
    v-for="(item,key) in layers"
    v-if="item.on"
    :key="key"
    :legend="layers[key].legend"
    :value="layers[key].attribute"
    v-bind:items="Object.keys(layers[key].attributes)"
    @input="function(e){updateAttributeKey(key,e)}"
    ></map-legend>
  </v-card-text>
  </v-card>
</div>

<v-dialog v-model="dialog" max-width="700px">
  <v-tabs>
    <v-tab v-for="(item,index) in editItems" :key="index">
      Record {{index + 1}}
    </v-tab>
    <v-tab>
      New
    </v-tab>
    <v-tab-item v-for="(item,index) in editItems" :key="index">
      <editor
      collection="surveyRecords" filter="surveyLayers" :editItem="item" v-on:close="close()" v-on:update="updateCollection(true)">
      </editor>
    </v-tab-item>
    <v-tab-item>
      <editor
      collection="surveyRecords" filter="surveyLayers" :attributes="attributes" v-on:close="close()" v-on:update="updateCollection(true)">
      </editor>
    </v-tab-item>
  </v-tabs>
</v-dialog>

</div>

</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup, LTooltip, LPolygon, LGeoJson} from 'vue2-leaflet'
import Vue2LeafletVectorGridProtobuf from '@/../public/Vue2LeafletVectorGridProtobuf.vue'
//var vectorTileStyling = require('../../public/mapStyle.js');
import vectorTileStyling2 from '@/../public/mapStyle2.js'
import API from '@/api.js'
import chroma from 'chroma-js'
import arrays from '@/plugins/arrayUtils.js'
import MapLegend from './MapLegend.vue'
import AreaSelect from './AreaSelect.vue'
import Editor from './Editor.vue'

//const Vue2LeafletVectorGridProtobuf = require('../../public/Vue2LeafletVectorGridProtobuf.vue');
//var vectorTileStyling = require('../../public/mapStyle.js');
//const vectorTileStyling = require('../../public/mapStyle.js');
import axios from 'axios'
import surveyQuestionsJson from './../assets/building_survey.json'
import L from 'leaflet'
const dbconfig = require('@/db.config')

export default {
  name: 'MapView',
  props: ['featureLayers','featuresCollection','zoomLevel','options','areas','height','allLayers','legendBottom'],
  components: {
    LMap:LMap,
    LTileLayer:LTileLayer,
    LMarker:LMarker,
    LPopup:LPopup,
    LTooltip:LTooltip,
    LProtobuf : Vue2LeafletVectorGridProtobuf,
    LPolygon : LPolygon,
    LGeoJson : LGeoJson,
    MapLegend : MapLegend,
    AreaSelect : AreaSelect,
    Editor : Editor
  },
  $_veeValidate: {
    validator: 'new'
  },
  data () {
    return {
      dialog : false,
      itemTemplate : {},
      editItems : [],
      layerPanels : [],
      loadingValue : null,
      loading : false,
      language: 'ar',
      languages: ['ar','en'],
      basemaps : {
        url: 'https://{s}.basemaps.cartocdn.com/{z}/{x}/{y}.png',
        url2: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
        url3: 'http://a.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png ',
      },
      center: L.latLng(31.778837,35.243452),
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      currentZoom: 14,
      currentCenter: L.latLng(31.778837,35.243452),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5,
        scrollWheelZoom :false
      },
      layers: {},
      geoJsonAreaOptions:{
        onEachFeature: (feature, layer) => {
          var self = this
          //layer.bindPopup('<p><b>'+n.name+'</b></p><p>'+self.$store.state.navigator.indicator.name +': '+n[self.$store.state.navigator.indicator.figure]+'</p>');
          layer.on({
            click : function(e) {
              const p = e.target.feature.properties
              self.$store.commit('UPDATE',{key:'neighbourhood',value:p.areaCode});
              self.$store.commit("UPDATE",{key:'selectedFeature',value:p._id})
              self.openEditor(p._id)
              //console.log('changed',this.$store.state.neighbourhood);
              //console.log(e.target._map.getCenter());
              self.$store.commit('UPDATE',{
                key:['map','center'],
                value: {
                  lon:p.centroid_lng,
                  lat:p.centroid_lat
                }
              })
            },/*
            mouseover : function(e) {

            const n = self.$store.getters.dataByYear.filter(x=>x.area_code === e.target.feature.properties.id)[0]
            self.details = {
            neighbourhood : n.name,
            value : n[self.$store.state.navigator.indicator.figure],
            key : ''

          },
          mouseout : function(e) {

          self.details = self.detailsDefault

        }*/
      })

    }
  },
  geoJsonPolygonStyle : function(feature) {
    //console.log(feature)
    //getLegendStyle(feature,key,legend)
    const color = feature._selected ? 'black' : 'white'
    return {
      weight: 1,
      color: color,
      opacity: 0.9,
      fillColor: color,
      fillOpacity: 0.6,
    }
  },
  filtered: false,
  survey : false,
  surveyData : [],
  surveyNames: false,
  surveyOpacity : 0.5,
  editFeature : {},
  editFeatureDefaults : {},
  editDialog : false,
  editFeaturePath : "",
  editFeatureViewBox : "",
  editIndex :0,
  editMapCenter:{lat: 31.843725284728198, lng: 35.22635998187065},
  editMapFeature:null,
  editMapZoom:16,
  optionsDialog:false,
  selectedSurvey:null,
  baseMaps: [
    {text:'Basic',type:'basic',selected:true},
    {text:'Detailed',type:'detailed',selected:false}
  ],
  baseMap : 'basic',
  surveyKey : {
    complete: {color:'#00C7FF',text:'Complete'},
    inProgress: {color:'#FFBD00',text:'In Progress'},
    notStarted:{color:'#FF0063',text:'Not Started'}
  },
  geoJsonOptions : {

    onEachFeature: (feature, layer) => {
      var self = this;
      const html = Object.keys(feature.properties).reduce((acc,key)=>
      acc + '<li>' + key + ': ' + feature.properties[key] + '</li>','<ul>')
      + '</ul>'
      layer.bindPopup(html);

      layer.on({
        click : function(e) {
          self.openEditor(e.target.feature.properties._id)
          console.log(e.target)
        },
        mouseover : function(e) {

        },
      });
    }
  },
};

},
computed: {
  attributes () {
    if (!this.featureLayers) return null
    return this.layers[this.featureLayers[0]] ? this.layers[this.featureLayers[0]].attributes : null
  },
  showLegend () {
    return this.hideLegend || this.featuresCollection === 'areas' ? false : true
  },
  featureLayersArray() {
    if (!this.featureLayers) {
      return []
    } else if (Array.isArray(this.featureLayers)) {
      return this.featureLayers
    } else {
      return [this.featureLayers]
    }
  },
  legendStyle() {
    const style = this.options ? this.options.legendStyle : {}
    return Object.assign(
      {
        height: this.options && this.options.legendBottom ? '200px' : 'auto',
        maxHeight: this.options && this.options.legendBottom ? '200px':'auto',
        overflowY:'auto',
        overflowX: 'visible!important'
      }, style || {})

  },
  widthSmall () {
    return this.$refs.container && this.$refs.container.clientWidth < 300 ? true : false
  },
  mapHeight() {
    const navHeight = document.getElementsByTagName('nav')[0].clientHeight
    return this.height || (window.innerHeight-navHeight) + 'px'
  },
  mapStyle () {
    const style = this.options ? this.options.mapStyle : {}
    //console.log('mapstyle',style)
    return Object.assign( {
      display: this.options && this.options.legendBottom ? 'block' : 'flex'
    }, style || {} )
  },
  areaStyle () {
    if (this.layers) {
      return {
        weight: 1,
        color: '#ccc',
        opacity: 1,
        fillOpacity: 0,
      }
    } else {
      return {}
    }
  },
  layerPanelHeight () {
    return this.survey ? window.innerHeight - 150 : 350;
  },
  surveyKeyArray() {
    return Object.values(this.surveyKey);
  },
  protobufOpts() {
    const opacity = this.survey ? this.surveyOpacity : 1;
    return {
      vectorTileLayerStyles: vectorTileStyling2,
      maxNativeZoom: 18,
      opacity: opacity
    };
  },
  tileOpts() {
    const opacity = this.survey ? this.surveyOpacity : 1;
    return {
      opacity: opacity
    };
  },
  surveyQuestions () {
    return this.translate(surveyQuestionsJson, 'label', this.language);
  },
  scale () {
    const sorted = this.$store.getters.indicatorsForSelectedYear.map( x =>
      x[this.$store.state.map.indicator.figure]
    ).sort((a,b)=> a-b);
    return {
      min : sorted[0],
      max :sorted[sorted.length-1] - sorted[0]
    }
  },
  zoom () {
    return parseInt(this.zoomLevel) || this.$store.state.map.zoom ||14
  },
  areasGeoJson () {
    // remove features without area code
    let data = this.$store.getters.selectedAreas
    if (!data) return null
    return this.embedIds(data)
  },


},
methods: {
  embedIds(features) {
    return features.reduce((acc,x)=>{
      x.feature.properties._id = x._id
      acc.push( x.feature)
      return acc
    },[])
  },
  close() {
    this.dialog = false
  },
  updateLegend (layerKey) {

      const layer = this.layers[layerKey]
      if (!layer.on || !layer.features) return
      const attribute = layer.attributes[layer.attribute]
      if (!attribute) return
      const legend = {
        items : {}
      }
      console.log('attribute',attribute,legend)

      if (attribute.type === 'Number') {

        legend.items = arrays.sortNumbers(layer.features,'properties.' + layer.attribute)
        legend.type = Number
        legend.chroma = chroma.scale(['#ff236c','#2377ff']);

      } else if (attribute.type === 'String') {

        let items = layer.features.reduce((acc,x)=>{
          const val = x.properties[layer.attribute]
          if (acc.indexOf(val) === -1 ) acc.push(val)
          return acc
        },[])

        items = items.filter(x=>x!==null)
        items = items.sort()
        //console.log('items',items)

        //const s1 = ['#c51b7d','#fee08b','#3288bd']['#ff236c','#2377ff','#42f4b9','#0d1a38','#f46441']
        let scale = ['#ff267e', '#26ffa7', '#267eff','#000','#f46441']
        if (items.length > scale.length) {
          scale = chroma.scale(scale).mode('lch').colors(items.length)
        }

        legend.items = items.reduce((acc,x,index)=>{
          acc[x] = scale[index]
          //acc[x] = f(index/(items.length-1))
          return acc
        },{})
        legend.items.null = '#999'
        legend.type = String

      } else if (attribute.type === 'Boolean') {
        legend.items = { true : 'red', false: 'blue' }
        legend.type = Boolean
      }
      this.$set(this.layers[layerKey],'legend',legend)

      //console.log('legend',legend, key)
      //this.log()
  },
  updateLayers(key,e) {
    key = typeof key === 'number' ? Object.keys(this.layers)[key] : key
    if (this.layers[key]) this.$set(this.layers[key], 'on', e)
    //Object.assign(this.layers[key],{on:e})
    if (e) {
      this.checkForUpdate()
    } else {
      this.$forceUpdate()
    }

    console.log(this.layers)
  },
  updateAttributeKey(key,e) {
    this.$set(this.layers[key],'attribute',e)
    this.updateLegend(key)
    console.log(this.layers)
  },
  getGeoJsonOptions (key) {
    console.log('getgeojsonopts',key)
    if (this.featuresCollection === 'areas') return this.geoJsonAreaOptions
    const type = this.layers[key].data_type
    let opts = ''
    if (type === 'Point') {
      opts = this.geoJsonPointOptions(key)
      console.log('geojsonopts - opts',opts)
      return opts
    } else if (type === 'Polygon' || type === 'MultiPolygon' || type === 'LineString' || type === 'MultiLineString'){
      return this.geoJsonOptions
    }
  },
  geoJsonPointOptions (key) {
    console.log('geojsonopts',key)
    var self = this;
    //console.log('geoJsonPointOptions - legend', self.legends[layerIndex], layerIndex)
    return {
      pointToLayer: function (feature, latlng) {
        const style = self.getLegendStyle(feature, key , self.layers[key].legend)
        //console.log(style)
        return L.circleMarker( latlng, style )
      },

      onEachFeature: (feature, layer) => {
        const p = feature.properties
        layer.bindPopup('<p>'+p.type+'</p><p>'+p.students+'</p>');
        layer.on({
          click : function(e) {
            self.openEditor(e.target.feature.properties._id)
            self.$store.commit("UPDATE",{key:'selectedFeature',value:e.target.feature.properties._id})
            console.log(e)
          },
          mouseover : function(e) {
            e.target.openPopup()
          },
          mouseout : function(e) {
            e.target.closePopup()
          }
        });
      }
    }
  },
  geoJsonStyle(key) {
    const style = {
      weight: 2,
      opacity: 1,
      fillOpacity: 0.7,
      stroke: false
    }
    var self = this;
    return (feature) => {
      return self.getLegendStyle(feature, self.layers[key].attribute, self.layers[key].legend, style)
    }
  },
  getLegendStyle(feature,key,legend,style){
    //if (!this.legends) return null
    //console.log('getPointStyle', legend)
    style = Object.assign({
      radius: 4,
      fillColor: 'blue',
      weight: 0,
      opacity: 1,
      fillOpacity: 0.5,
    }, style )

    let colorKey = 'fillColor'
    const val = feature.properties[key]

    if (feature.geometry.type ==='LineString' || feature.geometry.type ==='MultiLineString') {
      style.stroke = true
      colorKey = 'color'
    }

    //console.log(legend, val,key,feature.properties)
    if (!this.showLegend || !legend) return style

    if (this.showLegend && legend.type === Number) {
      style[colorKey] =  legend.chroma( (val - legend.items.min)/legend.items.constant ).hex()
    } else if (this.showLegend) {
      style[colorKey] = legend.items[val]
    }
    //style.color = style.fillColor
    //console.log(key, color,val)
    return style

  },
  getAreaStyle(){
    const self = this
    const style = {
      weight: 2,
      color: 'grey',
      opacity: 0.4,
      fillColor: 'grey',
      fillOpacity: 0.2,
    }
    return function(feature){
      if (self.$store.state.neighbourhood === feature.properties.areaCode) {
        return Object.assign({},style, {color: 'orange',
          fillColor: 'orange'
        })
      } else {
        return style
      }
    }

  },
  updateMap(){
    /*
    const self = this
    let map = self.$refs.myMap
    //  this.displayKey = Object.assign({},this.displayKey)
    setTimeout(function(){
    if (map) {
    map = map.mapObject
    console.log('MAPOBJECT redrawing',map)
    console.log('layers', Object.keys(map._layers))
    if (Object.keys(map._layers).length === 1) {
    self.updateMap()
  } else {
  Object.keys(map._layers).forEach(key=>{
  if (!map._layers[key]._tiles) {
  map._layers[key]._update()
  //map._layers[key]._updatePoly()
  //map._layers[key]._destroyContainer()
}
})
}
//map.invalidateSize()
} else {
console.log('delaying updating map', self.$refs)
self.updateMap()
}
}, 500);
*/
},
updateBaseMap(map,on) {
  console.log(map,on);
  this.baseMap = on ? map : '';
  this.baseMaps.forEach(x=> x.selected = x.type == map ? on :false )
},
zoomUpdate (zoom) {
  this.currentZoom = zoom;
},
centerUpdate (center) {
  this.currentCenter = center;
},
getCoordsPoint(feature) {
  const crds = feature.geometry.coordinates[0][0];
  return L.latLng(crds[1],crds[0]);
},
getSurveyNames(){
  API.distinct('buildings','feature.properties.neighbourhood')
  .then( x=> {
    this.surveyNames = x.data
  })
},
getSurveyData(name) {
  //console.log(name);
  API.getSurveyData(name)
  .then( x=> {
    //console.log(x);
    x.data.forEach(x => {
      x.feature.properties.Id = x._id
      x.feature.properties.survey = x.feature.properties.survey || {};
    });
    this.surveyData = x.data;
    this.styleSurveyData();
    this.survey = true
    //console.log(this.survey)
    //this.surveys.forEach(x=> x.selected = x.name==name ? true : false );
    this.center = this.editMapCenter =this.getCoordsPoint(x.data[0].feature)
  })
},
toggleOptionsDialog() {
  this.optionsDialog = ! this.optionsDialog;
  if (this.optionsDialog) {
    setTimeout(function(){
      const layerPanel = document.getElementsByClassName('v-toolbar__extension')[0].style;
      console.log(layerPanel);
      layerPanel.overflow = 'auto';
    }, 500);
  }
},
translate(obj,key,language) {

  function selectLanguageKey (obj,key,language) {
    return obj.reduce((acc,val) => {
      if(typeof val === 'object') {
        val[key] = val[key+'_'+language];
        Object.keys(val).forEach(x=>{
          if (Array.isArray(val[x])) selectLanguageKey(val[x], key,language)
        });
        acc = acc || []
        acc.push(val);
        return acc;
      }
    },[]);
  }
  return selectLanguageKey(obj,key,language);
},
update () {
  console.log('updating map...')
  const map = this.$children[0] ? this.$children[0].mapObject : null
  if (!map) {
    console.log('no map object',this.$children,this.$refs.myMap)
    this.$forceUpdate()
    return null
  }
  //this.$nextTick(() => self.$forceUpdate())
  console.log('invalidating map - layers', this.layers)
  setTimeout(()=>map.invalidateSize(),500)
  //console.log('updated store 2', this.layers, this.$store.getters.selectedFeatures, this.$store.getters.featuresBySelectedArea)
},
log(text) {
  //console.log(this.$refs.myMap.mapObject)
  //this.$forceUpdate()
  /*const layers = this.$store.state._col_layers.reduce((acc,x)=>{
  if (acc.indexOf(x._id) ===-1) acc.push(x._id)
  return acc
},[])*/

//console.log(text, 'layers: ' + layers.length, this.$store.state._col_layers_selected, this.layers)
//console.log(text, this.layers.join(','), this.featuresList.join(','))
},
checkForUpdate() {
  const featurecol = this.$store.state['_col_'+this.featuresCollection]
  if (!this.layers) return null
  let promises = Object.keys(this.layers).reduce((arr,key)=>{
    if (!this.layers[key].on) return arr
    arr.push(new Promise((res,rej)=> {
      const returnObj = {}
      const filtered = this.layers[key].filtered
      let featuresNo = featurecol[key] ? featurecol[key].length : 0;
      if (!this.loading && (featuresNo === 0 || filtered ) ) {
        this.loading = true
        this.$store.dispatch('UPDATE_COLLECTION', {layer:key, name: this.featuresCollection} )
        .then((x,err)=>{
          if (err) console.log('update error', err)
          console.log('dispatch return', x)
          this.loading = false
          returnObj[key] = x
          return res(returnObj)
          //let features = this.$store.state._col_features[this.featureLayers[index]][newValue].map(x=>x.feature)
          //console.log('adding features to map:',  features)
          //new L.geoJSON([{type:'FeatureCollection',features:features.map(x=>x.feature)}], this.geoJsonOptions(index) ).addTo(map)
        })
      } else {
        returnObj[key] = featurecol[key]
        return res(returnObj)
      }
    }))
    return arr
  },[])
  Promise.all(promises).then((arr)=>{
    console.log('promises complete', arr, this.$store.state['_col_'+this.featuresCollection])
    arr.forEach(x=>{
      const key = Object.keys(x)[0]
      this.$set(this.layers[key],'features',this.embedIds(x[key]))
      this.updateLegend(key)
    })
    this.update()
  })
},
setLayers() {
  const schema = dbconfig[this.featuresCollection]
  let layers = this.$store.state['_col_'+schema.layerCollection]
  let attrs = typeof schema.layerAttributes === 'string' ?  this.$store.state['_col_'+schema.layerAttributes] : schema.layerAttributes || []

  layers.forEach(x=>{
    const layer = Object.assign({features:'',legend:''},x)
    layer.attributes = attrs.reduce((obj,i)=>{
        if (layer._id === i.layer && i.func.length > 0) {
          obj[i.name] = i
        }
        return obj
      },{})
    layer.attribute = Object.keys(layer.attributes)[0]
    layer.on =  this.featureLayersArray.indexOf(layer._id) > -1 ? true : false
    this.layerPanels.push(layer.on)
    this.$set(this.layers, layer._id, layer)
  })
  console.log('layers',this.layers)

},
openEditor (featureId) {
  this.dialog = true
  if (this.featureCollection !== 'surveyFeatures') return null;
  this.editItems = this.$store.state._col_surveyRecords.filter(x=>x.feature === featureId)
}

},
created() {
  this.setLayers()
},
watch: {
  featureLayers: function(newVal,oldVal) {
    console.log('selected',newVal)
    this.updateLayers(oldVal,false)
    this.updateLayers(newVal,true)
  },
  layerPanels: function(newVal,oldVal) {
    for (var x=0; x<newVal.length;x++) {
      if (!oldVal[x] || newVal[x] != oldVal[x]) this.updateLayers(x,newVal[x])
    }
    //if this panelIndex matches this component's index.. do stuff since we're selected
  }
},
mounted(){
  console.log('layers on mount',this.layers)
  this.$nextTick(() => {
  //if (window.screen.width < 800) this.updateBaseMap('basic',true);
  this.editFeatureDefaults = Object.assign({},this.editFeature)
  //this.resetDisplayKey()
  this.checkForUpdate()
})
  //console.log('map',this.$refs.myMap.mapObject)
  this.$store.watch( (state) => state.neighbourhood, this.checkForUpdate )
  this.$store.watch( (state) => state._col_layers_selected, this.checkForUpdate )
  this.$store.watch( (state) => state._col_indicatorSections_selected, this.checkForUpdate )

  //create survey plugin
  //this.getSurveyNames();
  /*this.editFeature = surveyQuestionsJson.reduce((acc,x)=>{
  acc[x.name] = '';
  return acc;
},{});
*/

}

};
</script>

<style>
@import "../../node_modules/leaflet/dist/leaflet.css";
.main-map {
  z-index:0;
  background-color:#eee;
  height:400px;
  flex: 1;
}

.map-menu {
  width:300px;
  z-index:500;
  position:absolute;
  top:12px;
  right:12px;
  text-align:right;
}

.highlighted {
  background-color:#e8e8e8;
}

.v-label {
  font-size: 13px;
}
.leaflet-touch .leaflet-bar, .leaflet-touch .leaflet-bar a {
  border:none;
  border-bottom:none;
  color:#999;
}

#map_features .leaflet-control-container .leaflet-left {
  right:23px;
  top: 40px;
  left:auto;
}
#map_features.leaflet-touch .leaflet-bar a {
  color:#000 !important;
}

#map-legend {
  top:0px;
  width:20%;
  max-width:300px;
  min-width:200px;
  color: var(--v-grey-darken2);
  display:flex;
  flex-flow: column;
  flex-direction:column;
}
#map-legend .v-list__tile {
  height:auto;
}
#map-legend .v-expansion-panel__header__icon {
  display: none;
}
#map-legend .v-expansion-panel__header:hover{
  background-color:#eee;
}
#map-legend .v-expansion-panel__container{
  border-top:none;
  background:none;
}
#map-legend .v-expansion-panel__container--active {
  border-top:1px solid #e3e3e3;
  border-bottom:1px solid #e3e3e3;
}
#map-legend .v-expansion-panel__container--active .v-expansion-panel__header{
  color:var(--v-primary-base);
  font-weight:700;
}
#map-legend .v-expansion-panel {
  box-shadow: none;
}

#map-legend.legend-right  {
  top:0px;
  right:20px;
  left:auto;
}
#map-legend .v-card {
  background: none;
  box-shadow:none;
}


</style>
