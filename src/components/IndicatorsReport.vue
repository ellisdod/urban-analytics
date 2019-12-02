<template>
  <div>
  <div class="page" style="padding-top:100px;" ref="page">
    <div class="pa-2 pl-5"
    :style="{backgroundColor:$vuetify.theme.primary, color:'white', width:'220px'}" >
    <div class="title font-weight-light">Neighbourhood Profile</div>
    <div class="title mt-2">{{$store.state.year}}</div>
    </div>
  <v-container fluid pa-4>
    <v-layout row wrap >
      <v-flex xs8 offset-xs4 style="margin-top:-110px;">
        <area-select
        class="display-1 font-weight-medium"
        :value="$route.params.areaId">
        </area-select>
        <div class="title">East Jerusalem</div>
      </v-flex>
      <v-flex xs12 pt-4> </v-flex>

      <v-flex xs12>
        <map-view
        contextmenu=""
        featuresCollection="features"
        :featureLayers="['5d285d2fb1cc5b4af7154697']"
        :zoomLevel="15"
        height="700px"
        v-bind:areas="true"
        class=""
        :hideLegend="true"
        :hideControls="true"
        :baseMapOff="true"
        highlightColor="black"
        baseMapLink=""
        >
      </map-view>
    </v-flex>
    <v-flex xs4 offset-xs8 style="margin-top:-200px;">
      <map-navigator
      style="height:350px"
      :zoom="11"
      :showBaseMap="false"
      :showLegend="false"
      :showControls="false"
      :showData="false"
      :center="{lat:31.79523494658361,lng:35.19274277873786}"
      contextmenu=""
      featuresCollection=""
      :zoomLevel="11"
      v-bind:areas="true"
      :hideLegend="true"
      :hideControls="true"
      highlightColor="black"
      baseMapLink="https://api.maptiler.com/maps/22b3d9af-6774-4072-8dcd-68392fec6910/style.json?key=ArAI1SXQTYA6P3mWFnDs"
      >
    </map-navigator>
  </v-flex>
<!--  <v-flex xs12 style="" class="text-xs-center">International Peace and Cooperation Center </v-flex>-->
</v-layout>
</v-container>
</div>

<!--<div style="flex:2;overflow-y:auto;">-->
  <template v-for="(section,key) in sections">
  <div class="page section">
   <v-container pa-4>

      <v-layout row wrap pb5 pa-4  align-content-start>

        <v-flex xs12 class="title mb-4 pt-3 pb-3 ejmap-border-bottom">
          <div style="display:inline-block;float:left;margin-top:6px;" class="mr-4">  {{ section.section ? section.section.text_en : ''}} </div>
        </v-flex>

        <!--<v-flex xs7 d-flex style="z-index:2;">
          <div style="position:relative;display:block;width:100%;flex:1">-->

          <v-flex xs6 v-for="(item,index) in section.figure">

            <!-- INDICATORS -->
            <indicator-card
            @childClick="updateSelected(item._id)"
            style="margin-bottom:0;"
            :key="index"
            :item="item"
            :print="true"
            :selected="selected===item._id"
            class="indicator-hover">
          </indicator-card>

        </v-flex>

        <v-flex xs6
        v-if="section.chart.length"
        v-for="(item,index) in section.chart">

          <indicator-card
          @childClick="updateSelected(item._id)"
          style="margin-bottom:20px;"
          :key="index"
          :item="item"
          :print="true"
          :selected="selected===item._id"
          class="mt-4">
        </indicator-card>
       </v-flex>

       <v-flex xs6
       v-if="section['pie chart'].length"
       v-for="(item,index) in section['pie chart']">

         <indicator-card
         @childClick="updateSelected(item._id)"
         style="margin-bottom:20px;"
         :key="index"
         :item="item"
         :print="true"
         :selected="selected===item._id"
         class="mt-4">
       </indicator-card>
      </v-flex>

       <v-flex v-if="section.percentage&&section.percentage.length" xs3>
         <v-layout row wrap>
         <v-flex xs12  v-for="(item,index) in section.percentage">

         <indicator-card
         @childClick="updateSelected(item._id)"
         style="margin-bottom:20px;"
         :key="index"
         :item="item"
         :print="true"
         :selected="selected===item._id"
         class="mt-4">
       </indicator-card>
     </v-flex>
   </v-layout>

      </v-flex>

     <v-spacer></v-spacer>

     <v-flex xs6
     v-if="section.list.length"
     v-for="(item,index) in section.list">

       <indicator-card
       @childClick="updateSelected(item._id)"
       style="margin-bottom:20px;"
       :key="index"
       :item="item"
       :print="true"
       :selected="selected===item._id"
       class="mt-4">
     </indicator-card>
   </v-flex>

  <!--  <v-flex xs4 d-flex style="z-index:2;">
  <div style="position:relative;display:block;width:100%;flex:1">
      <indicator-card
      v-for="(item,index) in section.figureHighlights"
      @childClick="updateSelected(item._id)"
      style="margin-bottom:20px;"
      :key="index"
      :item="item"
      :selected="selected===item._id"
      class="indicator-hover">
    </indicator-card>
