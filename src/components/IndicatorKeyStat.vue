<template>
  <div v-if="noChart" class="py-2">
    <div class="title">{{name}}</div>
    <div>
      <span class="display-2">{{$store.getters.dataByHoodYear[figure] || getDataByHoodYear[figure]}}</span>
      <span class="display-1 ml-1">{{unit}}</span>
    </div>
    <div class="caption">{{description}}</div>
  </div>
  <v-layout v-else-if="small" row wrap class="py-4 indicator-hover" @click="updateIndicator({figure:figure,name:name},$store.getters.dataByYear || getDataByYear)">
    <div>
      <div class="title">{{name}}</div>
      <div style="overflow-x: visible; display: inline-block; white-space: nowrap;">
        <span class="display-1">{{$store.getters.dataByHoodYear[figure] || getDataByHoodYear[figure]}}</span>
        <span v-if="unit" class="headline ml-1">{{unit}}</span>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <div class="city-indicator-small" v-on="on">{{$store.getters.dataByCityYear[figure] || getDataByCityYear[figure]}}</div>
          </template>
          <span>East Jerusalem</span>
        </v-tooltip>

      </div>
      <div class="caption">{{description}}</div>
    </div>
    <v-flex px-0>
      <bar-vertical
      style="height:80px;margin-top:-30px;"
      v-bind:chart-data="prepBarChartData(figure,$store.state.neighbourhood)"
      class="bar-chart-minimal-small"
      v-bind:click-handler="true"
      v-bind:x-labels="false"
      v-bind:y-labels="false">
    </bar-vertical>
  </v-flex>
</v-layout>
<v-layout v-else row wrap class="py-3 indicator-hover" @click="updateIndicator({figure:figure,name:name})">
  <v-flex xs12 sm4>
    <div class="title">{{name}}</div>
    <div style="overflow-x: visible; display: inline-block; white-space: nowrap;">
      <span class="display-3 py-0">{{$store.getters.dataByHoodYear[figure] || getDataByHoodYear[figure]}}</span>
      <span v-if="unit" class="display-1 ml-1">{{unit}}</span>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <div class="city-indicator" v-on="on">{{$store.getters.dataByCityYear[figure] || getDataByCityYear[figure]}}</div>
        </template>
        <span>East Jerusalem</span>
      </v-tooltip>
    </div>
    <div class="caption">{{description}}</div>
  </v-flex>
  <v-flex xs12 sm8>
    <bar-vertical
    v-bind:chart-data="prepBarChartData(figure,$store.state.neighbourhood)"
    class="bar-chart-minimal"
    v-bind:click-handler="true"
    v-bind:x-labels="false"
    v-bind:y-labels="false">
  </bar-vertical>
</v-flex>
<v-flex v-if="showText"pa-3 pt-4>
  Lorem ipsum dolor sit amet, id principes honestatis sadipscing eum, malorum ceteros percipitur ea qui. Omnesque postulant eu quo, ei mei wisi vituperata repudiandae. No est meliore consulatu, ut duo harum animal electram. Recteque mediocritatem ad per, vis ei noster consequuntur, ut agam prompta assueverit ius. Falli phaedrum dissentiunt nam eu. In atqui praesent deseruisse pro, cu insolens torquatos pro. Consul delectus eam id, ius scripta senserit no, vis ad agam repudiare.
  <br><br>
  <div class="grey--text text--darken-2">
  Source: JIIS {{ year || $store.state.year }} <span style="float:right"><v-icon>save_alt</v-icon> Download data</span>
  </div>
</v-flex>
</v-layout>
</template>

<script>

import BarVertical from '../plugins/barVertical.js'
import colors from 'vuetify/es5/util/colors'

export default {
  components: {
    BarVertical
  },
  data () {
    return {
      showText : false
    }
  },
  props: ['name','figure','description','unit','noChart','small','year'],
  methods : {
    prepBarChartData(key,neighbourhood) {
      //console.log(this.$store.getters.dataByYear)
      if (!this.thisYear) {
        console.log('cannot find year')
        return;
      }
      const color = this.$vuetify.theme.tertiary;
      let citydata = this.$store.getters.dataByYear
      citydata = (citydata[0] && !citydata[0][key]) ? this.getDataByYear : citydata
      const sorted = citydata.sort((a,b)=>a[key]-b[key])
      const label = this.$props.name
      return {
        labels: sorted.map(x=> x.name),
        area_code: neighbourhood,
        datasets :[{
          label: label,
          backgroundColor: sorted.map(x=> {
            return x.area_code === neighbourhood ? color : colors.grey.lighten3;
          }),
          data: sorted.map(x=> {return x[key]})
        }]
      }
    },
    updateIndicator(figure,item) {
      this.showText = !this.showText;
      console.log(item);
      this.$store.commit("UPDATE",{key:['navigator','indicator'],value:figure})
    }
  },
  computed : {
    thisYear () {
      return this.$props.year || this.$store.state.year
    },
    getDataByHoodYear () {
      //return {}
      return this.$store.getters.dataByNeighbourhood.filter(x=>x.year===this.thisYear)[0] || {}
    },
    getDataByCityYear () {
      //return {}
      return this.$store.state.cityIndicators.filter(x=>x.year===this.thisYear)[0] || {}
    },
    getDataByYear () {
      //return {}
      return this.$store.state.indicators.filter(x=>x.year===this.thisYear) || []
    }
  }
}
</script>

<style>
.city-indicator, .city-indicator-small {
  margin-left:10px;
  text-decoration: underline var(--v-primary-base);
  font-weight:bold;
  color: var(--v-primary-base);
  display:inline;
}
.city-indicator-small:hover {
  cursor:pointer;
}
.city-indicator:hover {
  cursor:pointer;
}
.city-indicator-small {
 font-size:18px;
 vertical-align: top;
}
.city-indicator {
  font-size:20px;
  vertical-align: top;
}
.indicator-hover {
  border-left: 3px solid #fff0;
  padding-left:10px;
  margin-left:-10px;
}
.indicator-hover:hover {
  border-left: 3px solid #000;
  background-color: #fff;
  cursor:pointer;
}
</style>
