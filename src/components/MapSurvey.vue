<template>
  <div>
    <v-layout
    row
    align-center
    justify-center
    >
    <v-dialog v-model="editDialog" persistent max-width="500">
      <v-card>
        <v-card-title>
          <svg width="80vh" height="200" v-html="editFeaturePath"/>
        </v-card-title>

        <v-card-text>
          <template v-for="item in surveyQuestions">
            <v-text-field v-if="item.type=='text'" :name="item.name" :data-vv-name="item.name" :label="item.label" :v-validate="'required|numeric'" v-model="editFeature[item.name]" :error-messages="errors.collect(item.name)"/>
            <v-textarea v-else-if="item.type=='textarea'" :name="item.name" :data-vv-name="item.name" :label="item.label" :v-validate="item.validation" v-model="editFeature[item.name]" :error-messages="errors.collect(item.name)"/>
            <v-radio-group v-else-if="item.type=='radio'" :name="item.name" :data-vv-name="item.name" :label="item.label" v-model="editFeature[item.name]" :error-messages="errors.collect(item.name)">
              <v-radio
              v-for="n in item.options"
              :label="n.label"
              :value="n.value"
              ></v-radio>
            </v-radio-group>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeEditor">Cancel</v-btn>
          <v-btn color="primary" @click="saveEditor">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>


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
  :options="areasGeoJsonOptions"
  :geojson="item.feature"
  v-bind:options-style="getAreaStyle(item.feature.properties.id)"
  >
</l-geo-json>

</l-map>

<div id="map-menu">
  <v-menu v-bind:close-on-content-click="false" min-width="300px" flat>
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

  <v-subheader>Survey Data</v-subheader>
  <v-list-tile class="mb-3">
    <v-select
    v-if="surveyNames"
    v-model="selectedSurvey"
    :items="surveyNames"
    menu-props="auto"
    label="Select a survey"
    hide-details
    prepend-icon="map"
    single-line
    @input="getSurveyData($event)"
    ></v-select>
    <v-btn v-else @click="getSurveyNames">Load surveys</v-btn>
  </v-list-tile>

  <template v-if="survey">
    <v-divider></v-divider>
    <v-subheader>Survey key</v-subheader>
    <v-list-tile
    v-for="(item, i) in surveyKeyArray"
    >
    <v-list-tile-action>
      <v-icon :color="item.color">label</v-icon>
    </v-list-tile-action>
    <v-list-tile-content>
      {{item.text}}
    </v-list-tile-content>
  </v-list-tile>
  <v-list-tile>
    <v-select
    v-model="language"
    :items="languages"
    menu-props="auto"
    label="Select language"
    single-line
    ></v-select>
  </v-list-tile>
