<template>
  <div>
    <v-container fluid grid-list-xl>
      <v-layout row wrap>
        <v-flex sm2 xs-12 style="z-index:2;">
          <editable-data-list v-bind:disabled="true"  collection="indicatorSections"></editable-data-list>
        </v-flex>

        <v-flex sm7 xs12 style="z-index:2;">
          <div style="position:relative;display:block;">

            <div class="title mb-4 pt-1">
            <div style="display:inline-block;float:left;margin-top:6px;" class="mr-4">  {{section.text_en}} </div> <area-select class="title font-weight-light"></area-select>
            </div>

            <masonry :cols="{default:2,800:1}" :gutter="20">

            <div sm6 xs12 v-for="(item,index) in items" :key="item._id" @click="updateSelected(index)" style="margin-bottom:20px;">

              <!-- DATATABLE -->
              <div v-if="item.datatable" class="py-3">
                <v-divider/>
                <div class="title py-3">{{item.name}}</div>
                <v-data-table :items="item.data" :headers="item.headers" :rows-per-page-items="[-1]">
                  <template v-slot:items="props">
                    <td v-for="header in item.headers">{{ props.item[header.value] }}</td>
                  </template>
                </v-data-table>
              </div>

              <!-- KEYSTAT -->
              <indicator-key-stat v-else-if="item.type==='Figure' || item.type==='List' || item.type==='Chart'"
              v-bind:selected="selected===index"
              :name="item.text"
              :figure="item.figure"
              :description="item.description"
              :unit="item.unit"
              :year="item.year"
              :type="item.type"
              >
              </indicator-key-stat>

               <!-- MAP -->
              <div v-else-if="item.type==='Map'">
                <div class="subheading font-weight-light my-2">{{item.text}}</div>
          <v-card>
              <map-view
              contextmenu=""
              style="position:relative;"
              featuresCollection="features"
              zoomLevel="12"
              height="400px"
              :featureLayers="item.figure"
              v-bind:areas="true"
              v-bind:options="{legendBottom:true}"
              class="ejmap-border"
              >
            </map-view>
          </v-card>
        </div>

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
<map-navigator v-if="$store.getters.indicatorsForSelectedYear" id="map-panel-navigator"></map-navigator>
<div style="position:fixed;background:none;top:0;width:74%;height:100%;z-index:1;"></div>

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

export default {
  components: {
    MapView, MapNavigator, BarHorizontal,BarVertical, IndicatorKeyStat, IndicatorHeading,EditableDataList,AreaSelect
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
