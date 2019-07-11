<template>
  <div>
    <div style="text-xs-right">
      <div class="data-toolbar">
        <v-tooltip bottom open-delay="100">
          <template v-slot:activator="{ on }">
            <v-btn v-on="on"
            color="grey" class="mb-2" flat @click="uploadDialog=true" :icon="iconise">
            <v-icon class="">cloud_upload</v-icon>
            <span class="hidden-sm-and-down ml-2">Upload</span>
          </v-btn>
        </template>
        <span>Upload Data</span>
      </v-tooltip>
      <v-tooltip bottom open-delay="100">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on"
          color="grey" class="mb-2" flat @click="analysisDialog=true" :icon="iconise">
          <v-icon class="">assessment</v-icon>
          <span class="hidden-sm-and-down ml-2">Update Feature Analysis</span>
        </v-btn>
      </template>
      <span>Update Feature Analysis</span>
    </v-tooltip>
  </div>
</div>
<v-tabs
v-model="activeTab"
color="background"
slider-color="primary"
class="mt-2"
>

<v-tab v-for="(val,key,index) in tabs" :key="index" ripple @click="update(key)">{{val.text_en}}</v-tab>

<v-tab-item v-for="(val,key,index) in tabs" :key="index">
  <v-container fluid grid-list-xl v-if="tab===key">
    <div class="text-xs-right caption grey--text" style="margin-top:-20px;">
      <span>Layer id: {{$store.state[`_col_${val.uploadLayerCol}_selected`]}}</span>
    </div>
    <v-layout row wrap>
      <v-flex sm3 xs12>
        <editable-data-list
        :collection="val.filter.collection"
        :listKey="val.filter.listKey"
        v-bind:addbottom="true">
      </editable-data-list>
    </v-flex>
    <v-flex sm9 xs12>

      <v-layout row wrap>

        <v-flex xs12 v-if="val.map" style="height:402px" class="mb-2">
        <map-view
        :style="val.map.style || 'position:relative;height:402px;'"
        :featuresCollection="val.map.featuresCollection"
        :height="val.map.height || '400px'"
        :featureLayers="val.map.featureLayers"
        v-bind:class="val.map.classObj || {minimap:minimapOn, fullmap: !minimapOn, 'ejmap-border':true}"
        v-bind:options="val.map.options || {legendBottom:scrollLow,areaSelect:true}">
       </map-view>
       </v-flex>

        <template v-for="(item,index) in val.tables">

    <v-flex v-if="item.type==='datalist' && item.collection" :key="index" xs12>
      <div class="subheading font-weight-light ejmap-border-bottom pl-3 py-2">{{item.heading}}</div>
      <editable-data-list
      v-if="item.type==='datalist' && item.collection"
      :collection="item.collection"
      :filter="item.filter"
      v-bind:datatable="item.datatable===false ? false : true"
      :multiselect="item.multiselect"
      :nestedPath="item.nestedPath"
      :childClass="item.childClass"
      :addtop="!item.addbottom"
      :addbottom="item.addbottom"
      v-bind:areas="item.collection==='areas'"
      >
    </editable-data-list>
  </v-flex>

  <v-flex v-else-if="item.type==='json' && $store.state.selectedFeature" class="py-5" :key="index" xs12>
    <div class="py-2 subheading font-weight-light  ejmap-border-bottom">Indicators </div>
    <v-tabs slider-color="primary" color="background">
      <v-tab v-for="(indicator,index) in $store.getters.indicatorsForSelectedArea" :key="index" ripple>
        {{ indicator.year }}
      </v-tab>
      <v-tab-item v-for="(indicator,index) in $store.getters.indicatorsForSelectedArea" :key="index">
        <v-card flat>
          <vue-json-pretty
          class="pa-3 mb-2 code caption"
          :data="indicator">
        </vue-json-pretty>
      </v-card>
    </v-tab-item>
  </v-tabs>
</v-flex>
</template>

</v-layout>

</v-flex>

</v-layout>
</v-container>
</v-tab-item>

<!--

