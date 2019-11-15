<!-- HTML Template -->

<template>
  <div>
  <div class="pl-2"><slot></slot></div>
  <div>
  <chart-doughnut
  :chart-data="prepData"
  :x-labels="false"
  :y-labels="false"
  :showLegend="false"
  ></chart-doughnut>
</div>
</div>
</template>

<script>
import chartDoughnut from '../plugins/chartDoughnut.js'
import colors from 'vuetify/es5/util/colors'
//import ChartDataLabels from 'chartjs-plugin-datalabels'
import OuterLabels from  'chartjs-plugin-piechart-outlabels'

export default {
  props : ['name','figure','selected','year','compact'],
  components: {
    chartDoughnut
  },
  data () {
    return {}
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
    style () {
      return this.$store.getters.styles[this.layer][this.attribute]
    },
    colors () {
      return this.keyNames.map(x=>{
        return this.style[x] ? this.style[x].style.fillColor : '#999'
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
          data: this.keys.map(x=>this.indicator[x])
        }]
      }
    },
  }
}
</script>
<style>
</style>
