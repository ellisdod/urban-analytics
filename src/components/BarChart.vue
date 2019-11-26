<!-- HTML Template -->
<template>
  <div class="pa-3">
    <slot></slot>
    <bar-horizontal
    style="height:300px; margin-bottom:-40px;"
    :x-labels="true"
    :y-labels="true"
    :showLegend="true"
    :chart-data="chartData">
  </bar-horizontal>
  </div>

</template>

<script>
import IndicatorKeyStat from './IndicatorKeyStat.vue'
import BarVertical from '../plugins/barVertical.js'
import BarHorizontal from '../plugins/barHorizontal.js'
import colors from 'vuetify/es5/util/colors'

export default {
  components : {
    IndicatorKeyStat,BarVertical, BarHorizontal
  },
  extends: IndicatorKeyStat,
  methods : {
    validate (e) {
      const lastItem = this.formula[this.formula.length-1]
      return !(lastItem&&this.operators.indexOf(lastItem.text)>-1&&this.operators.indexOf(e)>-1)
    },
    getPercentages(values) {
      const total = values.reduce((a,b) => a + b, 0)
      return values.map(a=>a/total*100)
    }
  },
  computed : {
    dataSetAverage() {
      const latestYear = this.dataYears.slice(-1)[0]
      const areas = Object.keys(this.$store.getters.allIndicatorsByAreaYear)
      const totals = areas.reduce((acc,area)=>{
        this.figure.forEach((x,index)=> {
           acc[index]=acc[index] + this.$store.getters.allIndicatorsByAreaYear[area][latestYear][x]
        })
        return acc
      },this.figure.map(x=>0))

        return {
          //label:store.state.neighbourhood,
          data: this.getPercentages(totals.map(x=>x/areas.length)),
          borderColor: this.selected ? this.$vuetify.theme.primary : this.$vuetify.theme.grey,
          borderWidth: 0.5,
          borderOpacity: 0.2,
          backgroundColor : colors.grey.lighten3,
          type:"horizontalBar",
          fill:true,
          label:'Average',
          pointRadius: 0,
        }
    },
    selectedDataSet() {
        return {
          //label:store.state.neighbourhood,
          data: this.getPercentages(this.figure.map(x=>this.selectedIndicator[x])),
          borderColor: colors.grey.lighten2,
          borderWidth: 1,
          borderOpacity: 1,
          backgroundColor : colors.grey.darken3,
          type:"horizontalBar",
          fill:true,
          pointRadius: 1,
          label:this.$store.getters.selectedArea.feature.properties.text_en
        }
    },
    chartData() {
      if (!this.selectedDataSet) return null
      //console.log('this.$store.getters.allIndicatorsByAreaYear',this.$store.getters.allIndicatorsByAreaYear)
      return {
        datasets : [this.selectedDataSet, this.dataSetAverage],
        labels: this.attributes || this.figure.map(x=> x.split('.').slice(-1)[0] )
      }
},
  },
}
</script>

<style>
.break {
  flex-basis:100%;
  height:0;
}
</style>
