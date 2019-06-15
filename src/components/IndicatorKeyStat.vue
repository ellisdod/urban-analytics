<template>
  <v-card v-bind:flat="!selected" class="indicator-hover">

  <div v-if="type === 'List' && selectedIndicator">
    <v-list>
      <v-list-item v-for="(val,key) in selectedIndicator[figure[0]]">
        <v-list-tile-action>
          {{key}}
        </v-list-tile-action>
        <v-list-tile-content>
          {{val}}
        </v-list-tile-content>
      </v-list-item>
    </v-list>
  </div>

  <!-- WITH CHART -->
  <div v-else-if="selectedIndicator" class="pa-2" style="position:relative;" @click="updateIndicator()">

    <div class="subheading font-weight-light" style="width:40%;">{{name}}</div>


    <div v-if="type==='Figure'" style="overflow-x: visible; display: inline-block; white-space: nowrap;">
      <span class="display-1 py-0">{{selectedIndicator[figure[0]]}}</span>
      <span v-if="unit" class="subheading ml-1">{{unit}}</span>
      <div class="font-weight-light">{{year}}</div>
    </div>
    <div class="caption">{{description}}</div>

    <div v-if="dataYears" class="px-1" style="position: absolute; top: -10px; right:15px; width:50%;">
      <v-slider
      color="grey lighten-2"
      track-color="transparent"
      always-dirty
      inverse-label
      :tick-labels="dataYears"
      v-model="selectedYear"
      ticks="always"
      v-bind:tick-size="2"
      :min="dataYears[0]"
      :max="dataYears[dataYears.length-1]"
      >
    </v-slider>
   </div>

    <div v-bind:style="chartWidthClass">

    <bar-vertical v-if="type==='Figure'"
    style="margin-top:0px;"
    v-bind:chart-data="prepBarChartData"
    class="bar-chart-minimal"
    v-bind:click-handler="true"
    v-bind:x-labels="false"
    v-bind:y-labels="false">
    </bar-vertical>

  <bar-vertical v-else-if="type==='Chart' && selectedIndicator"
  style="height:300px; margin-bottom:-30px;"
  v-bind:x-labels="true"
  v-bind:y-labels="true"
  v-bind:chart-data="generateChartDataSets">
  </bar-vertical>
</div>

<div class="text-xs-right" style="margin-right:-18px;clear:both;display:block;margin-bottom: -10px;">
  <v-btn icon @click="toggleExpand()"><v-icon color="grey" :style="rotateStyle">keyboard_arrow_down</v-icon></v-btn>
</div>
<div v-if="expand" class="pa-2">
  Lorem ipsum dolor sit amet, id principes honestatis sadipscing eum, malorum ceteros percipitur ea qui. Omnesque postulant eu quo, ei mei wisi vituperata repudiandae. No est meliore consulatu,e.
  <br><br>
  <div class="grey--text text--darken-2">
    Source: JIIS {{ year || $store.state.year }} <span style="float:right"><v-icon>save_alt</v-icon> Download data</span>
  </div>
</div>

