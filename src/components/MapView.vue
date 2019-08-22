<template>
  <div ref="container" class="main-map" v-bind:style="mapStyle">
    <l-map
    v-if="layersSet"
    ref="map"
    :zoom="$store.state.map.zoom"
    :center="$store.state.map.center"
    :options="mapOptions"
    @update:center="centerUpdate"
    @update:zoom="zoomUpdate"
    :id="'map_'+featuresCollection"
    v-bind:style="{height:mapHeight}"
    >

    <!--   <l-protobuf v-if="baseMap==='detailed'" url="https://maps.tilehosting.com/data/v3/{z}/{x}/{y}.pbf?key=ArAI1SXQTYA6P3mWFnDs" :options="protobufOpts"></l-protobuf>-->
    <!--  <l-tile-layer v-if="baseMap==='basic'" url="https://cartodb-basemaps-b.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png" :options="protobufOpts"></l-tile-layer>

    <l-geo-json
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
  v-else-if="layersSet" v-for="(val,key) in layers"
  v-if="layers[key].on && layers[key].features"
  :key="key"
  :geojson="layers[key].features"
  :options="getGeoJsonOptions(key)"
  :options-style="geoJsonStyle(key)"
  />

<div class="map-menu">
  <v-menu
    min-width="300px"
    :close-on-content-click="false"
    flat>
    <v-spacer></v-spacer>
    <template v-slot:activator="{ on }">
      <v-btn icon v-on="on">
        <v-icon>more_vert</v-icon>
      </v-btn>
    </template>

    <v-list dense class="pb-4">
        <v-subheader>Base Map</v-subheader>
        <v-list-tile v-for="(map,i) in baseMaps">
          <v-switch
          color="primary"
          :key="i"
          :label="map.text"
          v-model="map.selected"
          @click.native="updateBaseMap(map.type, map.selected)">
        </v-switch>
      </v-list-tile>
      <v-divider></v-divider>
      <v-subheader>Legend</v-subheader>
      <v-list-tile>
          <v-switch
        color="primary"
        label="Legend"
        v-model="showLegend">
      </v-switch>
      </v-list-tile>
      <template v-if="surveyorAuth">
      <v-divider></v-divider>
      <v-subheader>Surveys</v-subheader>
      <v-list-tile>
      <v-switch
      color="primary"
      label="Survey Mode"
      v-model="editable"
      >
      </v-switch>
      </v-list-tile>
      <v-list-tile v-if="editable">
        <layer-select collection="surveyLayers" label="Select Survey" icon="add" v-bind:unselected="true" @change="loadSurveyLayer"></layer-select>
      </v-list-tile>
    </template>

    </v-list>
  </v-menu>

</div>




</l-map>

<!-- TIMELINE -->
<div v-for="(layer,id) in layers" class="map-info-panel ejmap-border-left ejmap-border-right" v-if="id==='5d2f0b46fe977fdb42180cd2'&&layer.on&&layer.features">
  <timeline
  title="Plan Submissions"
  :features="layer.features"
  figure="timeline"
  dateKey="date"
  :attribute="layer.attribute"
  labelKey="plan_no"
  :attributeStyle="layer.attributes[layer.attribute]"
  >
</timeline>
</div>

<!-- LOADING -->
<div v-show="loading" v-bind:style="{position:'absolute',top:'180px',zIndex:10,width:legendBottom?'100%':'70%'}">
  <div class="text-xs-center">
    <v-progress-circular indeterminate></v-progress-circular>
    <div class="mt-5">Loading data...</div>
  </div>
</div>