</div>
</v-flex>-->
</v-layout>

</v-container>
<div class="pagenum">{{section.page}}</div>
</div>

<div v-if="section.map" class="page map-page">
<!-- MAP PAGE -->
<v-container pa-5>
<v-layout wrap row>

  <v-flex xs12 pt-5>

    <map-view
    v-if="section.map"
    contextmenu=""
    style="position:relative;"
    featuresCollection="features"
    :zoomLevel="section.map[0].zoom||15"
    height="682px"
    :featureLayers="section.map[0].figure"
    v-bind:areas="true"
    :minimiseLegend="true"
    :legendBottom="true"
    :hideControls="true"
    :hideBaseMap="section.map[0].hideBaseMap"
    :attributes="section.map[0].mapAttributes"
    :dateRange="section.map[0].date_range"
    :scaleBar="true"
    :northArrow="true"
    baseMapLink="https://api.maptiler.com/maps/22b3d9af-6774-4072-8dcd-68392fec6910/style.json?key=ArAI1SXQTYA6P3mWFnDs"
    >
    <div class="body-1 pt-2">
      <span class="font-weight-medium">{{section.map[0].text}}</span>
    </div>
  </map-view>
</v-flex>
</v-layout>

</v-container>
<div class="pagenum">{{section.page+1}}</div>
</div>
<!--margin-top:-30px;margin-bottom:30px;padding-left:50px-->


</template>

<div class="page">
  <v-container pa-2>

<v-layout row wrap pb5 pa-4>

  <v-flex xs12 class="title mb-4 pt-3 pb-3 ejmap-border-bottom">
    <div style="display:inline-block;float:left;margin-top:6px;" class="mr-4">  Sources </div>
  </v-flex>

    <template v-if="sections[section._id]" v-for="(section,index) in $store.state._col_indicatorSections">

      <v-flex xs12 class="subheading font-weight-medium pt-3">
        {{section.text_en}}
      </v-flex>

      <template v-if="findLayer(item.figure).source_org" v-for="(item,i) in sections[section._id].figure">
        <v-flex xs4 class="body-1">
          {{item.text}}
        </v-flex>
        <v-flex xs8 class="body-1">
          <a v-if="findLayer(item.figure).source_url" :href="findLayer(item.figure).source_url">
            {{ findLayer(item.figure).source_org +" - "+findLayer(item.figure).source_ref }}
          </a>
          <div v-else>
            {{ findLayer(item.figure).source_org +" - "+findLayer(item.figure).source_ref }}
          </div>
        </v-flex>

      </template>

    </template>





</v-layout>
</v-container>
</div>








<!--
<v-flex sm4 xs12 pa-0 style="height: calc(100vh - 48px);">

</v-flex>
<div style="position:fixed;background:none;top:0;width:74%;height:100%;z-index:1;" class="hidden-xs-only"></div>-->
</div>






</template>

<script>
import BarHorizontal from '../plugins/barHorizontal.js'
import BarVertical from '../plugins/barVertical.js'
import IndicatorKeyStat from './IndicatorKeyStat.vue'
import IndicatorHeading from './IndicatorHeading.vue'
import colors from 'vuetify/es5/util/colors'
import {indicators} from '../plugins/indicators.js'
import {translate} from '../plugins/translate.js'
import MapView from 'components/MapView.vue'
import MapNavigator from 'components/MapNavigator.vue'
import EditableDataList from 'components/EditableDataList.vue'
import AreaSelect from 'components/AreaSelect.vue'
import LayerSelect from 'components/LayerSelect.vue'
import IndicatorCard from 'components/IndicatorCard.vue'

