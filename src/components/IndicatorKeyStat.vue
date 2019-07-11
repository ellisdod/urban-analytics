<template>

  <v-card hover :ripple="$vuetify.breakpoint.smAndUp" raised v-bind:class="[{selected : selected && $vuetify.breakpoint.smAndUp},'indicator-hover']">

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
        <span class="display-1 py-0">{{selectedIndicator[figure[0]]||0}}</span>
        <span v-if="unit" class="subheading ml-1">{{unit}}</span>
        <div class="font-weight-light">{{year}}</div>
      </div>
      <div class="caption">{{description}}</div>

      <div v-if="dataYears" class="px-1" style="position: absolute; top: -10px; right:15px; width:50%;">
        <v-slider
        track-color="transparent"
        always-dirty
        inverse-label
        :tick-labels="makeSliderLabels(dataYears)"
        v-model="selectedYear"
        ticks="always"
        v-bind:tick-size="2"
        :min="dataYears[0]"
        :max="dataYears[dataYears.length-1]"
        z-index="500"
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
  <v-btn icon><v-icon color="grey" :style="rotateStyle">keyboard_arrow_down</v-icon></v-btn>
</div>
<div v-if="selected" class="pa-2">
  Lorem ipsum dolor sit amet, id principes honestatis sadipscing eum, malorum ceteros percipitur ea qui. Omnesque postulant eu quo, ei mei wisi vituperata repudiandae. No est meliore consulatu,e.
  <br><br>
  <div class="grey--text text--darken-2">
    Source: JIIS {{ year || $store.state.year }}
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
    makeSliderLabels (years) {
      const min = years[0]
      const max = years[years.length-1]
      const steps = max - min + 1
      const labels = []
      for (var x=0;x<steps;x++) {
        const y = min + x
        labels.push(years.indexOf(y)>-1 ? y : '')
      }
      console.log('labels',labels,years)
      return labels
    },
    log() {
      console.log('data',this)
      console.log('store',this.$store.state)
      //console.log(this.$store.getters.selectedFeature)
    },
    clickHandler(){
      console.log('click')
    },
    toggleRotate() {
      if (!this.selected) this.rotation = this.rotation === 0 ? 180 : 0
    },
    updateIndicator() {
      this.log()
      this.toggleRotate()
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
          this.selectedYear = year
          break;
        }
      }
      return true
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
      return this.$store.getters.indicatorsForSelectedArea.filter(x=>this.dataYears.some(f=>x.year===f))
      if (!areas) return null
      const matched = areas.reduce((acc,x)=>{
        if (this.figure.some(f=>x[f])) acc.push(x)
        //acc.push(x)
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
      if (!this.dataYears || !this.selectedYear) {
        return {}
      }
      let indicator =  this.areaDataMatched[this.dataYears.indexOf(this.selectedYear)]
      console.log('selectedIndicator',indicator)
      if (!indicator) {
        indicator = {}
        indicator[this.figure[0]] = 0
      }
      return indicator
    },
    dataYears () {
      const d = this.$store.getters.allIndicatorKeyYears[this.figure[0]]
      console.log('datayears',d,this.$store.getters.allIndicatorKeyYears,this.$store.getters.allIndicatorsByYear)
    return d
    },
    generateChartDataSets() {
      if (this.type !== 'Chart' || !this.selectedIndicator) {
        console.log('chart data test', this.selectedIndicator)
        return null
      }
      const color = this.selected ? this.$vuetify.theme.primary : this.$vuetify.theme.grey
      //console.log('chartdata', this.figure.map(x=>this.selectedIndicator[x]))
      return {
        datasets :[
          {
            //label:store.state.neighbourhood,
            data: this.figure.map(x=>this.selectedIndicator[x]),
            borderColor: color,
            type:"line",
            fill:false,
          }
        ],
        labels:this.figure
      }
    },
    chartWidthClass(){
      let style = {position:'relative',width:'95%'}
      if (this.type !== 'Chart') {
        style.marginTop = '-60px'
      }
      if (this.type !== 'Chart' && this.$vuetify.breakpoint.smAndUp) {
        style.marginTop = '-60px'
        style.width ='100%'
        style.paddingLeft = '0'
      }
      return style
    },
    prepBarChartData() {
      //console.log(this.$store.getters.dataByYear)
      if (!this.type === ' Figure') return {}
      const key = this.figure
      const neighbourhood = this.$store.state.neighbourhood
      const label = this.name
      const highlight = this.selected ? this.$vuetify.theme.primary : '#000'
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
      const names = this.$store.getters.areaNames
      const sleected = this.$store.getters.selectedAreas
      console.log('sorted',sorted,names,sleected)
      return {
        labels: sorted.map(x=> names[x.areaCode]),
        area_code: neighbourhood,
        datasets :[{
          label: label,
          backgroundColor: sorted.map(x=> {
            return x.areaCode === neighbourhood ? highlight : colors.grey.lighten2;
          }),
          data: sorted.map(x=> {return x[key]})
        }]
      }
    },
  },
  watch : {
    selectedYear : function(newVal,oldVal) {
      this.validateYear(newVal)
      //this.$store.commit('UPDATE',{key:['navigator','center'],value:this.$store.state.navigator.defaultCenter})
    },
    areaDataLatest : function(newVal) {
      this.selectedYear = newVal.year
    }
  },
  mounted (){
    this.$nextTick(()=>{
      if (this.areaDataLatest) {
        this.selectedYear = this.areaDataLatest.year
      } else {
        this.selectedYear = this.dataYears[this.dataYears.length -1]
      }
      if (this.selected) this.updateIndicator()
    })
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
div.selected>div {
  background-color:var(--v-grey-lighten4);
}
.selected span  {
  color:var(--v-primary-base)!important;
}
.selected .v-slider__thumb {
  background-color:var(--v-primary-base)!important;
}
.indicator-hover:hover, .indicator-hover:hover>div {
  cursor:pointer;
  background-color:var(--v-grey-lighten4);
}
.theme--light.v-input--slider .v-slider__ticks {
  font-size:0.70em;
  border-color: var(--v-grey-lighten2) !important;
}

div.v-slider__thumb{
  background-color: #bcbcbc !important;
}
div.v-slider__track-fill {
  background-color: var(--v-grey-lighten2) !important;
}
.v-slider__thumb:hover {
  width: 24px;
  height: 24px;
  left: -12px;
}

</style>