<!-- LEGEND-->
<div id="map-legend" v-if="showLegend" v-bind:style="legendStyle">
  <div class="text-xs-center">
    <v-icon v-if="legendBottom" color="grey lighten-2">remove</v-icon>
    <area-select
    v-if="options&&options.areaSelect"
    titleclass="pb-0 pt-3 px-3 font-weight-medium"
    class="ejmap-border-bottom px-3 py-1"
    style="flex: 0;">
   </area-select>
   <v-select v-if="allLayers&&legendBottom"
     v-bind:items="Object.values(layers)"
     item-text="text_en"
     item-value="_id"
     class="ejmap-border-bottom px-3 pt-2"
     v-model="layerPanelsSelected"
     multiple
     flat
     >
   </v-select>
</div>

<div v-bind:style="{flex:2, maxHeight:'85vh', overflowY: allLayers ? 'none' : 'auto'}">
  <v-expansion-panel expand v-model="layerPanels">
    <v-expansion-panel-content v-for="(layer,key,index) in layers" v-show="layer.showLegend" :key="key">
      <template v-slot:header v-if="allLayers&&!legendBottom">
        <div @click="">
            {{layer.text_en}}
        </div>
      </template>
      <v-card class="pt-2">
        <v-card-text class="pa-0">
          <div class="pt-1 px-3 grey--text text-uppercase">Filter</div>

          <v-list>
            <v-list-tile
            v-if="layer.on&&layer.features"
            v-for="(v,i,index) in layer.filters"
            :key="index"
            @click="updateLayer(layer._id,{key:'attribute',value:v.attribute})">

                <template v-if="index!==0">
                  <v-select :items="['AND','OR']" value="AND" class="caption" style="flex:3"></v-select>
                  <v-btn icon @click="removeFilter(layer,i)" style="margin:0px -10px -10px 10px"><v-icon small>close</v-icon></v-btn>
                </template>


            <v-list-tile-content>
                <map-legend
                :key="index"
                :layer="layer"
                :attributes="layer.attributes"
                :attributeName="layer.filters[i].attribute"
                @filterChange="function(e){updateLayer(layer._id, e, `filters.${i}`);updateLayer(layer._id, e)}"
                @layerChange="function(e){updateLayer(layer._id, e)}"
                @toggleFeature="function(e){filterFeatures(key,e)}"
                class="ejmap-border-bottom"
                style="width:100%;"
                ></map-legend>

            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <div class="text-xs-right" style="width:100%;">
          <v-btn depressed color="rgba(0,0,0,0)" @click="addFilter(layer)" class="caption grey--text">Add filter<v-icon small>add</v-icon></v-btn>
        </div>
        <div class="px-3 grey--text text-uppercase">Opacity</div>
        <div class="px-3 caption grey--text text--darken-2" style="display:flex;flex-wrap:wrap;">
        <div style="flex:1;" class="caption mt-2">Fill</div>
        <v-slider
        class="px-2 mt-0"
        v-model="layer.fillOpacity"
        min="0"
        max="100"
        track-color="rgba(0,0,0,0)"
        ></v-slider>
        <div style="flex-basis:100%"></div>
        <div style="flex:1" class="caption mt-2">Stoke</div>
        <v-slider
        class="px-2 mt-0"
        v-model="layer.strokeOpacity"
        min="0"
        max="100"
        track-color="rgba(0,0,0,0)"
        ></v-slider>
        </div>

      </v-card-text>
    </v-card>
  </v-expansion-panel-content>
</v-expansion-panel>
</div>
<!--
<v-card v-else class="pt-0">
<v-card-text class="pt-0">
<template v-for="(layer,key) in layers" v-if="layer.on&&layer.features">
<template v-for="(v,i,index) in layer.filters">
<v-btn v-if="index!==0" icon @click="removeFilter(layer,i)" style="float:right" class="mr-0 pr-0"><v-icon small>close</v-icon></v-btn>
<map-legend
:key="index"
:layer="layer"
:attributes="layer.attributes"
:attributeName="layer.filters[i].attribute"
@input="function(e){updateLayer(layer._id, e, `filters.${i}`)}"
@rangeChange="updateRange"
@toggleFeature="function(e){filterFeatures(key,e)}"
></map-legend>

