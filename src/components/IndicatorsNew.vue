<template>
  <div>
    <layer-select collection="indicatorSections" style="z-index:4;background-color:white;" class="hidden-sm-and-up pa-2 px-3 ejmap-border-top ejmap-border-bottom">
    </layer-select>
    <v-carousel
     v-if="$vuetify.breakpoint.xsOnly"
     id="indicators-carosel"
     :cycle="false"
     hide-controls
     hide-delimiters
     light
     :height="carouselHeight"
     v-model="selected"
     style="z-index:2;"
     >
<v-carousel-item
  v-for="(item,i) in items"
  :key="i"
>
<indicator-card :item="item" v-bind:selected="selected===i" lazy>
</indicator-card>
</v-carousel-item>
</v-carousel>

    <v-container v-else fluid grid-list-xl style="overflow:hidden;">
      <v-layout row wrap>
        <v-flex sm2 xs-12 style="z-index:2;">
          <editable-data-list v-bind:disabled="true"  collection="indicatorSections"></editable-data-list>
        </v-flex>

        <v-flex sm7 xs12 style="z-index:2">
          <div style="position:relative;display:block;">

            <div class="title mb-4 pt-1 hidden-xs-only">
              <div style="display:inline-block;float:left;margin-top:6px;" class="mr-4">  {{section.text_en}} </div> <area-select class="title font-weight-light"></area-select>
            </div>

            <masonry :cols="{default:2,800:1}" :gutter="20">

              <div sm6 xs12 v-for="(item,index) in items" :key="item._id" @click="updateSelected(index)" style="margin-bottom:20px;">

                <!-- DATATABLE -->
                <indicator-card :item="item" :selected="selected===index">
                </indicator-card>

          </div>
        </masonry>

        <!--   <div v-for="(item,index) in items" :key="item._id">

        <div v-if="item.type==='Map'">
        <div class="my-2">{{item.text}}</div>
        <v-card>
        <map-view
        contextmenu=""
        style="position:relative;"
        featuresCollection="features"
        zoomLevel="12"
        height="400px"
        :featureLayers="item.figure"
        v-bind:areas="true"
        v-bind:options="{}"
        class="ejmap-border"
        >
      </map-view>
    </v-card>

  </div>
</div> -->

</div>

</v-flex>



<!--<v-btn @click="logStore">log</v-btn>-->

</v-layout>
</v-container>
<map-navigator
   v-if="$store.getters.indicatorsForSelectedYear"
   id="map-panel-navigator"
   v-bind:class="{mobile:$vuetify.breakpoint.xsOnly}">
 </map-navigator>
<div style="position:fixed;background:none;top:0;width:74%;height:100%;z-index:1;" class="hidden-xs-only"></div>

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
      selected : 0,
      activeTab: null,
      selectedData : this.$store.getters.selected,
    }
  },
  computed: {
    items () {
      const data = this.$store.getters.selectedIndicatorBlocks
      console.log('indicator blocks', data)
      const translation = translate(data, ['text','description'], this.$store.state.language)
      console.log('translateion', translation)
      console.log('indicatorsByArea',this.$store.getters.indicatorsByArea)
      return translation
    },
    featureLayers () {
      const section = this.$store.getters.selectedIndicatorSection
      return section ? section.geodata : null
    },
    section () {
      return this.$store.state._col_indicatorSections.filter(x=>x._id === this.$store.state._col_indicatorSections_selected)[0]
    },
    carouselHeight () {
      return window.innerHeight /100*45
    }
  },
  methods: {
    updateSelected(index){
      this.selected = index
      console.log('updated select',this.selected )
    },
    log() {
      console.log('store', this.$store.state)
    }
  },
  mounted () {

    this.$store.watch(
      (state, getters) => getters.selectedIndicatorSection,
      (newValue, oldValue) => {
        console.log('section changed',newValue)
        // Do whatever makes sense now
        this.selected = 0
        if (!newValue||!Array.isArray(newValue.geodata)||newValue.geodata.length===0) return null

        newValue.geodata.forEach(x=>{
          if(!this.$store.state['_col_'+x]) this.$store.dispatch('UPDATE_COLLECTION', {
            name : 'features',
            query : {},
            layer : x
          })
        })

        // update main map zoom
        this.$store.commit('UPDATE',{key:['map','zoom'],value:15})
      })

      console.log('store', this.$store.state)
      //this.$store.commit('UPDATE',{key:['map','center'],value:this.$store.state.map.defaultCenter})
    }

    //this.$store.commit('GET_INDICATORS');
    //this.indicators = indicators(this.$store);
    //console.log(this.indicators)
    //console.log('databyneigh', this.$store.getters.dataByNeighbourhood)
    //console.log('databyneigh', this.$store.getters.dataByYear)

  }
  </script>

  <style>
  .small {
    max-width: 600px;
    margin: auto;
  }
  .bar-chart-minimal {
    height:100px;
  }
  .bar-chart-minimal-small {
    height:80px;
  }
  .btn-title div {
    text-transform:none;
  }
  #map-panel-main{
    left:40%;
    height:100%;
    width:40%;
    top:0;
  }
  #map-panel-navigator{
    height:100%;
    width:100%;
    z-index:0;
    top:0;
  }
  #map-panel-navigator.mobile {
    height:50% !important;
    top:56px;
  }

  #info-panel{
    display:none;
    left:75%;
    height:50%;
    width:25%;
    background-color:#333;
  }
  #map-panel-main,  #map-panel-navigator, #info-panel{
    position:fixed;
  }
  #indicators-header,.indicators-content {
    width:100%;
    background-color:inherit;
    margin:0;
  }
  #indicators-header {
    border-bottom: 1px solid #e3e3e3;
    padding-bottom:0;
  }
  .indicators-content {
    padding-top:0;
    background-color:rgb(250, 250, 250);
    flex:2;
  }
  .indicators-content-wrapper {
    overflow-x:hidden;
    overflow-y:auto;
    height:70vh;
  }

  #indicators-panel {
    position:fixed;
    width:40%;
    height:100%;
  }
  .ejmap-border {
    border:1px solid #e3e3e3;
  }
  .ejmap-border-right {
    border-right:1px solid #e3e3e3;
  }
  .ejmap-border-bottom {
    border-bottom:1px solid #e3e3e3 !important;
  }
  .ejmap-border-top {
    border-top:1px solid #e3e3e3 !important;
  }

#indicators-carosel {
      position:absolute;
      top:55%;
      bottom:0;
      overflow-y:auto;
  }

#indicators-carosel .v-responsive__content {
  overflow-y:auto;
}


  #photos {
    /* Prevent vertical gaps */
    line-height: 0;

    -webkit-column-count: 5;
    -webkit-column-gap:   0px;
    -moz-column-count:    5;
    -moz-column-gap:      0px;
    column-count:         5;
    column-gap:           0px;
  }

  </style>
