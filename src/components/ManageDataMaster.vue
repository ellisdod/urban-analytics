<template>
  <div>
  <v-tabs
  v-model="activeTab"
  color="background"
  slider-color="primary"
  class="mt-2"
  >


<v-tab :key="1" ripple @click="update('layers')">Features </v-tab>
<v-tab :key="2" ripple @click="update('areaLayers')">Spatial Analysis</v-tab>
<v-tab :key="3" ripple @click="update('indicatorSections')">Indicator Sections</v-tab>

<v-tab-item key="0a">
  <v-container fluid grid-list-xl v-if="tab==='layers'">
    <div class="text-xs-right caption grey--text" style="margin-top:-20px;">
      <span>Layer id: {{$store.state[`_col_${tab}_selected`]}}</span>
    </div>
    <v-layout row wrap>
      <v-flex sm3 xs-12>
        <editable-data-list collection="layers" listKey="data_type" v-bind:addbottom="true"></editable-data-list>
      </v-flex>
      <v-flex sm9 xs12>

      <v-layout row wrap>

        <v-flex xs9>

        <map-view
        v-if="$store.state._col_features"
        contextmenu=""
        style="position:relative;height:400px;"
        :features="$store.state._col_features"
        featuresCollection="features"
        dataType = "Point"
        zoomLevel="12"
        v-bind:featureLayers="[$store.state._col_layers_selected]"
        >
      </map-view>

    </v-flex>

    <v-flex xs3>
      <div v-if="$store.getters.selectedLayer" class="ejmap-border-top pl-3">
      <div class="subheading font-weight-light py-2">Summary</div>
      <v-layout row wrap class="body-1 ejmap-border-bottom grey--text text--darken-2">
        <v-flex xs12>
          Name: <span style="float:right;"> {{$store.getters.selectedLayer.text_en}} </span>
        </v-flex>
        <v-flex xs12 >
          Data Type: <span style="float:right;">{{$store.getters.selectedLayer.data_type}}</span>
        </v-flex>
        <v-flex xs12>
          Feature Count: <span style="float:right;">{{$store.state._col_features.length}}</span>
        </v-flex>
        <v-flex xs12>
          Source:
        </v-flex>

      </v-layout>

    </div>
    </v-flex>

      <v-flex xs6>
        <div class="subheading font-weight-light ejmap-border-bottom pl-3 pb-2">Layer Attributes</div>
        <editable-data-list v-if="$store.state._col_layers_selected" collection="layerAttributes" filter="layers" v-bind:datatable="true" cssclass="no-background" v-bind:addtop="true"></editable-data-list>
</v-flex>
<v-flex xs6>
        <div class="subheading font-weight-light ejmap-border-bottom pl-3 pb-2">Layer Calculations</div>
        <editable-data-list v-if="$store.state._col_layers_selected" collection="layerCalcs" filter="layers" v-bind:datatable="true" cssclass="no-background" v-bind:addtop="true"></editable-data-list>

      </v-flex>

    <v-flex xs12>


      <div class="subheading font-weight-light ejmap-border-bottom pb-2 pt-5 pl-3">Features Table</div>

      <editable-data-list v-show="$store.state._col_layerAttributes_selected"
      collection="features"
      filter="layers"
      v-bind:datatable="true"
      nestedPath="feature.properties"
      cssclass="no-background"
      v-bind:addtop="true"
      >
     </editable-data-list>


    </v-flex>
     </v-layout>
    <!--<v-btn @click="logStore">log</v-btn>-->

    </v-flex>

  </v-layout>
</v-container>

</v-tab-item>

