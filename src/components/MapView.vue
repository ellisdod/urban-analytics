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
          <svg width="80vh" height="200" v-html="editFeaturePath">
          </svg>
        </v-card-title>

        <v-card-text>
          <v-text-field label="Building Stories" v-model="editFeature.building_stories"/>
          <v-text-field label="Building Use" v-model="editFeature.building_use"/>
          <v-text-field label="Building Materials" v-model="editFeature.building_materials"/>
          <v-text-field label="Building Construction Year" v-model="editFeature.building_year"/>
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
  :zoom="zoom"
  :center="center"
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
</l-map>


<v-toolbar :extension-height="layerPanelHeight" style="width:300px;z-index:1;position:absolute;left:none;top:12px;right:12px;">
  <v-text-field
  hide-details
  prepend-icon="search"
  single-line
  ></v-text-field>

  <v-btn icon @click="toggleOptionsDialog()">
    <v-icon>more_vert</v-icon>
  </v-btn>

  <v-list dense style="background:none;" slot="extension" v-if="optionsDialog">
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
</template>
</v-list>

</v-toolbar>
</div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup, LTooltip, LPolygon, LGeoJson} from 'vue2-leaflet';
import Vue2LeafletVectorGridProtobuf from '@/../public/Vue2LeafletVectorGridProtobuf.vue';
//var vectorTileStyling = require('../../public/mapStyle.js');
import vectorTileStyling from '@/../public/mapStyle.js';
import API from '@/api.js'

//const Vue2LeafletVectorGridProtobuf = require('../../public/Vue2LeafletVectorGridProtobuf.vue');
//var vectorTileStyling = require('../../public/mapStyle.js');
//const vectorTileStyling = require('../../public/mapStyle.js');
import axios from 'axios';


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
  data () {
    return {
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
      survey : false,
      surveyData : [],
      surveyNames: false,
      surveyOpacity : 0.5,
      editFeature : {
        building_stories : null,
        building_use: null,
        building_materials : null,
        building_year : null,
      },
      editFeatureDefaults : {
        building_stories : null,
        building_use: null,
        building_materials : null,
        building_year : null,
      },
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
      vectorTileLayerStyles: vectorTileStyling,
      maxNativeZoom: 14,
      opacity: opacity
      };
    },
    tileOpts() {
      const opacity = this.survey ? this.surveyOpacity : 1;
      return {
      opacity: opacity
      };
    }
  },
  methods: {
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
        console.log(x);
        this.surveyNames = x.data
      })
    },
    getSurveyData(name) {
      console.log(name);
      API.getSurveyData(name)
      .then( x=> {
        console.log(x);
        x.data.forEach(x => {
          x.feature.properties.Id = x._id
          x.feature.properties.survey = x.feature.properties.survey || {};
        });
        this.surveyData = x.data;
        this.styleSurveyData();
        this.survey = true
        console.log(this.survey)
        //this.surveys.forEach(x=> x.selected = x.name==name ? true : false );
        this.center = this.editMapCenter =this.getCoordsPoint(x.data[0].feature)
      })
    },
    openEditor(e) {
      console.log(e.target.feature.properties);
      console.log(Object.keys(e.target.feature.properties.survey).length,Object.keys(this.editFeature).length);
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
      Object.assign(this.editFeature, this.editFeatureDefaults);
      this.styleSurveyData();
      //console.log(this.surveyDataStyled);
    },
    saveEditor(){
      let item = this.surveyData[this.editIndex];
      const editInfo = {
        lastEdited : {
          time: new Date(),
          user: this.$auth.getUser().email
        }
      }
      Object.assign(item.feature.properties.survey, editInfo, this.editFeature);
      //console.log('/building/'+item._id, item.feature.properties);
      API.updateBuilding(item._id,item);
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
    }
  },
  mounted(){
    if (window.screen.width < 800) this.updateBaseMap('basic',true);
    this.getSurveyNames();
  }
};
</script>

<style>
@import "../../node_modules/leaflet/dist/leaflet.css";
#main-map {
  z-index:0;
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
