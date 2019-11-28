<!-- HTML Template -->

<template>
  <div v-if="indicator[keys[0]]!==null&&indicator[keys[0]]!==undefined">
  <div class="pl-2"><slot></slot></div>
  <div>
  <chart-doughnut
  :chart-data="prepData"
  :x-labels="false"
  :y-labels="false"
  :showLegend="false"
  :outlabels="outlabels"
  :padding="padding"
  :style="{height:height}"
  ></chart-doughnut>
</div>
</div>
</template>

<script>
import chartDoughnut from '../plugins/chartDoughnut.js'
import colors from 'vuetify/es5/util/colors'
//import ChartDataLabels from 'chartjs-plugin-datalabels'
//import OuterLabels from  'chartjs-plugin-piechart-outlabels'

export default {
  props : ['name','figure','selected','year','compact','outlabels','padding','height','dateRange'],
  components: {
    chartDoughnut
  },
  data () {
    return {
      defaultStyle : {
        fillColor:'#999',
        borderColor : '#555',
      }
    }
  },
  computed : {
    indicator () {
      return this.$store.getters.selectedIndicator
    },
    layer () {
      return this.figure[0].split('.')[0]
    },
    attribute () {
      return this.figure[0].split('.')[1]
    },
    keys () {
      if (!this.indicator) {
        return []
      } else if (this.figure.length>1){
        return this.figure
      } else {
        return Object.keys(this.indicator).filter(x=>x.indexOf(this.figure[0])>-1)
      }
    },
    keyNames () {
      return this.keys.map(x=>x.split('.').slice(-1)[0])
    },
    dateRangeIndicator () {
      if (!this.dateRange||!this.dateRange.length>1) return
      const areaIndicators = this.$store.getters.allIndicatorsByArea[this.$store.state.neighbourhood]
      areaIndicators.filter(x=>x.year>=this.dateRange[0] && x.year<=this.dateRange[1])
      return areaIndicators.reduce((acc,x)=>{
        Object.keys(x).forEach(key=>{
          if (key.indexOf(this.figure[0])===-1) return
          acc[key] = acc[key] || 0
          acc[key] = acc[key] + x[key]

        })
        return acc
      },{})
    },
    style () {
      return this.$store.getters.styles[this.layer][this.attribute] || this.defaultStyle
    },
    colors () {
      return this.keyNames.map(x=>{
        x = x === 'unknown' ? '__d' : x
        if (!this.style[x]) return '#999'
        const fill = this.style[x].style.fillColor
        return  fill.slice(7,9)==='00' ? this.style[x].style.borderColor : fill
      })
    },
    labels () {
      return this.keyNames.map(x=>{
        return this.style[x] ? this.style[x]['_text_'+this.$store.state.language] || x : x
      })
    },
    prepData() {
      //console.log(this.$store.getters.dataByYear)

      if (!this.indicator) return null
      const neighbourhood = this.$store.state.neighbourhood
      const label = this.name
      const highlight = this.selected ? this.$vuetify.theme.primary : colors.grey.lighten1

      return {
        labels: this.labels,
        area_code: neighbourhood,
        datasets :[{
          label: label,
          borderWidth:1,
          backgroundColor:this.colors,
          borderColor: colors.grey.lighten3,
          data: this.keys.map(x=>this.dateRangeIndicator ? this.dateRangeIndicator[x] : this.indicator[x])
        }]
      }
    },
  }
}
</script>
<style>
</style>
