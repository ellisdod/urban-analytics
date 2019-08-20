<template>
<!-- HTML Template -->
<div v-bind:style="timelineStyle">
  <div style="height:40px;" class="pa-2 grey--text text--darken-2 ejmap-border-bottom">{{title}}</div>
<v-range-slider v-if="slider&&dateRange"
   v-model="dateRange"
   :min="dateMin"
   :max="dateMax"
   thumb-label="always"
   thumb-color="rgba(0,0,0,0)"
   thumb-size="15"
   light
>
<template v-slot:thumb-label="props">
          <span style="color:black;">
            {{ props.value }}
          </span>
  </template>
</v-range-slider>
<div style="overflow-y:auto; flex:1;">
<chart-timeline class="px-3 pb-5"
v-if="chartData"
v-bind:x-labels="true"
v-bind:y-labels="false"
v-bind:chart-data="chartData"
v-bind:style="chartStyle">
</chart-timeline>
</div>
<table v-if="legend&&attributeStyle" class="caption">
  <tr v-for="(val,key) in attributeStyle.categories">
    <td class="key-icon" v-bind:style="{color:val}">●</td>
    <td class="key-figures"><span style="padding:1px 5px;" class="body-1 grey--text text--darken-2">{{key}}</span> </td>
  </tr>
</table>
</div>

</template>

<script>
//TODO use this https://github.com/websanova/vue-upload
const arrayUtils = require ('../plugins/arrayUtils')
import chartTimeline from '../plugins/chartTimeline.js'
import colors from 'vuetify/es5/util/colors'
import chroma from 'chroma-js'
import Vue from 'vue'


export default {
  props : ['features','figure','dateKey','attribute','labelKey','slider','legend','attributeStyle','title'],
  components : {chartTimeline},
  data() {
    return {
      processing : false,
      layerSelected : "",
      areaLayerSelected:"",
      dateRange: null,
      dateMin : null,
      dateMax: null,
      dateLabels:null,
    }
  },
  methods: {
    setDateRange() {
      const f = this.featuresFiltered
      if (!f[0]) return null
      const min = f[0].properties.year
      const max = f[f.length-1].properties.year
      this.dateMin = parseInt(min)
      this.dateMax =  parseInt(max)
      this.dateRange = [parseInt(min),parseInt(max)]
      //console.log('this.dateRange',this.dateRange)
      //console.log(f[f.length-1].properties)
    },
  getColor(val){
    const a = this.attributeStyle
     if (a && a.range) {
      return this.$store.state.colorScale( 1 - ((val - a.range.min)/a.range.constant)  ).hex()
    } else {
      return a.categories[val].color
    }
},
},
computed : {
  timelineStyle () {
    return {
      height: document.getElementById('map_features').clientHeight + 'px',
      display:'flex',
      flexDirection:'column',
    }
  },
  chartStyle() {
    return {
      height: this.featuresFiltered.length*15+'px',
      minHeight:this.timelineStyle.height,
      marginTop:'0px'
    }
  },
  featuresFiltered () {
    //console.log('this.features',this.features)
    const f = this.features.filter(x=>x.properties[this.figure])
    //console.log('filtered timeline items',f)
    return arrayUtils.sort(f,false,'feature.properties.year')
  },
  chartData() {
    if (!this.dateRange) return null
    //console.log('timelinelegend',this.legend)
    const settings = {
      borderColor: '#e3e3e3',
      type:"line",
      fill:false,
    }

    return {
      datasets : this.featuresFiltered.map((x,index)=>{
         const dates = x.properties[this.figure]

      return Object.assign({}, settings, {
        //borderWidth: x.properties.housing_units/10 || 1,
        label: x.properties[this.labelKey],
        borderColor: this.getColor(x.properties[this.attribute]),
        data : dates.map(i=>{
          return {
            t: i[this.dateKey],
            y: index
          }
        })
      })
    })
  }
},

},
mounted () {
  this.setDateRange()
}
}
</script>
