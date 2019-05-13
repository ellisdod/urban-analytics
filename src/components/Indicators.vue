<template>
  <div class="section">
    <div id="indicators-panel">
      <v-container id="indicators-header" px-5>
        <div style="padding-left:20px;">
          <span class="title text-uppercase grey--text">East Jerusalem</span>
          <span class="title text-uppercase">&nbsp;| URBAN INDICATORS</span>
        </div>
        <v-layout row wrap pb-2 pt-2>
          <v-flex xs12>
            <v-menu max-height="300px" offset-y>
              <template v-slot:activator="{ on }">
                <v-btn v-if="$store.getters.dataByNeighbourhood" class="btn-title display-1 px-0 mx-0" flat v-on="on">
                  {{ $store.getters.dataByNeighbourhood[0].name }}
                </v-btn>
              </template>
              <v-list>
                <v-list-tile
                v-for="(item, index) in $store.getters.areaSelect"
                :key="index"
                @click="$store.commit('UPDATE_AREA', item.area_code)"
                >
                <v-list-tile-title>{{ item.name }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </v-flex>
        <v-flex xs>
          <v-select
          v-model="$store.state.year"
          :items="$store.getters.years">
        </v-select>
      </v-flex>
      <v-spacer/>
      <v-btn :color="$store.state.theme.primary"
      round depressed dark small
      @click=""
      >East Jerusalem</v-btn>

    </v-layout>
  </v-container>
  <v-tabs
    v-model="activeTab"
    light
    color="#fff0"
    slider-color="black"
    >
    <v-tab
        v-for="i in items"
        :key="n"
        ripple
    >
      {{i.name_en}}
    </v-tab>
    <v-tab-item
        v-for="i in items"
        :key="x"
        class="indicators-content-wrapper"
      >

  <!-- items -->
   <!--<v-container id="indicators-content">-->
   <v-container class="indicators-content" px-5>
    <div v-for="item in i.items">

      <indicator-heading v-if="item.heading" :text="item.name"/>


      <indicator-key-stat v-else-if="item.keystat"
      :name="item.name"
      :figure="item.figure"
      :description="item.description"
      :unit="item.unit"
      :year="item.year"
      >
    </indicator-key-stat>

    <v-layout row wrap v-else-if="item.blocks">

      <v-flex xs8 py-4 pr-4>
        <div class="title">{{item.left[0].name}}</div>
        <bar-vertical
        style="margin-left:-20px;height:320px;"
        v-bind:x-labels="true"
        v-bind:y-labels="true"
        v-bind:chart-data="log({
          datasets:item.left[0].datasets,
          labels:item.left[0].labels
          })">
        </bar-vertical>

      </v-flex>
      <v-flex xs4>
        <indicator-key-stat
        v-for="i in item.right"
        :name="i.name"
        :figure="i.figure"
        :description="i.description"
        :unit="i.unit"
        small="true"
        :year="item.year"
        >
      </indicator-key-stat>
    </v-flex>
  </v-layout>

</div>
</v-container>
<!-- items-end -->

</v-tab-item>
</v-tabs>

</div>

<map-view id="map-panel-main"></map-view>
<map-navigator id="map-panel-navigator"></map-navigator>

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
import axios from 'axios'

export default {
  components: {
    MapView, MapNavigator, BarHorizontal,BarVertical, IndicatorKeyStat, IndicatorHeading
  },
  data () {
    return {
      activeTab: null,
      selectedData : this.$store.getters.selected,
    }
  },
  computed: {
    items () {
      return translate(indicators(this.$store), ['name','description'], this.$store.state.language);
    }
  },
  methods: {
    prepDstrChartData(datasets,labels,color){
      const basedata = {
        label: ''
      }
      const data=  {
        labels: labels,
        datasets : datasets
      }
      console.log('chartdata', data)
      return data;
    },
    log(data) {
      console.log('log',data);
      return data;
    },
    testServer(){
      // Make a request for a user with a given ID
      axios.get('/indicators')
      .then(function (response) {
        // handle success
        console.log(response);
      })
    }
  },
  mounted () {
    this.$store.commit('GET_INDICATORS');
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
  left:50%;
  height:50%;
  width:50%;
  top:50%;
}
#map-panel-navigator{
  left:50%;
  height:50%;
  width:50%;
}
#map-panel-main,  #map-panel-navigator{
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
  width:50%;
  height:100%;
}

</style>