<v-tab-item key="0a">
<v-container fluid grid-list-xl v-if="tab==='features'">
<div class="text-xs-right caption grey--text" style="margin-top:-20px;">
<span>Layer id: {{$store.state[`_col_${tabs[tab].uploadLayerCol}_selected`]}}</span>
</div>
<v-layout row wrap>
<v-flex sm3 xs-12>
<editable-data-list collection="layers" listKey="data_type" v-bind:addbottom="true"></editable-data-list>
</v-flex>
<v-flex sm9 xs12>

<v-layout row wrap>

<v-flex xs12 style="height:402px" class="mb-2">

<map-view
v-if="$store.state._col_features"
contextmenu=""
style="position:relative;height:402px;"
class="ejmap-border"
featuresCollection="features"
dataType = "Point"
zoomLevel="12"
height="400px"
:featureLayers="$store.state._col_layers_selected"
v-bind:class="{minimap:scrollLow&&$vuetify.breakpoint.mdAndUp, fullmap: !scrollLow}"
v-bind:options="{legendBottom:scrollLow,areaSelect:true}"
>
</map-view>

</v-flex>

<v-flex xs12>
<div class="subheading font-weight-light ejmap-border-bottom pl-3 py-2">Layer Attributes</div>
<editable-data-list v-if="$store.state._col_layers_selected" collection="layerAttributes" filter="layers" v-bind:datatable="true" cssclass="no-background" v-bind:addtop="true"></editable-data-list>
</v-flex>
<v-flex xs12>
<div class="subheading font-weight-light ejmap-border-bottom pl-3 py-2">Layer Calculations</div>
<editable-data-list v-if="$store.state._col_layers_selected" collection="layerCalcs" filter="layers" v-bind:datatable="true" cssclass="no-background" v-bind:addtop="true"></editable-data-list>

</v-flex>

<v-flex xs12>


<div class="subheading font-weight-light ejmap-border-bottom py-2 pt-5 pl-3">Features Table</div>

<editable-data-list v-show="$store.state._col_layerAttributes_selected"
collection="features"
filter="layers"
v-bind:datatable="true"
v-bind:multiselect="true"
nestedPath="feature.properties"
cssclass="no-background"
>
</editable-data-list>


</v-flex>
</v-layout>


</v-flex>

</v-layout>
</v-container>

</v-tab-item>


<v-tab-item  key="1a">
<v-container fluid grid-list-xl v-if="tab==='areas'">
<v-layout row wrap>
<v-flex sm3>
<editable-data-list v-bind:addbottom="true" collection="areaLayers"></editable-data-list>
</v-flex>
<v-flex xs9>
<v-layout row wrap>
<v-flex xs12>
<map-view
v-if="$store.state._col_areas"
contextmenu=""
style="position:relative;height:402px;width;100%;"
v-bind:areas="true"
featuresCollection="areas"
dataType = "MultiPolygon"
zoomLevel="12"
height="400px"
>
</map-view>
</v-flex>

<v-flex sm5 xs12>
<div class="py-2 subheading font-weight-light">Attributes</div>
<v-card flat>
<editable-data-list
v-if="$store.state._col_areaLayers_selected"
collection="areaAttributes"
v-bind:datatable="true"
>
</editable-data-list>
</v-card>
</v-flex>
<v-flex sm7 xs12>
<div class="py-2 subheading font-weight-light">Areas</div>
<v-card flat>
<editable-data-list v-show="$store.state._col_layerAttributes_selected"
collection="areas"
filter="areaLayers"
v-bind:datatable="true"
v-bind:multiselect="true"
nestedPath="feature.properties"
cssclass="no-background"
>
</editable-data-list>

</v-card>
</v-flex>

</v-layout>
</v-flex>

</v-layout>
</v-container>

</v-tab-item>