</div>
</v-card>
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
      expand : false,
      rotation : 0,
      selectedYear : '',
    }
  },
  props: ['name','figure','description','unit','type','small','noChart','selected'],
  methods : {
    log() {
      console.log('data',this)
      console.log('store',this.$store.state)
      //console.log(this.$store.getters.selectedFeature)
    },
    toggleExpand() {
      this.expand = !this.expand
      this.rotation = this.rotation === 0 ? 180 : 0
    },
    updateIndicator() {
      this.log()
      if (!this.figure[0] || !this.year) return null
      this.$store.commit("UPDATE",{key:['navigator','indicator'],value:{figure:this.figure[0],name:this.name}})
      this.$store.commit("UPDATE",{key:'year',value:this.year})
    },
    getNested (p, o) {
      p = typeof p === 'string' ? p.split('.') : p
      if (!p) return o
      const n =  p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)
      //console.log('nested',n)
      return n
    },
    validateYear(val) {
      let year = val
      for (var x=0;x<this.dataYears.length;x++){
        if (this.dataYears.indexOf(year)===-1) {
          year ++
        } else {
          this.year = year
          break;
        }

      }
    }
  },
  computed : {
    rotateStyle () {
      return {transform: 'rotate('+this.rotation+'deg)'}
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
    },
    areaDataMatched () {
      const areas = this.$store.getters.indicatorsForSelectedArea
      if (!areas) return null
      const matched = areas.reduce((acc,x)=>{
        if (this.figure.some(f=>x[f])) acc.push(x)
        return acc
      },[])
      console.log('areaDataMatched',matched)
      return matched
    },
    areaDataLatest () {
      console.log('something')
      if (!this.areaDataMatched) return null
      return this.areaDataMatched[this.areaDataMatched.length-1]
    },
    latestYear () {
      if (this.areaDataLatest) {
        console.log('arealatest', this.areaDataLatest)
        return this.selectedYear
      }
    },
    year () {
      return this.selectedYear || this.latestYear
    },
    selectedIndicator () {
      if (!this.dataYears || !this.selectedYear) return {}
      return this.areaDataMatched[this.dataYears.indexOf(this.selectedYear)]
    },
    dataYears () {
      if (!this.areaDataMatched) return null
      return this.areaDataMatched.map(x=>x.year)
    },
    generateChartDataSets() {
      if (this.type !== 'Chart' || !this.selectedIndicator) {
        console.log('chart data test', this.selectedIndicator)
        return null
      }
      //console.log('chartdata', this.figure.map(x=>this.selectedIndicator[x]))
      return {
        datasets :[
          {
            //label:store.state.neighbourhood,
            data: this.figure.map(x=>this.selectedIndicator[x]),
            borderColor: '#000',
            type:"line",
            fill:false,
          }
        ],
        labels:this.figure
      }
    },
    chartWidthClass(){
      let baseStyle = {position:'relative',float:'right'}
      const changeStyle = this.type === 'Chart' ? {width:'100%'} : {width:'70%', marginTop:'-60px'}
      return Object.assign(baseStyle,changeStyle)
    },
    prepBarChartData() {
      //console.log(this.$store.getters.dataByYear)
      if (!this.type === ' Figure') return {}
      const key = this.figure
      const neighbourhood = this.$store.state.neighbourhood
      const color = this.$vuetify.theme.tertiary;
      let citydata = this.$store.getters.allIndicatorsByYear
      console.log('citydata',citydata)
      if (!citydata || !this.year) return {};
      citydata = citydata[this.year]
      console.log('citydata.year',citydata,this.year)
      //citydata.forEach((x,y)=> citydata[y][key] = parseInt(x[key]))
      citydata = citydata.map(x=>{
        x[key] = x[key] || 0
        return x
      })
      const sorted = citydata.sort((a,b)=> (!b[key])-(!a[key]) || +(a[key]>b[key])||-(a[key]<b[key]))
      const label = this.name
      console.log('sorted',sorted)
      return {
        labels: sorted.map(x=> x.name),
        area_code: neighbourhood,
        datasets :[{
          label: label,
          backgroundColor: sorted.map(x=> {
            return x.area_code === neighbourhood ? color : colors.grey.lighten2;
          }),
          data: sorted.map(x=> {return x[key]})
        }]
      }
    },
  },
  mounted (){
    if (this.areaDataLatest) this.selectedYear = this.areaDataLatest.year
    if (this.selected) this.updateIndicator()
  //  if (this.selectedIndicator) console.log('selected data:',this.selectedIndicator[this.figure[0]])
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

.indicator-hover:hover, .indicator-hover:hover>div {
  cursor:pointer;
  background-color:#fff6e6;
}
.indicator-hover:hover .v-slider__thumb {
  background-color:var(--v-primary-base)!important;
}

.indicator-hover:hover .display-1 {
  color:var(--v-primary-base)!important;
}
.v-slider__ticks span {
  font-size:0.70em;
}
.v-slider__thumb {
  width: 10px;
  height: 10px;
  left: -6px;
}
.v-slider__thumb:hover {
  width: 24px;
  height: 24px;
  left: -12px;
}

</style>
