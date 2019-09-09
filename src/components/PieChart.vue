<!-- HTML Template -->

<template>
  <div>
  <div class="pl-2"><slot></slot></div>
  <chart-doughnut
  :chart-data="prepData"
  :x-labels="false"
  :y-labels="false"
  :showLegend="true"
  style="margin-top:-125px"
  ></chart-doughnut>
</div>
</template>

<script>
import chartDoughnut from '../plugins/chartDoughnut.js'
import colors from 'vuetify/es5/util/colors'

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
      return this.figure.split('.')[0]
    },
    attribute () {
      return this.figure.split('.')[1]
    },
    keys () {
      if (!this.indicator) return []
      return Object.keys(this.indicator).filter(x=>x.indexOf(this.figure)>-1)
    },
    labels () {
      return this.keys.map(x=>x.split('.').slice(-1)[0])
    },
    style () {
      return this.$store.getters.styles[this.layer][this.attribute]
    },
    colors () {
      return this.labels.map(x=>{
        return this.style[x] ? this.style[x].color + '99' : ''
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
          borderColor: colors.grey.lighten2,
          data: this.keys.map(x=>this.indicator[x])
        }]
      }
    },
  }
}
</script>
<style>
</style>