<v-tab-item  key="2a">
<v-container fluid grid-list-xl v-if="tab==='indicatorAttributes'">
<v-layout row wrap>
<v-flex sm3>
<editable-data-list v-bind:addbottom="true" collection="areaLayers"></editable-data-list>
</v-flex>
<v-flex xs9>
<v-layout row wrap>
<v-flex sm7 xs12>
<map-view
v-if="$store.state._col_areas"
contextmenu=""
style="position:relative;height:402px;width;100%;"
v-bind:areas="true"
featuresCollection="areas"
dataType = "MultiPolygon"
zoomLevel="12"
height="400px"
>
</map-view>

</v-flex>
<v-flex sm5 xs12>
<div class="py-2 subheading font-weight-light">Attached Attributes</div>
<v-card>
<editable-data-list v-bind:addbottom="true" v-if="$store.state._col_areaLayers_selected" collection="indicatorAttributes" filter="areaLayers" v-bind:datatable="true"></editable-data-list>
</v-card>
</v-flex>

<v-flex xs12>
<div v-if="$store.state.selectedFeature" class="py-5">
<div class="py-2 subheading font-weight-light  ejmap-border-bottom">Indicators </div>
<v-tabs slider-color="primary" color="background">
<v-tab v-for="(indicator,index) in $store.getters.indicatorsForSelectedArea" :key="index" ripple>
{{ indicator.year }}
</v-tab>
<v-tab-item v-for="(indicator,index) in $store.getters.indicatorsForSelectedArea" :key="index">
<v-card flat>
<vue-json-pretty
class="pa-3 mb-2 code caption"
:data="indicator">
</vue-json-pretty>
</v-card>
</v-tab-item>
</v-tabs>
</div>
</v-flex>

<v-flex xs12>

</v-flex>

</v-layout>
</v-flex>

</v-layout>
</v-container>

</v-tab-item>

<v-tab-item  key="3a">

<v-container fluid grid-list-xl v-if="tab==='indicatorSections'">
<v-layout row wrap>
<v-flex sm3 xs-12>
<editable-data-list v-bind:addbottom="true" collection="indicatorSections"></editable-data-list>
</v-flex>
<v-flex sm9 xs12>
<v-card>
<editable-data-list v-bind:addbottom="true" v-if="$store.state._col_indicatorSections_selected" collection="indicatorBlocks" filter="indicatorSections" v-bind:datatable="true"></editable-data-list>
</v-card>
</v-flex>

</v-layout>
</v-container>

</v-tab-item>

-->

</v-tabs>


<v-dialog v-model="uploadDialog" max-width="600">
  <upload
  :layer="tabs[tab].uploadLayer"
  :layerCollection="tabs[tab].uploadLayerCol"
  v-on:close="uploadDialog=false"></upload>
</v-dialog>
<v-dialog v-model="analysisDialog" max-width="600">
  <analysis
  :layer="$store.state['_col_layers_selected']"
  :areaLayer="$store.state['_col_areaLayers_selected']"
  v-on:close="analysisDialog=false"
  ></analysis>
</v-dialog>
</div>
</template>
<script>
import EditableDataList from 'components/EditableDataList.vue'
import Upload from './Upload.vue'
import Analysis from './Analysis'
import MapView from './MapView.vue'
import AreaSelect from './AreaSelect.vue'
import VueJsonPretty from 'vue-json-pretty'
import api from '@/api.js'
import axios from 'axios'

