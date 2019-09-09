<template>
  <div class="page" style="padding-top:400px;" ref="page">
  <v-container fluid pa-4>
    <v-layout row wrap fill-height >
      <v-flex xs3>
        <div class="title font-weight-light">Neighbourhood Profile</div>
        <div class="title mt-2">{{$store.state.year}}</div>
      </v-flex>
      <v-flex xs9>
        <area-select class="display-1"></area-select>
      </v-flex>
      <v-flex xs12 py-4> </v-flex>

      <v-flex xs9>
        <map-view
        contextmenu=""
        featuresCollection=""
        :featureLayers="['buildingslayerid']"
        :zoomLevel="15"
        height="300px"
        v-bind:areas="true"
        class="ejmap-border-top ejmap-border-bottom ejmap-border-right"
        :hideLegend="true"
        :hideControls="true"
        highlightColor="black"
        baseMapLink="https://api.maptiler.com/maps/22b3d9af-6774-4072-8dcd-68392fec6910/style.json?key=ArAI1SXQTYA6P3mWFnDs"
        >
        </map-view>
      </v-flex>
   <v-flex xs3>
     <map-view
     contextmenu=""
     featuresCollection=""
     :zoomLevel="11"
     height="300px"
     v-bind:areas="true"
     class="ejmap-border-top ejmap-border-bottom"
     :hideLegend="true"
     :hideControls="true"
     highlightColor="black"
     baseMapLink="https://api.maptiler.com/maps/22b3d9af-6774-4072-8dcd-68392fec6910/style.json?key=ArAI1SXQTYA6P3mWFnDs"
     >
   </map-view>
  </v-flex>
  <v-flex xs12 style="padding-top:100px;" class="text-xs-center">International Peace and Cooperation Center </v-flex>
   </v-layout>
  </v-container>

  <div style="flex:2;overflow-y:auto;">
    <v-container fluid pa-0 pb-5>

      <v-layout row wrap pb5 pa-4 :key="index" class="section" v-for="(section,index) in sections">

        <v-flex xs12 class="title mb-4 pt-1 pb-3 ejmap-border-bottom">
          <div style="display:inline-block;float:left;margin-top:6px;" class="mr-4">  {{ section.section ? section.section.text_en : ''}} </div>
        </v-flex>

        <v-flex xs7 d-flex style="z-index:2;">
          <div style="position:relative;display:block;width:100%;flex:1">

            <!-- INDICATORS -->
            <indicator-card
            v-for="(item,index) in section.figures"
            @childClick="updateSelected(item._id)"
            style="margin-bottom:0;"
            :key="index"
            :item="item"
            :selected="selected===item._id"
            :compact="true"
            class="indicator-hover ejmap-border-bottom">
          </indicator-card>

          <indicator-card
          v-if="section.charts.length&&section.map"
          v-for="(item,index) in section.charts"
          @childClick="updateSelected(item._id)"
          style="margin-bottom:20px;"
          :key="index"
          :item="item"
          :selected="selected===item._id"
          class="mt-4">
        </indicator-card>


       </div>

      </v-flex>

      <v-flex v-if="section.map||section.charts.length" xs5 pl-4>

        <map-view
        v-if="section.map"
        contextmenu=""
        style="position:relative;"
        featuresCollection="features"
        :zoomLevel="14"
        height="300px"
        :featureLayers="section.map.figure"
        v-bind:areas="true"
        :minimiseLegend="true"
        :legendBottom="true"
        :hideControls="true"
        :attribute="section.map.unit"
        baseMapLink="https://api.maptiler.com/maps/22b3d9af-6774-4072-8dcd-68392fec6910/style.json?key=ArAI1SXQTYA6P3mWFnDs"
        >
        <div class="body-1 pt-2">
          <span class="font-weight-light">{{section.map.text}}</span>
        </div>
      </map-view>

      <indicator-card
      v-else-if="section.charts.length"
      v-for="(item,index) in section.charts"
      @childClick="updateSelected(item._id)"
      style="margin-bottom:20px;"
      :key="index"
      :item="item"
      :selected="selected===item._id">
    </indicator-card>

    </v-flex>


   </v-layout>
   </v-container>

  </div>

</v-flex>
</v-layout>
</v-container>







<!--
<v-flex sm4 xs12 pa-0 style="height: calc(100vh - 48px);">

</v-flex>
<div style="position:fixed;background:none;top:0;width:74%;height:100%;z-index:1;" class="hidden-xs-only"></div>-->
</div>


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
      nav:true,
      selected : null,
      activeTab: null,
      selectedData : this.$store.getters.selected,
    }
  },
  computed: {
    sections () {
      const data = this.$store.state._col_indicatorBlocks
      console.log('indicator blocks', data)
      const translation = translate(data, ['text','description'], this.$store.state.language)
      //console.log('translateion', translation)
      //console.log('indicatorsByArea',this.$store.getters.indicatorsByArea)
      const sections = translation.reduce((acc,x)=>{
        if (!x.active) return acc
        acc[x.layer] = acc[x.layer] || {}
        acc[x.layer].figures = acc[x.layer].figures || []
        acc[x.layer].charts = acc[x.layer].charts || []
        acc[x.layer].section = acc[x.layer].section || this.$store.state._col_indicatorSections.filter(i=>i._id === x.layer)[0]

        if (x.type === 'Map') acc[x.layer].map = x
        else if (x.type === 'Figure') acc[x.layer].figures.push(x)
        else if (x.type === 'Chart' || x.type === 'List') acc[x.layer].charts.push(x)
        return acc
      },{})
      console.log('sections',sections)
      return sections

    }

  },
  methods: {
    updateSelected(index){
      this.selected = index
      console.log('updated select',this.selected )
    }
  },
  mounted () {
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
        (val) => {
          const document = this.$refs.page.getRootNode()
          document.title = 'EJ_Profile_2019_'+this.$store.getters.areaNames[this.$store.state.neighbourhood];
        })
    this.$nextTick(()=>{
      const document = this.$refs.page.getRootNode()
      document.title = 'EJ_Profile_2019_'+this.$store.getters.areaNames[this.$store.state.neighbourhood];
      console.log('page',this.$refs.page.getRootNode())
    })


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
    width: 210mm;
    min-height: 297mm;
    padding: 5mm;
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
@media print {
    html, body {
        width: 210mm;
        height: 297mm;
    }
    .page {
        margin: 0;
        border: initial;
        border-radius: initial;
        width: initial;
        min-height: initial;
        box-shadow: initial;
        background: 'white';
        page-break-after: always;
    }
    .section {
      page-break-inside:avoid;
    }
}

  </style>