</template>
<v-btn depressed color="white" @click="addFilter(layer)" style="float:right" class="caption grey--text mr-0">Add filter<v-icon small>add</v-icon></v-btn>
</template>
</v-card-text>
</v-card>
-->
</div>

<v-dialog v-if="dialog&&editable" v-model="dialog" max-width="700px">
  <l-map
  v-if="layersSet"
  :zoom="18"
  :center="$store.state.map.center"
  :options="mapOptions"
  id="preview_map"
  v-bind:style="{height:'150px'}"
  >
<l-geo-json
v-else-if="layersSet" v-for="(val,key) in layers"
v-if="layers[key].on && layers[key].features"
:key="key"
:geojson="layers[key].features"
:options="getGeoJsonOptions(key)"
:options-style="geoJsonStyle(key)"
/>
  </l-map>
  <v-tabs>
    <v-tab v-for="(item,index) in editItems" :key="index">
      Record {{index + 1}}
    </v-tab>
    <v-tab>
      New Record
    </v-tab>
    <v-tab-item v-for="(item,index) in editItems" :key="index">
      <editor
      collection="surveyRecords"
      filter="surveyLayers"
      nestedPath="properties"
      :linkedFeature="$store.state._col_features_selected"
      :editItem="item"
      :permanent="true"
      @close="close()"
      @update="function(){
        updateCollection('surveyRecords',$store.state._col_surveyLayers_selected)
        .then(()=>update())
        }">
    </editor>
  </v-tab-item>
  <v-tab-item>
    <editor
    collection="surveyRecords"
    filter="surveyLayers"
    nestedPath="properties"
    :linkedFeature="$store.state._col_features_selected"
    :attributes="attributes"
    :permanent="true"
    @close="close()"
    @update="function(){
      updateCollection('surveyRecords',$store.state._col_surveyLayers_selected)
      .then(()=>update())
      }">
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
import MapLegend from './MapLegend.vue'
import AreaSelect from './AreaSelect.vue'
import Editor from './Editor.vue'
import Timeline from './Timeline.vue'
import LayerSelect from './LayerSelect.vue'


//const Vue2LeafletVectorGridProtobuf = require('../../public/Vue2LeafletVectorGridProtobuf.vue');
//var vectorTileStyling = require('../../public/mapStyle.js');
//const vectorTileStyling = require('../../public/mapStyle.js');
import axios from 'axios'
import L from 'leaflet'
const arrayUtils = require('@/plugins/arrayUtils')
const dbconfig = require('@/db.config')
const translate = require('@/plugins/translate')

