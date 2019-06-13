<template>
  <div>
    <v-container fluid grid-list-xl>
      <v-layout row wrap>
        <v-flex sm3 xs-12>
          <editable-data-list collection="indicatorSections"></editable-data-list>
        </v-flex>

        <v-flex sm7 xs12>
          <v-container fluid grid-list-xl pa-0>
          <v-layout row wrap>
            <v-flex xs12>
              <map-view
              v-if="$store.state._col_features"
              contextmenu=""
              style="position:relative;height:400px;"
              :features="$store.state._col_features"
              featuresCollection="features"
              dataType = "Point"
              zoomLevel="12"
              v-bind:areas="true"
              >
            </map-view>
          </v-flex>

          <v-flex sm6 xs12 v-for="item in items" :key="item._id">

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
            :name="item.text"
            :figure="item.figure"
            :description="item.description"
            :unit="item.unit"
            :year="item.year"
            :type="item.type">
            </indicator-key-stat>

      </v-flex>
    </v-layout>

    </v-container>

</v-flex>
<v-flex sm2 xs12>
  <map-navigator v-if="$store.getters.indicatorsForSelectedYear" id="map-panel-navigator"></map-navigator>
  <div id="info-panel">
  </div>
</v-flex>
<!--<v-btn @click="logStore">log</v-btn>-->

</v-layout>
</v-container>

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
import axios from 'axios'

export default {
  components: {
    MapView, MapNavigator, BarHorizontal,BarVertical, IndicatorKeyStat, IndicatorHeading,EditableDataList
  },
  data () {
    return {
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
    }
  },
  methods: {
  },
  mounted () {
    //this.$store.commit('GET_INDICATORS');
    //this.indicators = indicators(this.$store);
    //console.log(this.indicators)
    //console.log('databyneigh', this.$store.getters.dataByNeighbourhood)
    //console.log('databyneigh', this.$store.getters.dataByYear)
  }
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
  height:400px;
  width:16%;
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
