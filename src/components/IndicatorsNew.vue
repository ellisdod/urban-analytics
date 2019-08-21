<template>
  <div v-if="$vuetify.breakpoint.xsOnly">
    <div
      class="pa-2 px-3 mt-0 ejmap-border-top ejmap-border-bottom"
      style="z-index:4;top:56px;position:fixed;top:56px;width:100%;display:flex;">
    <layer-select
     collection="indicatorSections"
     text="text_en"
     prepend-icon="bar_chart"
     append-icon=""
     v-bind:childStyle="{fontWeight:500}"
     >
    </layer-select>
    <area-select
    :append-icon="''"
    v-bind:childStyle="{fontWeight:300}"
    ></area-select>
    </div>
    <v-carousel
    id="indicators-carosel"
    :cycle="false"
    hide-controls
    hide-delimiters
    light
    :height="400"
    v-model="selected"
    style="z-index:2;overflow-y:auto;"
    >
    <v-carousel-item
    v-for="(item,i) in items"
    :key="i"
    >
    <indicator-card :item="item" v-bind:selected="selected===i" lazy>
    </indicator-card>

  </v-carousel-item>
</v-carousel>
<div style="top:106px;position:fixed;width:100% !important;height:44%">

<map-navigator
id="map-panel-navigator"
style="height:100% !important;width:100% !important"
>
</map-navigator>

</div>
</div>

<div v-else style="display:flex" v-bind:class="{'flex-contents-sm': $vuetify.breakpoint.xsOnly,'flex-contents-md': $vuetify.breakpoint.smOnly,'flex-contents-lg': $vuetify.breakpoint.mdAndUp}">
  <v-navigation-drawer
  permanent
  clipped
  width="200"
  style="z-index:2;padding-top:0px;"
  >
  <editable-data-list v-bind:disabled="true" style="background:none" collection="indicatorSections"></editable-data-list>
</v-navigation-drawer>
<div style="flex:2;overflow-y:auto;">
  <v-container fluid pa-0 pb-5>

    <v-layout row wrap fill-height pb5 pa-0 >

      <v-flex xs12 pa-4 d-flex style="z-index:2;">
        <div style="position:relative;display:block;width:100%;flex:1">

          <div class="title mb-4 pt-1 pb-3 hidden-xs-only ejmap-border-bottom">
            <div style="display:inline-block;float:left;margin-top:6px;" class="mr-4">  {{section.text_en}} </div> <area-select class="title font-weight-light"></area-select>
          </div>

           <!-- INDICATORS -->
           <indicator-card
            v-for="(item,index) in figures"
            @childClick="updateSelected(item._id)"
            style="margin-bottom:20px;"
            :key="index"
            :item="item"
            :selected="selected===item._id"
            class="indicator-hover ejmap-border">
          </indicator-card>

          <div v-if="charts">
            <div class="title mb-4 pt-1 pb-3 ejmap-border-bottom"></div>
            <v-flex xs12 sm6>
            <indicator-card
             v-for="(item,index) in charts"
             @childClick="updateSelected(item._id)"
             style="margin-bottom:20px;"
             :key="index"
             :item="item"
             :selected="selected===item._id"
             class="">
           </indicator-card>
           </v-flex>
          </map-view>

          </div>

          <div v-if="map">
            <div class="subheading mt-5 pt-4 pb-2 ejmap-border-top">
              <span class="mr-3">Map</span><span class="font-weight-light">{{map.text}}</span>
            </div>
            <map-view
            contextmenu=""
            style="position:relative;"
            featuresCollection="features"
            zoomLevel="12"
            height="400px"
            :featureLayers="map.figure"
            v-bind:areas="true"
            class="ejmap-border"
            >
          </map-view>

          </div>

        </div>

      </v-flex>
  </v-layout>
</v-container>
</div>
<v-navigation-drawer
permanent
clipped
right
style="flex:1"
>
<map-navigator
id="map-panel-navigator"
v-bind:class="[{mobile:$vuetify.breakpoint.xsOnly},'ejmap-border-left']"
>
</map-navigator>

</v-navigation-drawer>

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
    items () {
      const data = this.$store.getters.selectedIndicatorBlocks
      console.log('indicator blocks', data)
      const translation = translate(data, ['text','description'], this.$store.state.language)
      console.log('translateion', translation)
      console.log('indicatorsByArea',this.$store.getters.indicatorsByArea)
      return translation
    },
    figures () {
      return this.items.filter(x=>x.type==='Figure')
    },
    charts () {
      const charts = this.items.filter(x=>x.type==='Chart')
      return charts[0] ? charts : null;
    },
    map () {
      return this.items.filter(x=>x.type==='Map')[0]
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
      })

    }

  }
  </script>

  <style>
  .small {
    max-width: 600px;
    margin: auto;
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

  #map-panel-navigator {
    height:100%;
  }

  #map-panel-navigator.mobile {
    height:50% !important;
    top:106px;
    position:fixed;
  }

  #info-panel{
    display:none;
    left:75%;
    height:50%;
    width:25%;
    background-color:#333;
  }
  #map-panel-main, #info-panel{
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
      border:1px solid var(--v-borderColor-base) !important;
  }
  .ejmap-border-right {
      border-right:1px solid var(--v-borderColor-base) !important;
  }

  .ejmap-border-bottom {
      border-bottom:1px solid var(--v-borderColor-base) !important;
  }

  .ejmap-border-top {
      border-top:1px solid var(--v-borderColor-base) !important;
  }

  .ejmap-border-left {
      border-left:1px solid var(--v-borderColor-base) !important;
  }

  .v-toolbar--clipped {
    z-index: 10 !important;
}

.flex-contents-sm {
  height: calc(100vh - 56px)!important;
}

.flex-contents-md {
  height: calc(100vh - 48px)!important;
}

.flex-contents-lg {
  height: calc(100vh - 64px)!important;
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

  .indicator-hover {
    margin-left:3px;
  }

  .indicator-hover:hover {
    border-left: 4px solid var(--v-primary-base) !important;
    margin-left:0px;
  }

  .indicator-hover:hover, .indicator-hover:hover>div {
    cursor:pointer;
    background-color:var(--v-grey-lighten4);
  }


  </style>