export default {
  components: {
    MapView, MapNavigator, BarHorizontal,BarVertical, IndicatorKeyStat, IndicatorHeading,EditableDataList,AreaSelect,IndicatorCard,LayerSelect
  },
  data () {
    return {
      pageNum:0,
      nav:true,
      selected : null,
      activeTab: null,
      selectedData : this.$store.getters.selected,
    }
  },
  computed: {
    sections () {
      const data = this.$store.state._col_indicatorBlocks
      //.log('indicator blocks', data)
      const translation = translate(data, ['text','description'], this.$store.state.language)
      //console.log('translateion', translation)
      //console.log('indicatorsByArea',this.$store.getters.indicatorsByArea)

      const sections = translation.reduce((acc,x)=>{
        if (!x.active) return acc
        const type = x.type.toLowerCase()
        acc[x.layer] = acc[x.layer] || {}
        acc[x.layer][type] = acc[x.layer][type] || []
        acc[x.layer][type].push(x)
        acc[x.layer].section = acc[x.layer].section || this.$store.state._col_indicatorSections.filter(i=>i._id === x.layer)[0]
        return acc
      },{})

      let pageCounter = 1
      Object.keys(sections).forEach((key)=>{
        sections[key].page = pageCounter
        pageCounter ++
        if (sections[key].map) pageCounter ++
      })
      //console.log('sections',sections)
      return sections
      /// FOR TESTING
      const filters = {
      education: "5cfeada92390cf91f4217329",
      housing: "5d00ef4883de38f9b2719f7d",
      conflict: "5cfedf142188d19a4ffe26a7",
      demographics : "5d00efa283de38f9b2719f7e",
      mobility: "5d20b415258be4666124df6c",
      plans :"5db82e24079f0e9c38b84669"
    }
      const filterId = filters.mobility
      const filtered = {}
      filtered[filterId] = sections[filterId]
      return filtered

    }

  },
  methods: {
    updateSelected(index){
      this.selected = index
      console.log('updated select',this.selected )
    },
    findLayer (figure) {
      const figureArr = figure[0].split('.')
      const layerId = figureArr[0]
      let layer;
      if (layerId==='attached') {
        const name = figureArr.slice(-1)[0]
        layer = this.$store.state._col_indicatorAttributes.filter(x=>x.name===name)[0]
      } else {
        layer = this.$store.state._col_layers.filter(x=>x._id===layerId)[0]
      }
      return layer || {}
    },
    updateTitle () {
      const document = this.$refs.page.getRootNode()
      document.title = 'EJ_Profile_2019_'+this.$store.getters.selectedArea.feature.properties.text_en;
    }
  },
  mounted () {
    this.$nextTick(()=>this.updateTitle())
    this.$store.commit('UPDATE',{key:'hideToolbar',value:true})
    this.$store.watch(
      (state, getters) => getters.selectedIndicatorSection,
      (newValue, oldValue) => {
        console.log('section changed',newValue)
        // Do whatever makes sense now
        this.selected = 0
        if (!newValue||!Array.isArray(newValue.geodata)||newValue.geodata.length===0) return null
      })
      this.$store.watch(
        (state) => state.neighbourhood,
        (val) => this.updateTitle()
      )
      }

    }
    </script>

    <style>

    body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: #FAFAFA;
      font: 12pt "Tahoma";
    }
    * {
      box-sizing: border-box;
      -moz-box-sizing: border-box;
    }
    .page {
      position:relative;
      width: 210mm;
      min-height: 297mm;
      max-height: 297mm;
      overflow:hidden;
      padding: 0;
      margin: 0mm auto;
      border: 1px #D3D3D3 solid;
      border-radius: 5px;
      background: white;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    }
    .subpage {
      padding: 1cm;
      border: 5px red solid;
      height: 257mm;
      outline: 2cm #FFEAEA solid;
    }

    .leaflet-container {
      background:none;
    }

    @page {
      size: A4;
      margin: 0;
    }

    .section {
    }
    .map-page {
    }
    .pagenum {
      position: absolute;
      bottom: 40px;
      left:40px;
    }





    @media print {
      html, body {
        width: 210mm;
        height: 297mm;
      }
      .page {
        margin: 0;
        position:relative;
        border: initial;
        border-radius: initial;
        width: initial;
        box-shadow: initial;
        background: 'white';
        page-break-after: always;
      }


    }

    </style>
