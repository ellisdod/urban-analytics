<!-- HTML Template -->

<template>
  <bar-vertical
  v-bind:chart-data="prepBarChartData()"
  v-bind:class="{'bar-chart-minimal':!compact,'bar-chart-minimal-small':compact}"
  v-bind:click-handler="true"
  v-bind:x-labels="false"
  v-bind:y-labels="false">
 </bar-vertical>
</template>

<script>
import BarVertical from '../plugins/barVertical.js'
import colors from 'vuetify/es5/util/colors'

export default {
  props : ['name','figure','selected','year','compact'],
  components: {
    BarVertical
  },
  data () {
    return {
    }
  },
  methods : {
    prepBarChartData() {
      //console.log(this.$store.getters.dataByYear)
      const key = this.figure
      const neighbourhood = this.$store.state.neighbourhood
      const label = this.name
      const highlight = this.selected ? this.$vuetify.theme.primary : colors.grey.lighten1
      let citydata = this.$store.getters.allIndicatorsByYear
      //console.log('citydata',citydata)
      if (!citydata || !this.year) return {};
      citydata = citydata[this.year]
      //console.log('citydata.year',citydata,this.year)
      //citydata.forEach((x,y)=> citydata[y][key] = parseInt(x[key]))
      citydata = citydata.map(x=>{
        x[key] = x[key] || 0
        return x
      })
      const sorted = citydata.sort((a,b)=> (!b[key])-(!a[key]) || +(a[key]>b[key])||-(a[key]<b[key]))
      const names = this.$store.getters.areaNames
      const sleected = this.$store.getters.selectedAreas
      //console.log('sorted',sorted,names,sleected)
      return {
        labels: sorted.map(x=> names[x.areaCode]),
        area_code: neighbourhood,
        datasets :[{
          label: label,
          backgroundColor: sorted.map(x=> {
            return x.areaCode === neighbourhood ? highlight : colors.grey.lighten3;
          }),
          borderWidth:1,
          borderColor: colors.grey.lighten2,
          data: sorted.map(x=> {return x[key]})
        }]
      }
    },
  },

}
</script>
<style>
.bar-chart-minimal {
  height:100px;
}
.bar-chart-minimal-small {
  height:65px;
}
</style>
