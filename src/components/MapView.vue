<template>
  <div>

    <l-map
    :zoom="$store.state.map.zoom"
    :center="$store.state.map.center"
    :options="mapOptions"
    @update:center="centerUpdate"
    @update:zoom="zoomUpdate"
    id="main-map"
    >

    <l-protobuf v-if="baseMap=='detailed'" url="https://maps.tilehosting.com/data/v3/{z}/{x}/{y}.pbf?key=ArAI1SXQTYA6P3mWFnDs" :options="protobufOpts"></l-protobuf>
    <l-tile-layer v-if="baseMap=='basic'" url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors" :options="protobufOpts"/>

      <l-geo-json
      v-if="survey"
      v-for="(item, i) in surveyData"
      :key="item._id"
      :options="geoJsonOptions"
      :options-style="item.feature.properties.style"
      :geojson="item.feature"
      >
    </l-geo-json>
    <l-geo-json
    v-if="layers.areas"
    v-for="(item, i) in $store.state.geo.areas"
    :key="item._id"
    :geojson="item.feature"
    v-bind:options-style="getAreaStyle(item.feature.properties.id)"
    >
  </l-geo-json>
  <l-geo-json
  v-if="$store.state.tab ==='education'"
  v-for="(item, i) in $store.getters.educationalGeoByHood"
  :key="item._id"
  :geojson="item.feature"
  :options="geoJsonPointOptions(item.feature, {lat:item.feature.geometry.coordinates[0],lng: item.feature.geometry.coordinates[1]})"
  >
</l-geo-json>
</l-map>

<div id="map-menu">
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
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      zoom: 14,
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
          layer.on({
            click : function(e) {
              self.openEditor(e)
            }
          });
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
        {text:'Basic',type:'basic',selected:false},
        {text:'Detailed',type:'detailed',selected:true}
      ],
      baseMap : 'detailed',
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
        maxNativeZoom: 14,
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
      const sorted = this.$store.getters.dataByYear.map( x =>
        x[this.$store.state.map.indicator.figure]
      ).sort((a,b)=> a-b);
      return {
        min : sorted[0],
        max :sorted[sorted.length-1] - sorted[0]
      }
    }
  },
  methods: {
    geoJsonPointOptions (feature, latlng) {
      const self = this;
      return {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, self.pointStyle);
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
      API.getSurveyNames()
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

  }

};
</script>

<style>
@import "../../node_modules/leaflet/dist/leaflet.css";
#main-map {
  z-index:0;
  background-color:#eee;
}

#map-menu {
  width:300px;
  z-index:1;
  position:absolute;
  top:12px;
  right:12px;
  text-align:right;
}

.v-toolbar__content, .v-toolbar__extension {
  align-items:start !important;
}
.highlighted {
  background-color:#e8e8e8;
}

.v-label {
  font-size: 13px;
}

</style>