export default {
  components: {
    EditableDataList,MapView,Upload,VueJsonPretty,Analysis,AreaSelect
  },
  data() {
    return {
      uploadDialog : false,
      analysisDialog: false,
      activeTab : null,
      pages :null,
      tab:'features',
      scrollLow : false,
      minimap : {
        position:'fixed',
        top:'20px',
        left:'20px',
        width:'20%',
        height:'200px'
      },
    }
  },
  computed : {
    minimapOn () {
      return this.scrollLow && this.$vuetify.breakpoint.mdAndUp
    },
    iconise () {
      return this.$vuetify.breakpoint.smAndDown
    },
    tabs () {
      return {
        features : {
          text_en : 'Features',
          uploadLayer : this.$store.state['_col_layers_selected'],
          uploadLayerCol : 'layers',
          filter : {
            collection : 'layers',
            listKey : 'data_type'
          },
          map : {
            featuresCollection : 'features',
            featureLayers : this.$store.state._col_layers_selected
          },
          tables : [
            {
              type: 'datalist',
              heading: 'Attributes',
              collection:'layerAttributes',
              filter:'layers',
            },
            {
              type: 'datalist',
              heading: 'Calculations',
              collection:'layerCalcs',
              filter:'layers',
            },
            {
              type: 'datalist',
              heading: 'Features Table',
              multiselect :true,
              collection:'features',
              filter:'layers',
              nestedPath:'feature.properties'
            }
          ]
        },
        areas : {
          text_en : 'Areas',
          uploadLayer : 'areas',
          uploadLayerCol  : 'areaLayers',
          filter : {
            collection : 'areaLayers',
          },
          map : {
            featuresCollection : 'areas',
          },
          tables : [
            {
              type: 'datalist',
              heading: 'Attributes',
              collection:'areaAttributes',
              filter:'areaLayers',
            },
            {
              type: 'datalist',
              heading: 'Areas',
              collection:'areas',
              filter:'areaLayers',
              multiselect :true,
              nestedPath:'feature.properties'
            }
          ]
        },
        indicatorAttributes : {
          text_en : 'Indicators',
          uploadLayer : this.$store.state['_col_areaLayers_selected'],
          uploadLayerCol : 'areaLayers',
          filter : {
            collection : 'areaLayers',
          },
          map : {
            featuresCollection : 'areas',
          },
          tables : [
            {
              type: 'datalist',
              heading: 'Attached Attributes',
              collection:'indicatorAttributes',
              filter:'areaLayers',
            },
            {
              type: 'json',
            }
          ]
        },
        indicatorSections : {
          text_en : 'Sections',
          filter : {
            collection : 'indicatorSections',
          },
          tables : [
            {
              type: 'datalist',
              heading: '',
              collection:'indicatorBlocks',
              filter:'indicatorSections',
              addbottom:true
            }
          ]
        },
        surveys : {
          text_en : 'Surveys',
          uploadLayer : this.$store.state['_col_surveyLayers_selected'],
          uploadLayerCol : 'surveyLayers',
          filter : {
            collection : 'surveyLayers',
            listKey : 'data_type'
          },
          map : {
            featuresCollection : 'surveyFeatures',
            featureLayers : this.$store.state._col_surveyLayers_selected
          },
          tables : [
            {
              type: 'datalist',
              heading: 'Questions',
              collection:'surveyLayerAttributes',
              filter:'surveyLayers',
            },
            {
              type: 'datalist',
              heading: 'Survey Results',
              multiselect :true,
              collection:'surveyRecords',
              filter:'surveyLayers'
            }
          ]
        },
      }
    }
  },
  methods: {
    update(tab){
      console.log('activetab',this.activeTab)
      const self = this
      this.tab = tab
      this.$store.commit('UPDATE',{key:'tab',value:tab})
      this.$nextTick(() => {
        self.$forceUpdate()
      });
    },
    log() {
      console.log('data',this)
      console.log('store',this.$store.state)
      //this.$forceUpdate()
      //console.log(this.$store.getters.selectedFeature)
    }
  },
  mounted(){
    const self = this
    window.addEventListener('scroll', function(e){
      if (window.scrollY > 500 && !self.scrollLow) {
        self.scrollLow = true
      } else if (window.scrollY < 500 && self.scrollLow){
        self.scrollLow = false
      }
    })
  }
}
</script>
<style>
.data-toolbar {
  margin-top:2px;
  float:right;
  display:inline-block;
  height:100px;
  margin-top:10px;
  z-index:2;
}
.vjs-tree .vjs-value__string {
  color: var(--v-primary-base)
}
.vjs-key {
  color: #555
}
.minimap {
  position:fixed !important;
  top:84px;
  left:20px;
  width:23%;
  height:200px;
  border: 1px solid #e3e3e3;
}
.fullmap {
  position:relative;
  width:100%;
  height:400px;
}
</style>
