<template>
  <div>

    <l-map
    ref="myMap"
    :zoom="$store.state.map.zoom"
    :center="$store.state.map.center"
    :options="mapOptions"
    @update:center="centerUpdate"
    @update:zoom="zoomUpdate"
    class="main-map"
    :id="'map_'+featuresCollection"
    >

    <l-protobuf v-if="baseMap=='detailed'" url="https://maps.tilehosting.com/data/v3/{z}/{x}/{y}.pbf?key=ArAI1SXQTYA6P3mWFnDs" :options="protobufOpts"></l-protobuf>
    <l-tile-layer v-if="baseMap=='basic'" url="https://cartodb-basemaps-b.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png" :options="protobufOpts"/>
    <l-geo-json
    v-if="areas"
    v-for="(item, i) in $store.state._col_areas.filter(x=>x.feature)"
    :key="item._id"
    :geojson="item.feature"
    v-bind:options-style="areaStyle"
    >
  </l-geo-json>

    <l-geo-json
    v-if="featuresWithIds[0]"
    v-for="(item, i) in featuresWithIds"
    :key="i"
    :geojson="item.feature"
    :options="geoJsonPointOptions(dataType,item)"
    >
  </l-geo-json>


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
          :key="i"
          :label="map.text"
          v-model="map.selected"
          @click.native="updateBaseMap(map.type, map.selected)"
          ></v-switch>
        </template>
      </div>

      <v-list-group
      v-for="(item, i) in items"
      v-if="item.children"
      :key="item.text"
      v-model="item.model"
      :prepend-icon="item.model ? item.icon : item['icon-alt']"
      append-icon=""
      >
      <template v-slot:activator>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ item.heading }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>

      <template v-for="(child, i) in item.children">
        <v-switch
        :key="i"
        v-model="child.selected"
        :label="child.text"
        @click="getSurveyData(child.text)"
        ></v-switch>
      </template>

    </v-list-group>

    <v-layout
    v-else-if="item.heading"
    :key="i"
    row
    align-center
    >
    <v-flex xs6>
      <v-subheader v-if="item.heading">
        {{ item.heading }}
      </v-subheader>
    </v-flex>

  </v-layout>
  <v-divider
  v-else-if="item.divider"
  :key="i"
  dark
  class="my-3"
  ></v-divider>

  <v-divider></v-divider>

</v-list>

</v-menu>
</div>

<!--<v-btn @click="log()">Log</v-btn>-->

</div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup, LTooltip, LPolygon, LGeoJson} from 'vue2-leaflet';
import Vue2LeafletVectorGridProtobuf from '@/../public/Vue2LeafletVectorGridProtobuf.vue';
//var vectorTileStyling = require('../../public/mapStyle.js');
import vectorTileStyling2 from '@/../public/mapStyle2.js';
import API from '@/api.js'
import chroma from 'chroma-js'

//const Vue2LeafletVectorGridProtobuf = require('../../public/Vue2LeafletVectorGridProtobuf.vue');
//var vectorTileStyling = require('../../public/mapStyle.js');
//const vectorTileStyling = require('../../public/mapStyle.js');
import axios from 'axios';
import surveyQuestionsJson from './../assets/building_survey.json';
import L from 'leaflet'

export default {
  name: 'MapView',
  props: ['features','featuresCollection','zoomLevel','dataType','areas'],
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
      areaStyle: {
          weight: 1,
          color: '#ccc',
          opacity: 1,
          fillOpacity: 0,
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
      areasGeoJsonOptions:{
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
      pointStyle : {
        radius: 4,
        fillColor: "blue",
        weight: 0,
        opacity: 1,
        fillOpacity: 0.5
      },
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
    featuresWithIds () {
      if (this.features.length > 0) {
        console.log('features',this.features.length)
        return this.features.map(x=>{
          x.feature.properties._id = x._id
          return x;
        })
      }
    },
    featuresAsGeojson() {
      if (!this.features) return [];
      return this.features.map(x=>x.feature)
    }
  },
  methods: {
    geoJsonPointOptions (datatype,item) {
      if (datatype !== 'Point') return this.areasGeoJsonOptions
      const self = this;
      const latlng = {
        lat:item.feature.geometry.coordinates[0],
        lng: item.feature.geometry.coordinates[1]
      }
      return {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng,self.pointStyle)
        },

        onEachFeature: (feature, layer) => {
          const p = feature.properties
          layer.bindPopup('<p>'+p.type+'</p><p>'+p.students+'</p>');
          layer.on({
            click : function(e) {
              self.$store.commit("UPDATE",{key:'selectedFeature',value:e.target.feature.properties._id})
              //console.log(e.target.feature)
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
    getPointStyle(id){
      //const f = chroma.scale(['yellow', 'red']);
      //const area = this.$store.getters.dataByYear.filter(x=>x.area_code === id)[0]
      //const val = area[this.$store.state.navigator.indicator.figure]
      //const hex = f( (val - this.scale.min)/this.scale.constant )
      //console.log(id, this.scale,val,hex, (val - this.scale.min)/this.scale.max )
      return {
        color: 'blue',
        opacity: 1,
        weight:5
      }

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
    showLongText () {
      this.showParagraph = !this.showParagraph;
    },
    innerClick () {
      console.log(true)
    },
    popup (e) {
      console.log(e)
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
    log() {
      this.$refs.myMap.mapObject.invalidateSize();
      //this.$forceUpdate()
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

    const self = this
    setTimeout(function(){
      console.log('mounting map')
      //console.log('updated')
      self.$refs.myMap.mapObject.invalidateSize();
    }, 1000);

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

</style>