</template>
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
      areasGeoJsonOptions:{
        onEachFeature: (feature, layer) => {
          var self = this;
          layer.on({
            click : function(e) {
              self.selectArea(e)
            }
          });
        }
      },
      layers :{
        areas : true
      },
      areaStyle : {
        2111 : {
          weight: 2,
          color: '#fff',
          opacity: 0.9,
          fillColor: '#fff',
          fillOpacity: 0.5,
        }
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
        x[this.$store.state.map.indicator]
      ).sort((a,b)=> a-b);
      return {
        min : sorted[0],
        max :sorted[sorted.length-1] - sorted[0]
      }
    }
  },
  methods: {
    getAreaStyle(id){
      const f = chroma.scale(['yellow', 'red']);
      const area = this.$store.getters.dataByYear.filter(x=>x.area_code === id)[0]
      if (!area) return {
        opacity: 0,
        fillOpacity: 0
      }
      const val = area[this.$store.state.map.indicator]
      const hex = f( (val - this.scale.min)/this.scale.max )
      console.log(id, this.scale,val,hex, (val - this.scale.min)/this.scale.max )
      return {
        weight: 1,
        color: '#fff',
        opacity: 0.9,
        fillColor: hex,
        fillOpacity: 0.6,
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
    selectArea(e) {
      //console.log('selected',e.target.feature.properties.id);
      this.$store.commit('UPDATE',{key:'neighbourhood',value:e.target.feature.properties.id});
      this.$store.commit('UPDATE',{key:['map','zoom'],value:15});
      //console.log('changed',this.$store.state.neighbourhood);
      this.$store.commit('UPDATE',{
        key:['map','center'],
        value: {
          lon:e.target.feature.properties.Centroids_x,
          lat:e.target.feature.properties.Centroids_y
        }
      })
      //console.log(this.center)
    },
    openEditor(e) {
      //console.log(e.target.feature.properties);
      //console.log(Object.keys(e.target.feature.properties.survey).length,Object.keys(this.editFeature).length);
      this.surveyData.forEach((x,y) => {if (x._id == e.target.feature.properties.Id) this.editIndex = y});
      Object.assign(this.editFeature, this.surveyData[this.editIndex].feature.properties.survey);
      this.editDialog = true;
      let svgPath = e.target._path.outerHTML;
      const transformScale = 1/this.currentZoom*1/this.currentZoom*1/this.currentZoom*1/this.currentZoom*200000;
      svgPath = svgPath.replace('>','transform="translate() scale('+transformScale+')">');
      let pathStartCoords = svgPath.match(/d="M[\d\s-]*/)[0].slice(4).split(' ').map(x=>parseInt(x));
      //this.editFeatureViewBox = [0,0,pathStartCoords[0]*1.5,pathStartCoords[1]*1.5].join(' ');
      pathStartCoords[0] = -(pathStartCoords[0]*transformScale)+200;
      pathStartCoords[1] = -(pathStartCoords[1]*transformScale)+50;
      svgPath = svgPath.replace('translate()','translate('+pathStartCoords[0]+' '+pathStartCoords[1]+')')
      svgPath = svgPath.replace(/stroke-width="\d"/, 'stroke-width="0.2"');
      this.editFeaturePath = svgPath;
      //console.log(svgPath);
      //console.log(pathStartCoords);
      //console.log(e.target.feature);
      this.editMapFeature = e.target.feature;
      this.editMapCenter = this.getCoordsPoint(e.target.feature)
      //console.log(this.getCoordsPoint(e.target.feature))
    },
    closeEditor(){
      this.editDialog = false;
      console.log(this.editFeatureDefaults);
      Object.assign(this.editFeature, this.editFeatureDefaults);
      this.styleSurveyData();
      this.$validator.reset()
      //console.log(this.surveyDataStyled);
    },
    saveEditor(){
      this.$validator.validateAll().then((result) => {
        if(!result){
          alert('error');
          return;
        }
        alert('success');
      }).catch(() => {
      });

      let item = this.surveyData[this.editIndex];
      const editInfo = {
        lastEdited : {
          time: new Date(),
          user: this.$auth.getUser().email
        }
      }

      Object.assign(item.feature.properties.survey, editInfo, this.editFeature);
      //console.log('/building/'+item._id, item.feature.properties);
      API.update('buildings',{id:item._id}, item);
      this.closeEditor();

    },
    styleSurveyData () {
      const questions = Object.keys(this.editFeature).length;
      this.surveyData.forEach(x=>{
        const vals = Object.values(x.feature.properties.survey).filter(x => x!= undefined && x!= null);
        let fillColor = this.surveyKey.notStarted.color;
        if (vals.length > questions) {
          fillColor = this.surveyKey.complete.color;
        } else if (x.feature.properties.survey.lastEdited) {
          fillColor = this.surveyKey.inProgress.color;
        }

        x.feature.properties.style = {
          weight: 2,
          color: fillColor,
          opacity: 0.9,
          fillColor: fillColor,
          fillOpacity: 0.5,
        };
      });
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
    this.getSurveyNames();
    this.editFeature = surveyQuestionsJson.reduce((acc,x)=>{
      acc[x.name] = '';
      return acc;
    },{});
    this.editFeatureDefaults = Object.assign({},this.editFeature);

    this.$store.watch(
      (state, getters) => state.neighbourhood,
      (newValue, oldValue) => {
        // Do whatever makes sense now
        if (newValue === 9999) {
          this.$store.commit('UPDATE',{key:['map','zoom'],value:12})
          this.$store.commit('UPDATE',{key:['map','center'],value:this.$store.state.map.defaultCenter})
        }
      }
    )

    this.$store.watch(
      (state, getters) => state.map.indicator,
      (newValue, oldValue) => {
        // Do whatever makes sense now
        if (newValue === 9999) {
          this.$store.commit('UPDATE',{key:['map','zoom'],value:12})
          this.$store.commit('UPDATE',{key:['map','center'],value:this.$store.state.map.defaultCenter})
        }
      }
    )
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

.highlighted {
  background-color:#e8e8e8;
}

.v-label {
  font-size: 13px;
}

</style>