export default {
  name: 'MapView',
  props: ['featureLayers','featuresCollection','zoomLevel','options','areas','height','allLayers','legendBottom','editable'],
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
    Editor : Editor,
    Timeline : Timeline,
    LayerSelect : LayerSelect
  },
  $_veeValidate: {
    validator: 'new'
  },
  data () {
    return {
      layersSet : false,
      dialog : false,
      itemTemplate : {},
      layerPanels : [],
      layerPanelsSelected:[],
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
  hidden:[],
  filtered: false,
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
};

},
computed: {
  surveyorAuth() {
    return arrayUtils.getNested('state.activeUser.groups.Surveyor',this.$store)
  },
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
        padding: this.legendBottom ? '0 0 40px 0' : '0',
        height: this.legendBottom ? '200px' : 'auto',
        maxHeight: this.legendBottom ? '200px':'none',
        maxWidth: this.legendBottom ? '100%' : '300px',
        width: this.legendBottom ? '100%' : 'auto',
        overflowY:this.legendBottom ? 'visible':'auto',
        overflowX: 'visible!important'
      }, style || {})
    },
    infoStyle() {
      return this.legendStyle.left === 0 ? {right : 0 } :  {left:0}
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
        display: this.legendBottom ? 'block' : 'flex',
        height:  this.legendBottom ? '90%' : '100%'
      }, style || {} )
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
    areasGeoJson () {
      // remove features without area code
      let data = this.$store.getters.selectedAreas
      if (!data) return null
      return this.embedIds(data)
    },
    editItems () {
      return this.$store.getters.surveyRecordsByFeature[this.$store.state._col_features_selected]
    }
  },
  methods: {
    addFilter(layer) {
      let max = Object.keys(layer.filters).slice(-1)[0]
      max = (parseInt(max) + 1)
      const attributeKeys = Object.keys(layer.attributes)
      this.$set(layer.filters, max.toString(), {attribute:attributeKeys[max]})
    },
    removeFilter(layer,index) {
      this.$delete(layer.filters,index.toString())
    },
    toggleLayer(key) {

    },
    filterFeatures(layerId) {
      console.log('filterFeatures')
      function notAttributeValue(f,att, categories){
        const val = f.feature.properties[att]
        return categories[val] !== false
      }
      function inRange(f,att, min,max){
        const v = f.feature.properties[att]
        return v >= min && v <= max
      }

      const layer = this.layers[layerId]
      const features = this.$store.state['_col_'+this.featuresCollection][layerId]

      const filtered = Object.keys(layer.filters).reduce((acc,key)=>{
        const filter = layer.filters[key]
        if (filter.range) {
          acc = acc.filter(x=>inRange(x,filter.attribute, filter.range[0], filter.range[1]))
        } else if (filter.categories ) {
          acc = acc.filter(x=>notAttributeValue(x,filter.attribute,filter.categories))
        }
        return acc
      },features)

      layer.features = filtered.map(x=>x.feature)
      this.update()

      //console.log('feature filter',selected.length,this.hidden,layer.attribute)
      //this.$set(layers[layerId],'features',selected.map())
      //this.update()

    },
    openMavatPlan(mavat_code) {
      let w = window.open()
      w.document.write(`<html><body>
        <form action="http://mavat.moin.gov.il/MavatPS/Forms/SV4.aspx?tid=4" method="post" name="redirect_form">
        <input type="hidden" name="PL_ID" value="${mavat_code}">
        <v-btn type="submit">Go to mavat website<v-btn>
        </form></body></html>`)
      },
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
      getGeoJsonOptions (key) {
        //console.log('getgeojsonopts',key,this.layers[key])
        if (this.featuresCollection === 'areas') return this.geoJsonAreaOptions
        const type = this.layers[key].data_type
        let opts = {
          onEachFeature: this.featureInteract
        }
        if (type === 'Point') {
          const self = this;
          opts.pointToLayer = (feature, latlng) => {
            return L.circleMarker( latlng, self.getLegendStyle(feature, key) )
          }
        }
        return opts
      },
      featureInteract(feature, layer) {
          const self = this;
          const p = feature.properties
          let html = Object.keys(feature.properties).reduce((acc,key)=>
          acc + '<tr><td><b>' + key + '<b><td><td>' + p[key] + '</td><tr>','<table>')
          + '</table>'

          if (p.mavat_code) {
            //html = html + '<br><a onclick="openMavatPlan(\''+feature.properties.mavat_code+'\')">open_in_new</a>'
            html = html + '<br><a onclick=" let w = window.open();' +
            'w.document.write(\'<html><body>'+
            '<form action=&quot;http://mavat.moin.gov.il/MavatPS/Forms/SV4.aspx?tid=4&quot; method=&quot;post&quot; name=&quot;redirect_form&quot;>'+
            '<input type=&quot;hidden&quot; name=&quot;PL_ID&quot; value=&quot;'+p.mavat_code+'&quot;>'+
            '<button type=&quot;submit&quot;>Go to mavat website</button>'+
            '</form></body></html>\')'+
            '">Go to mavat</a>'
          }

          layer.bindPopup(html);
          layer.on({
            click : function(e) {
              const p = e.target.feature.properties
              self.openEditor(p._id)
              self.$store.commit("UPDATE",{key:'_col_features_selected',value:p._id})
              self.$store.commit('UPDATE',{
                key:['map','center'],
                value: {
                  lng:(e.target._bounds._northEast.lng + e.target._bounds._southWest.lng)/2,  //e.latlng.lng
                  lat:(e.target._bounds._northEast.lat + e.target._bounds._southWest.lat)/2
                }
              })
              console.log(e)
              self.$nextTick(()=>self.$forceUpdate())
            },
          });
      },
      geoJsonStyle(layerId) {
        const style = {}
        var self = this;
        return (feature) => {
          return self.getLegendStyle(feature, layerId, style)
        }
      },
      getLegendStyle(feature,layerId,style){
        //if (!this.legends) return null
        //console.log(feature.properties._id===this.$store.state._col_features_selected,feature.properties._id,this.$store.state._col_features_selected)
        const layer = this.layers[layerId]
        const attributeKey = layer.attribute
        const attribute = layer.attributes[attributeKey]
        const val = feature.properties[attributeKey]

        style = Object.assign({
          radius: 4,
          fillColor: this.$store.state.colors[2],
          color:this.$store.state.colors[2],
          weight: 1.5,
          stroke:true,
          opacity: layer.strokeOpacity/100,
          fillOpacity: layer.fillOpacity/100,
        }, style )

        let colorKey = 'fillColor'

        if (feature.geometry.type.indexOf('LineString')>-1) {
          style.stroke = true
          colorKey = 'color'
        }

        if (this.editable && this.$store.getters.surveyRecordsByFeature[feature.properties._id]){
          style.fillColor = style.color = 'green'
        }

        if (feature.properties._id === this.$store.state._col_features_selected) {
          style.color = 'red'
          style.weight = 3
        }

        if (!attribute) return style

        if (attribute.categories) {
          style[colorKey] = attribute.categories[val].color
        } else if (attribute.range) {
          style[colorKey] = this.$store.state.colorScale( 1 - ((val - layer.colorRange[0])/layer.colorConstant)  ).hex()
        } else {
          style.fillOpacity = 0
          style.opacity = 0
        }

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
    updateBaseMap(map,on) {
      //console.log(map,on);
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
          //console.log(layerPanel);
          layerPanel.overflow = 'auto';
        }, 500);
      }
    },
    update () {
      //console.log('updating map...')
      this.$nextTick(()=>this.$forceUpdate())
      const map = this.$children[0] ? this.$children[0].mapObject : null
      if (map) {
        //console.log('updating map...',map)
        setTimeout(()=>map.invalidateSize(),500)
      }
    },
    layerOn(key,e) {
      console.log('turning on layer: ' + key, e)
      key = typeof key === 'number' ? Object.keys(this.layers)[key] : key
      if (this.layers[key]) {
        this.$set(this.layers[key], 'on', e)
        this.$set(this.layers[key], 'showLegend',  this.allLayers || e)
      }
      const index = Object.keys(this.layers).indexOf(key)
      this.$set(this.layerPanels, index, e);
      //Object.assign(this.layers[key],{on:e})
    },
    updateLayer(layerId,e,path) {
      console.log('updating Layer')
      const layer = this.layers[layerId]
      const base = path ? arrayUtils.getNested(path,layer) : layer;
      //console.log('updateLayer', path, base)
      if (typeof e.value === 'object') {
        //console.log('updating layer object',e.value)
        if (!base[e.key]) this.$set(base, e.key, {})
        for (var k in e.value) {
          this.$set(base[e.key],k,e.value[k])
        }
      }
      else base[e.key]=e.value

      if (e.key === 'range') {
        this.$set(layer,'colorRange',e.value)
        this.$set(layer,'colorConstant',e.value[1]-e.value[0])
      }
      this.filterFeatures(layerId)
    },
    updateRange(e) {
      const attr = this.layers[e.layer].attribute
      const rangeObj = this.layers[e.layer].attributes[attr]
      this.$set(rangeObj,'range',{max:e.range[1],min:e.range[0], constant:e.range[1]-e.range[0]})
      this.$forceUpdate()
    },
    addRanges(layerId,features) {
      //console.log('range',layerId)
      const layer = this.layers[layerId]
      if (!features) return null

      Object.keys(layer.attributes).forEach(key=>{
        if(layer.attributes[key].type === 'Number') {

          const range = arrayUtils.sortNumbers(features,'feature.properties.'+key)
          range.defaultMin = range.min
          range.defaultMax = range.max
          //console.log(key+' range',range)
          this.$set(layer.attributes[key],'range', range)
          if (key===layer.attribute) {
            layer.colorRange = [range.min,range.max]
            layer.colorConstant = range.max - range.min
          }
        }
      })
    },
    updateCollection(collection, layerId) {
      return this.$store.dispatch('UPDATE_COLLECTION', {name: collection, layer:layerId} )
    },
    checkForUpdate() {
      if (!this.layers) return null
      console.log('checking for update')
      const featurecol = this.$store.state['_col_'+this.featuresCollection]
      let promises = Object.keys(this.layers).reduce((arr,key)=>{
        const layer = this.layers[key]
        if (!layer.on) return arr
        arr.push(new Promise((res,rej)=> {
          const returnObj = {}
          const filtered = layer.filtered
          let featuresNo = featurecol[key] ? featurecol[key].length : 0;
          if (!this.loading && (featuresNo === 0 || filtered ) ) {
            this.loading = true
            this.updateCollection(this.featuresCollection, key)
            .then((x,err)=>{
              if (err) console.log('update error', err)
              //console.log('dispatch return', x)
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
        arr.forEach(x=>{
          const key = Object.keys(x)[0]
          this.addRanges(key,x[key])
          this.filterFeatures(key)
          //this.$set(this.layers[key],'features',features)
        })
        this.update()
      })
    },

    setLayers() {
      const styles = this.$store.getters.styles
      const schema = dbconfig[this.featuresCollection]
      const allLayers = this.allLayers

      let layers = this.$store.state['_col_'+schema.layerCollection]

      console.log('running set layers. total layers: ' + layers.length )

      layers.forEach((x,index)=>{

        const layer = Object.assign({
          features:'',
          legend:'',
          fillOpacity:60,
          strokeOpacity:80,
          filters: {'0': {} },
          colorRange:null,
          colorConstant:null,
        },x)
        const categoryStyle = styles[layer._id]
        const status = this.featureLayersArray.indexOf(layer._id) > -1 ? true : false
        this.layerPanels.push(status)
        if (status) this.layerPanelsSelected.push(layer._id)
        layer.on = this.layerPanels[index]
        layer.showLegend = this.allLayers || this.layerPanels[index]
        //if (!layer.on) return
        //console.log('layerid',x._id,layer._id)
        layer.attributes = this.$store.state['_col_layerAttributes'].reduce((acc,att)=>{
          if (att.legend&&att.layer===layer._id) acc[att.name] = att
          if (acc[att.name] && categoryStyle) acc[att.name].categories = categoryStyle[att.name]
          return acc
        },{})
        layer.attribute = Object.keys(layer.attributes)[0]
        layer.filters['0'].attribute = layer.attribute

        this.$set(this.layers, layer._id, layer)

        /*const hiddenKeys = layer.attributes.reduce((acc,key)=>{
        if (styles[layer._id][key].values) {
        Object.keys(styles[layer._id][key].values).forEach((valKey,index)=>{
        acc[styles[layer._id][key]._id +index] = false//this.$store.commit('UPDATE',{key:['legendStyles',styles[layer._id][key]._id +index], value:false })
      })
    }]
    return acc
  },{})*/
  //this.$store.commit('UPDATE',{key:'legendStyles', value:hiddenKeys })

})

/*Object.keys(this.layers).forEach(key=>{
if (this.layers[key].on) this.$set(this.layers[key],'attribute',Object.keys(this.layers[key].attributes)[0])
})*/
this.layersSet = true
//console.log('set layers',this.layers)
},
openEditor (featureId) {
  console.log('editor',featureId)
  if (!this.editable) return null
  //if (this.featuresCollection !== 'surveyFeatures') return null;
  this.dialog = true
},
loadSurveyLayer () {
  //console.log('loadsurveylayer',layer)
  const surveyLayer = this.$store.state._col_surveyLayers.filter(x=>x._id===this.$store.state._col_surveyLayers_selected)[0]
  Object.keys(this.layers).forEach(key=>{
    const val = surveyLayer.featureLayer.indexOf(key) > -1 ? true : false
    this.$set(this.layers[key],'on',val)
    this.filterFeatures(key)
  })
  this.update()
}

},
created() {
  this.setLayers()
},
watch: {
  featureLayers: function(newVal,oldVal) {
    if (newVal === oldVal) return null
    console.log('layeron: ' + newVal +' layerOff:' + oldVal)
    this.layerOn(oldVal,false)
    this.layerOn(newVal,true)
  },
  layerPanels: function(newVal,oldVal) {
    this.$nextTick(()=>{
      for (var x=0;x<newVal.length;x++) {
        if (newVal[x] !== oldVal[x]) {
          this.layerOn(Object.keys(this.layers)[x],newVal[x])
          break
        }
      }
      //console.log('layerPanels',newVal,oldVal)
    })
    //const layerIds = Object.keys(this.layers)
    this.checkForUpdate()
    //this.layerOn(key,true)
    //if this panelIndex matches this component's index.. do stuff since we're selected
  },
  layerPanelsSelected: function(newVal,oldVal) {
    oldVal.forEach(x=>{
      if (newVal.indexOf(x)===-1) this.layerOn(x,false)
    })
    newVal.forEach(x=>{
      if (oldVal.indexOf(x)===-1) this.layerOn(x,true)
    })
  },
  legendBottom: function(val) {
    this.$nextTick(()=>this.$refs.map.mapObject.invalidateSize())
  }
},

mounted(){
  //console.log('layers on mount',this.layers)
  this.$nextTick(() => {
    //if (window.screen.width < 800) this.updateBaseMap('basic',true);
    this.editFeatureDefaults = Object.assign({},this.editFeature)
    //this.resetDisplayKey()
    //this.checkForUpdate()
  })
  //console.log('map',this.$refs.myMap.mapObject)
  //

  this.$nextTick(()=>{
    L.mapboxGL({
      accessToken: 'not-needed',
      style: 'https://api.maptiler.com/maps/cf2300ae-87ee-48ba-8e4f-cfd93d0d461e/style.json?key=ArAI1SXQTYA6P3mWFnDs'
    }).addTo(this.$refs.map.mapObject)
  })

  this.$store.watch( (state) => state.neighbourhood, this.checkForUpdate )
  //this.$store.watch( (state) => state._col_layers_selected, this.checkForUpdate )
  //this.$store.watch( (state) => state._col_indicatorSections_selected, this.checkForUpdate )

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

.leaflet-popup-content-wrapper, .leaflet-popup-tip {
  background: rgba(0,0,0,0.8);
}

.map-info-panel {
  top:0;
  bottom:0;
  left:0;
  z-index:0;
  max-width:300px;
  width:25%;
  height:100%;
}

#map-legend .v-list__tile.v-list__tile--link {
  flex-wrap:wrap;
}

.main-map.leaflet-container {
  background:none;
}

.edit-icon {
  position:absolute;
  left:20px;
  top:20px;
  z-index:500;
}

</style>
