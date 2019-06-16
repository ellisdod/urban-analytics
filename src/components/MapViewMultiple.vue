<template>
  <div>
    <div style="height:400px;">

      <l-map
      ref="myMap"
      :zoom="$store.state.map.zoom"
      :center="$store.state.map.center"
      :options="mapOptions"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
      class="main-map"
      :id="'map_'+featuresCollection"/>

      <l-protobuf v-if="baseMap=='detailed'" url="https://maps.tilehosting.com/data/v3/{z}/{x}/{y}.pbf?key=ArAI1SXQTYA6P3mWFnDs" :options="protobufOpts"></l-protobuf>
      <l-tile-layer v-if="baseMap=='basic'" url="https://cartodb-basemaps-b.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png" :options="protobufOpts"/>

      <l-geo-json
      v-if="areas"
      :geojson="areasGeoJson"
      v-bind:options-style="areaStyle"
      :options="getGeoJsonOptions()"/>


    <l-geo-json
    v-for="(layer,index) in featuresListParsed"
    v-if="featureLayers"
    :key="index"
    :geojson="layer"
    :options="getGeoJsonOptions(index)"/>



  <!--      <l-geo-json
  v-else-if="survey"
  v-for="(item, i) in surveyData"
  :key="item._id"
  :options="geoJsonOptions"
  :options-style="item.feature.properties.style"
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
</l-map>

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

<div id="map-legend" v-if="showLegend&&legends" style="max-height:300px; overflow-y:auto; overflow-x:visible!important;">
  <div v-for="(legend,i) in legends" :key="i">
    <v-select
    style="width:100px;"
    class="caption"
    color="grey"
    v-bind:items="Object.keys(featuresAttrs[i])"
    ></v-select>

    <table v-if="legend&&legend.type===Number">
      <tr>
        <td class="key-gradient" v-bind:style="{backgroundImage: 'linear-gradient('+legend.chroma(0)+','+legend.chroma(1)+')'}">
        </td>
        <td class="key-figures">
          <div class="key-max">
            {{legend.items.max }}
          </div>
          <div class="key-min">
            {{legend.items.min }}
          </div>
        </td>
      </tr>
    </table>

    <table v-else-if="legend">
      <tr v-for="(val,key) in legend.items">
        <td class="key-icon" v-bind:style="{color:val}">●</td>
        <td class="key-figures"><span style="background-color: #fff;padding:1px 5px;" class="grey--text text--darken-2">{{key}}</span> </td>
      </tr>
    </table>
  </div>
</div>


</div>

</div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup, LTooltip, LPolygon, LGeoJson} from 'vue2-leaflet'
import Vue2LeafletVectorGridProtobuf from '@/../public/Vue2LeafletVectorGridProtobuf.vue'
//var vectorTileStyling = require('../../public/mapStyle.js');
import vectorTileStyling2 from '@/../public/mapStyle2.js'
import API from '@/api.js'
import chroma from 'chroma-js'
import arrays from '@/plugins/arrays.js'

//const Vue2LeafletVectorGridProtobuf = require('../../public/Vue2LeafletVectorGridProtobuf.vue');
//var vectorTileStyling = require('../../public/mapStyle.js');
//const vectorTileStyling = require('../../public/mapStyle.js');
import axios from 'axios'
import surveyQuestionsJson from './../assets/building_survey.json'
import L from 'leaflet'