<v-tab-item  key="1a">
  <v-container fluid grid-list-xl v-if="tab==='areaLayers'">
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
        style="position:relative;height:400px;width;100%;"
        v-bind:areas="true"
        featuresCollection="areas"
        dataType = "MultiPolygon"
        zoomLevel="12"
        >
      </map-view>
      <div v-if="$store.state.selectedFeature" class="py-5">
      <div class="pb-2 subheading font-weight-light  ejmap-border-bottom">Indicators </div>
      <v-tabs slider-color="primary" color="background">
        <v-tab v-for="(indicator,index) in $store.getters.indicatorsForSelectedArea" :key="index" ripple>
          {{ indicator.year }}
        </v-tab>
        <v-tab-item v-for="(indicator,index) in $store.getters.indicatorsForSelectedArea" :key="index">
          <v-card flat>
          <vue-json-pretty
          class="pa-3 mb-2 code"
          :data="indicator">
          </vue-json-pretty>
        </v-card>
        </v-tab-item>
      </v-tabs>
    </div>
    </v-flex>
    <v-flex sm5 xs12>
        <div class="pb-2 subheading font-weight-light">Attached Attributes</div>
        <v-card flat>
         <editable-data-list v-bind:addbottom="true" v-if="$store.state._col_areaLayers_selected" collection="areaAttributes" filter="areaLayers" v-bind:datatable="true"></editable-data-list>
        </v-card>
    </v-flex>


    <v-flex offset-sm3 sm9 xs12>
      <v-card>
      <!--  <editable-data-list v-if="$store.state.selected.indicators" collection="indicators" filter="areaLayers" v-bind:datatable="true"></editable-data-list> -->
      </v-card>
    </v-flex>
  </v-layout>
    </v-flex>

  </v-layout>
</v-container>

</v-tab-item>

<v-tab-item  key="2a">

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


</v-tabs>


<div class="data-toolbar">
   <v-btn
   color="grey" class="mb-2" flat @click="uploadDialog=true">
    <v-icon class="mr-2">cloud_upload</v-icon>
    Upload
    </v-btn>

    <v-btn
     color="grey" class="mb-2" flat @click="analysisDialog=true">
    <v-icon class="mr-2">assessment</v-icon>
    Update Feature Analysis
    </v-btn>
</div>

<v-btn @click="log()">log</v-btn>

<v-dialog v-model="uploadDialog" max-width="600">
   <upload :layer="$store.state['_col_'+tab+'_selected']"></upload>
</v-dialog>
<v-dialog v-model="analysisDialog" max-width="600">
   <analysis :layer="$store.state['_col_layers_selected']" :areaLayer="$store.state['_col_areaLayers_selected']"></analysis>
</v-dialog>
</div>
</template>
<script>
import EditableDataList from 'components/EditableDataList.vue'
import Upload from './Upload.vue'
import Analysis from './Analysis'
import MapView from './MapView.vue'
import VueJsonPretty from 'vue-json-pretty'
import api from '@/api.js'
import axios from 'axios'

export default {
  components: {
    EditableDataList,MapView,Upload,VueJsonPretty,Analysis
  },
  data() {
    return {
      uploadDialog : false,
      analysisDialog: false,
      activeTab :null,
      pages :null,
      tab:'layers',
      pagesX : [
        {
          name: 'features',
          mainCollection: 'layers',
          relatedCollection: 'layerAttributes',
          featuresCollection: 'features'
        },
        {
          name: 'spatial_areas',
          mainCollection: 'areaLayers',
          featuresCollection: 'areas',
          indicators:true
        },
        {
          name: 'indicators',
          mainCollection: 'indicatorSections',
          relatedCollection: 'indicatorBlocks',
          featuresCollection: 'indicators',
          indicators:true,
        }
      ]
    }
  },
  computed : {

  },
  methods: {
    update(tab){
      this.tab = tab
      this.$store.commit('UPDATE',{key:'tab',value:tab})
      this.$nextTick(() => {
			 this.$forceUpdate()
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
  }
}
</script>
<style>
.data-toolbar {
  position:absolute;
  right:12px;
  top:60px;
  margin-top:-50px;
}
.vjs-tree .vjs-value__string {
  color: var(--v-primary-base)
}
.vjs-key {
  color: #555
}
</style>
