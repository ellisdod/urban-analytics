<template>
  <div>

<v-container fluid grid-list-xl class="px-3 pt-0" >

  <div style="text-xs-right">
    <div class="data-toolbar" v-bind:style="{top:$vuetify.breakpoint.xsOnly?'140px':0}">
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
class="mt-2 mx-4"
show-arrows
>

<v-tab
v-for="(val,key,index) in tabs"
:key="index" ripple @click="update(key)"
>{{val.text_en}}</v-tab>

<v-tab-item lazy v-for="(val,key,index) in tabs" :key="index" class="pt-4">
    <layer-select
    v-if="$vuetify.breakpoint.xsOnly"
    :collection="val.filter.collection"
    style="background-color:white;"
    class="ejmap-border pa-2"
    >
    </layer-select>
    <div class="text-xs-right caption grey--text" v-bind:style="{marginTop:($vuetify.breakpoint.xsOnly?'10px':'-20px')}">
      <span>Layer id: {{$store.state[`_col_${val.uploadLayerCol}_selected`]}}</span>
    </div>
    <v-layout row wrap>
      <v-flex sm3 xs12>
        <editable-data-list
        v-if="$vuetify.breakpoint.smAndUp"
        :collection="val.filter.collection"
        :listKey="val.filter.listKey"
        v-bind:addbottom="true">
      </editable-data-list>
    </v-flex>
    <v-flex sm9 xs12>

      <v-layout row wrap>

        <v-flex xs12 v-if="val.map" v-bind:style="{height:$vuetify.breakpoint.xsOnly ? '602px':'402px'}" class="mb-2">
        <map-view
        :style="val.map.style || 'position:relative;height:402px;'"
        :featuresCollection="val.map.featuresCollection"
        :height="val.map.height || '400px'"
        :featureLayers="val.map.featureLayers"
        v-bind:class="val.map.classObj || {minimap:minimapOn, fullmap: !minimapOn, 'ejmap-border':true}"
        v-bind:options="val.map.options || {legendBottom:scrollLow||$vuetify.breakpoint.xsOnly,areaSelect:true}">
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

</v-tab-item>

</v-tabs>
</v-container>

<v-dialog v-model="uploadDialog" max-width="600">
  <upload :layer="tabs[tab].uploadLayer"
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
import LayerSelect from 'components/LayerSelect.vue'
import api from '@/api.js'
import axios from 'axios'

export default {
  components: {
    EditableDataList,MapView,Upload,VueJsonPretty,Analysis,AreaSelect,LayerSelect
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
      return  {
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
          },
          map : {
            featuresCollection : 'features',
            featureLayers : this.$store.getters.getSelected('surveyLayers').featureLayer
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
  padding-right:20px;
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