export default {
  name: 'MapView',
  props: ['featureLayers','featuresCollection','zoomLevel','options','areas'],
  components: {
    LMap:LMap,
    LTileLayer:LTileLayer,
    LMarker:LMarker,
    LPopup:LPopup,
    LTooltip:LTooltip,
    LProtobuf : Vue2LeafletVectorGridProtobuf,
    LPolygon : LPolygon,
    LGeoJson : LGeoJson
  },
  $_veeValidate: {
    validator: 'new'
  },
  data () {
    return {
      showLegend:true,
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
      },
      geoJsonOptions:{
        onEachFeature: (feature, layer) => {
          var self = this;
          const p = feature.properties
          const n = self.$store.getters.indicatorsForSelectedYear.filter(x=>x.areaCode === p.id)[0]
          layer.bindPopup('<p>'+n.name+'</p><p>'+self.$store.state.navigator.indicator.name +': '+n[self.$store.state.navigator.indicator.figure]+'</p>');

          layer.on({
            click : function(e) {
              console.log(e.target)
            },
            mouseover : function(e) {

            },
          });
        }
      },
      geoJsonAreaOptions:{
        onEachFeature: (feature, layer) => {
          var self = this
          //layer.bindPopup('<p><b>'+n.name+'</b></p><p>'+self.$store.state.navigator.indicator.name +': '+n[self.$store.state.navigator.indicator.figure]+'</p>');
          layer.on({
            click : function(e) {
              const p = e.target.feature.properties
              console.log(e.target)
              self.$store.commit('UPDATE',{key:'neighbourhood',value:p.id});
              self.$store.commit('UPDATE',{key:['map','zoom'],value:15});
              self.$store.commit("UPDATE",{key:'selectedFeature',value:e.target.feature.properties._id})

              //console.log('changed',this.$store.state.neighbourhood);
              //console.log(e.target._map.getCenter());
              self.$store.commit('UPDATE',{
                key:['map','center'],
                value: {
                  lon:p.Centroids_x,
                  lat:p.Centroids_y
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
  layers :{
    areas : true
  },
  displayKey : {'0':'','1':'','2':''},
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
  }
};

},
computed: {
  items () {
    const layers = [
      {
        heading: 'Layers',
        icon: 'keyboard_arrow_up',
        'icon-alt': 'keyboard_arrow_down',
        text: 'More',
        model: false,
        children: [
          { icon: 'add', text: 'Background' },
          { icon: 'add', text: 'Boundaries' },
          { icon: 'add', text: 'Buildings' },
          { icon: 'add', text: 'Roads' }
        ]
      },
      { divider : true}
    ];
    const loggedInActions = [

    ]
    return this.$auth.isAuthenticated() ? [] : [];
  },
  areaStyle () {
    if (this.featureLayers) {
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
  featuresListParsed() {
    if (!this.featuresList || !this.featuresList[0]) return null
    console.log('MapView featuresList', this.featuresList, this.options)
    this.log()
    return this.featuresList.reduce((acc,x)=>{
      acc.push(x.reduce((arr,i)=>{
        if (i.feature) arr.push(i.feature)
        return arr
      },[]))
      return acc
    },[])
  },
  areasGeoJson () {
    // remove features without area code
    let data = this.$store.state._col_areas
    if (!data) return null
    return data.reduce((acc,x)=>{
      x.feature.properties._id = x._id
      acc.push( x.feature)
      return acc
    },[])
  },
  featuresList () {
    if (!this.featureLayers) return null
    this.log('featureslist')
    return this.featureLayers.map(x=>{
      return this.$store.state._col_features[x]
    })
  },
  featuresOpts () {
    if (!this.featureLayers) return null
    this.log('featuresopts')
    return this.featureLayers.map(x=>{
      const layer = this.$store.state._col_layers.filter(i=>i._id === x)[0]
      return layer ? { type: layer.data_type } : null
    })
  },
  featuresAttrs () {
    //this.featuresList
    //this.featureLayers
    //this.$store.state._col_layerAttributes
    if (!this.featureLayers) return null
    this.log('featuresattrs')
    console.log('featurelayers',this.featureLayers)

    const attrs = this.featureLayers.reduce((arr,x,index1)=>{
      arr.push(this.$store.state._col_layerAttributes.reduce((obj,i,index2)=>{
        if (i.layer === x && i.func.length !== 0) {
          obj[i.name] = i
        }
        return obj
      },{}))
      return arr
    },[])
    console.log('attrs',attrs)
    return attrs
  },
  legends () {

    //this.featuresAttrs
    //this.displayKey

    if (!this.featuresAttrs || !this.featuresList || !this.displayKey['0']) return null

    this.log()
    const legends = this.featuresAttrs.map((att,i)=>{
      const key = this.displayKey[i]

      console.log('key',key)
      const legend = {
        items : {}
      }
      if (!att[key]) return null

      if (att[key].type === 'Number') {

        legend.items = arrays.sortNumbers(this.featuresList[i],'feature.properties.' + key)
        legend.type = Number
        legend.chroma = chroma.scale(['#ff236c','#2377ff']);

      } else if (att[key].type === 'String') {

        let items = this.featuresList[i].reduce((acc,x)=>{
          const val = x.feature.properties[key]
          if (acc.indexOf(val) === -1 ) acc.push(val)
          return acc
        },[])

        items = items.filter(x=>x!==null)
        items = items.sort()
        console.log('items',items)

        //const s1 = ['#c51b7d','#fee08b','#3288bd']
        let scale = ['#ff236c','#2377ff','#f4f141','#42f4b9','#f46441']
        if (items.length > scale.length) {
          scale = chroma.scale(scale).mode('lch').colors(items.length)
        }

        const colorObj = {'null':'#999'}

        legend.items = items.reduce((acc,x,index)=>{
          acc[x] = scale[index]
          //acc[x] = f(index/(items.length-1))
          return acc
        },colorObj)
        legend.type = String

      } else if (att[key].type === 'Boolean') {
        legend.items = { true : 'red', false: 'blue' }
        legend.type = Boolean
      }

      console.log('legend',legend, key)
      this.log()
      return legend
    })
    console.log('legends',legends)
    this.log()
    return ( legends[0] && legends[0].items ) ? legends : null
  }


},
methods: {

  resetDisplayKey () {
    this.log('resetDisplayKey')
    const keys = this.featuresAttrs.reduce((acc,x,i)=>{
      acc[i] = Object.keys(x)[0]
      return acc
    },{})

    this.displayKey = keys
    console.log('reset display keys', keys[0])
    return this.displayKey
  },
  geoJsonPointOptions (layerIndex) {
    var self = this;
    if (!self.legends) return null
    return {
      pointToLayer: function (feature, latlng) {
        const legend  = self.legends ?  self.legends[layerIndex] : null
        return L.circleMarker( latlng, self.getPointStyle(feature, self.displayKey[layerIndex] , legend) )
      },

      onEachFeature: (feature, layer) => {
        const p = feature.properties
        layer.bindPopup('<p>'+p.type+'</p><p>'+p.students+'</p>');
        layer.on({
          click : function(e) {
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
  getGeoJsonOptions (index) {
    if (this.featuresCollection === 'areas') this.geoJsonAreaOptions
    if (!this.featuresOpts || !this.featuresOpts[index]) return {}
    const type = this.featuresOpts[index].type
    if (type === 'Point') {
      return this.geoJsonPointOptions(index)
    } else if (type === 'MultiPolygon'){
      return this.geoJsonAreaOptions
    }
  },
  getPointStyle(feature,key,legend){
    //if (!this.legends) return null
    //console.log(feature)
    const style = {
      radius: 4,
      fillColor: 'blue',
      weight: 0,
      opacity: 1,
      fillOpacity: 0.5
    }
    const val = feature.properties[key]
    if (!this.showLegend || !legend) return style

    if (this.showLegend && legend.type === Number) {
      style.color = legend.chroma( (val - legend.items.min)/legend.items.constant )
    } else if (this.showLegend) {
      style.color = legend.items[val]
    }
    //console.log(key, color,val)
    return style

  },
  getAreaStyle(id){
    if (this.$store.state.neighbourhood === id) {
      return {
        weight: 2,
        color: 'black',
        opacity: 0.6,
        fillColor: '#fff',
        fillOpacity: 0,
      }
    } else {
      return {
        opacity: 0,
        fillOpacity: 0
      }
    }
  },
  updateMap(){
    //  this.displayKey = Object.assign({},this.displayKey)
    //  this.$forceUpdate()
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
  log(text) {
    //console.log(this.$refs.myMap.mapObject)
    //this.$forceUpdate()
    const layers = this.$store.state._col_layers.reduce((acc,x)=>{
      if (acc.indexOf(x._id) ===-1) acc.push(x._id)
      return acc
    },[])

    console.log(text, 'layers: ' + layers.length, this.$store.state._col_layers_selected)

  }
},
watch : {
  featuresAttrs () {
    //this.resetDisplayKey()
  }
},
mounted(){
  if (window.screen.width < 800) this.updateBaseMap('basic',true);
  //this.getSurveyNames();
  this.editFeature = surveyQuestionsJson.reduce((acc,x)=>{
    acc[x.name] = '';
    return acc;
  },{});
  this.editFeatureDefaults = Object.assign({},this.editFeature);
  this.resetDisplayKey()
  //console.log('map',this.$refs.myMap.mapObject)

  const self = this
  setTimeout(function(){
    console.log('mounting map')
    self.log()
    //console.log('updated')
    if (self.$refs.myMap) self.$refs.myMap.mapObject.invalidateSize();
  }, 1000);

  this.$store.watch(
    (state, getters) => state._col_layers_selected,
    (newValue, oldValue) => {
      this.resetDisplayKey()
      //this.$store.commit('UPDATE',{key:['navigator','center'],value:this.$store.state.navigator.defaultCenter})
    }
  )

}

};
</script>

<style>
@import "../../node_modules/leaflet/dist/leaflet.css";
.main-map {
  z-index:0;
  background-color:#eee;
  height:400px;
}

.map-menu {
  width:300px;
  z-index:1;
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
#map-legend {
  position: absolute;
  top:0px;
  left:20px;
  width:200px;
}

#map_features .leaflet-control-container .leaflet-left {
  right:23px;
  top: 40px;
  left:auto;
}
#map_features.leaflet-touch .leaflet-bar a {
  color:#000 !important;
}


</style>
