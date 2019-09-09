<template>

  <v-card style="background:none" flat v-bind:class="[{selected : selected && $vuetify.breakpoint.smAndUp}]" @click="updateIndicator()">

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
    <v-layout align-center wrap v-else-if="type === 'Figure' && selectedIndicator" v-bind:class="{'pa-3':!compact,'pa-2':compact}" style="position:relative;background:white;">

      <v-flex align-center order-xs1 xs4 v-bind:style="{display:compact ? 'flex':'block'}" v-bind:class="{'xs8 sm8 md8':compact,'sm4':!compact, }">

        <div v-bind:style="{minWidth:compact ?'180px':0}" v-bind:class="[{'body-1':compact,'subheading':!compact },'font-weight-light']">
          {{name}}
        </div>

        <div v-if="type==='Figure'" style="overflow-x: visible; display: inline-block; white-space: nowrap;">
          <span v-bind:class="[{'display-1':!compact,'subheading':compact},'py-0']">
            {{selectedIndicator[figure[0]]||0}}
          </span>
          <span v-if="unit" v-bind:class="[{'subheading ml-1':!compact,'caption':compact}]">
            {{unit}}
          </span>
        </div>

        <div v-bind:class="[{'caption pl-2':compact},'font-weight-light']">{{ selectedYear&&selectedYear!==$store.state.year ? '(' + selectedYear + ')' : '' }}</div>

      </v-flex>

      <v-flex order-xs3 order-sm2 sm-offset-4 pt-3 v-bind:class="{
        'mb-5':selected && $vuetify.breakpoint.smOnly && !compact,
        'my-3':selected && $vuetify.breakpoint.xsOnly && !compact,
        'xs-offset2 sm8 md4':!compact,
        'xs4 sm4 md4':compact }">

        <div v-bind:style="chartWidthClass">

          <comparative-chart v-if="type==='Figure'"
          :name="name"
          :figure="figure"
          :year="selectedYear"
          :selected="selected||compact"
          :compact="compact"
          >
         </comparative-chart>

    </div>

  </v-flex>

  <v-flex v-if="!compact" order-xs2 xs8 offset-xs0 order-sm3 offset-md1 md3 mt4 v-bind:class="{'hidden-sm-and-down':!selected}">

    <v-sparkline
    :value="timeChartData"
    :color="chartColor"
    height="70"
    smooth
    stroke-linecap="square"
    line-width="8"
    width="700"
    >
  </v-sparkline>

  <v-slider
  style="width:100%;margin-top:0px;margin-bottom:-30px;"
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

</v-flex>
</v-layout>

<div v-else-if="type==='Chart'" class="pa-3" style="background:white;">
<div class="subheading font-weight-light">{{name}}</div>
<bar-vertical
style="height:300px; margin-bottom:-40px;"
v-bind:x-labels="true"
v-bind:y-labels="true"
v-bind:chart-data="generateChartDataSets">
</bar-vertical>
</div>



<!--<v-flex xs12 class="text-xs-right" style="margin-top:-40px;height:0;">
<v-btn icon><v-icon color="grey" :style="rotateStyle">keyboard_arrow_down</v-icon></v-btn>
</v-flex>-->
<div v-if="selected" class="pa-3 ejmap-border-top" style="background-color:white">

  <v-flex xs12 class="grey--text text--darken-1">
    <div><span>Source:</span><a :href="layer.sourceUrl">{{layer.sourceShort}}</a></div>
    <div><span>Notes:</span>{{description}}</div>
  </v-flex>



  <v-tooltip bottom open-delay="100">
      <template v-slot:activator="{ on }">
        <v-btn style="position:absolute;bottom:5px;right:5px;" icon @click="exportToCsv"  v-on="on">
          <v-icon color="grey">get_app</v-icon>
        </v-btn>
      </template>
      <span>Download data</span>
  </v-tooltip>

</div>



</v-card>
</template>

<script>
import ComparativeChart from './ComparativeChart.vue'
import BarVertical from '../plugins/barVertical.js'
import colors from 'vuetify/es5/util/colors'

export default {
  components: {
    BarVertical, ComparativeChart
  },
  data () {
    return {
      expand : false,
      rotation : 0,
      selectedYear : '',
    }
  },
  props: ['name','figure','description','unit','type','small','noChart','selected','compact'],
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
      //console.log('labels',labels,years)
      return labels
    },
    clickHandler(){
      //console.log('click')
    },
    toggleRotate() {
      if (!this.selected) this.rotation = this.rotation === 0 ? 180 : 0
    },
    updateIndicator() {
      this.$emit('childClick')
      if (!this.figure[0] || !this.selectedYear || this.figure[1]) return null
      this.$store.commit("UPDATE",{key:['navigator','indicator'],value:{figure:this.figure[0],name:this.name}})
      this.$store.commit("UPDATE",{key:'year',value:this.selectedYear})
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
    },
    exportToCsv() {
        var processRow = function (row) {
            var finalVal = '';
            for (var j = 0; j < row.length; j++) {
                var innerValue = row[j] === null ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                };
                var result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0)
                    result = '"' + result + '"';
                if (j > 0)
                    finalVal += ',';
                finalVal += result;
            }
            return finalVal + '\n';
        };

        const figure = this.figure[0]
        const title = this.unit ? `${this.name} (${this.unit})` : this.name
        let indicators = this.$store.getters.allIndicatorsByAreaYear
        let rows = [
          [title],
          ['Source', this.layer.sourceLong || '' ],
          ['Link', this.layer.sourceUrl || '' ],
          ['-'],
          ['Name','Code',...this.dataYears],
        ]
        //console.log(figure)

        rows = Object.keys(indicators).reduce((arr,areaCode)=>{
          const areaName = this.$store.getters.areaNames[areaCode]
          const row = [areaName, areaCode]
          this.dataYears.forEach(year=>{
            const val = indicators[areaCode][year][figure] || ''
            row.push(val)
          })
          arr.push(row)
          return arr
        },rows)

        const filename = this.name.toLowerCase().replace(/[\s\.]/g,'_') + '.csv'

        var csvFile = '';
        for (var i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
  },
  computed : {
    chartColor () {
      return this.selected ? this.$vuetify.theme.primary : colors.grey.lighten2
    },
    layer () {
      const layerId = this.figure[0].split('.')[0]
      const layer = this.$store.state._col_layers.filter(x=>x._id===layerId)[0]
      return layer || {}
    },
    rotateStyle () {
      return {transform: 'rotate('+this.rotation+'deg)'}
    },
    areaDataMatched () {
      if (!this.dataYears) return null
      return this.$store.getters.indicatorsForSelectedArea.filter(x=>this.dataYears.some(f=>x.year===f))
      if (!areas) return null
      const matched = areas.reduce((acc,x)=>{
        if (this.figure.some(f=>x[f])) acc.push(x)
        //acc.push(x)
        return acc
      },[])
      //console.log('areaDataMatched',matched)
      return matched
    },
    areaDataLatest () {
      if (!this.areaDataMatched) return null
      return this.areaDataMatched[this.areaDataMatched.length-1]
    },
    selectedIndicator () {
      if (!this.dataYears || !this.selectedYear) {
        return {}
      }
      let indicator =  this.areaDataMatched[this.dataYears.indexOf(this.selectedYear)]
      //console.log('selectedIndicator',indicator)
      if (!indicator) {
        indicator = {}
        indicator[this.figure[0]] = 0
      }
      return indicator
    },
    dataYears () {
      const d = this.$store.getters.allIndicatorKeyYears[this.figure[0]]
      //console.log('datayears',d,this.$store.getters.allIndicatorKeyYears,this.$store.getters.allIndicatorsByYear)
      return d || []
    },
    generateChartDataSets() {
      if (this.type !== 'Chart' || !this.selectedIndicator) return null
      const latestYear = this.dataYears.slice(-1)[0]
      const color = this.selected ? this.$vuetify.theme.primary : this.$vuetify.theme.grey
      console.log('this.$store.getters.allIndicatorsByAreaYear',this.$store.getters.allIndicatorsByAreaYear)
      return {
        datasets : Object.keys(this.$store.getters.allIndicatorsByAreaYear).map(area=>{
          const selectedArea = this.$store.state.neighbourhood === parseInt(area)
          return {
            //label:store.state.neighbourhood,
            data: this.figure.map(x=>this.$store.getters.allIndicatorsByAreaYear[area][latestYear][x]),
            borderColor: selectedArea ? color : this.$vuetify.theme.grey_lighten1,
            borderWidth: selectedArea ? 1 : 0.5,
            borderOpacity: 0.2,
            type:"line",
            fill:false,
            pointRadius: selectedArea ? 1 : 0,
          }

        }),
       labels:this.figure.map(x=> x.split('.').slice(-1)[0] )

      }
      /*
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
        labels:this.figure.map(x=> x.split('.').slice(-1)[0] )
      }
      */
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
    timeChartData () {
      const figure = this.figure[0]
      const indicators = this.$store.getters.indicatorsForSelectedArea
      const filtered = indicators.filter(x=>this.dataYears.indexOf(x.year)>-1)

      return filtered.map(x=>x[figure])
    }

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
.selected .display-1  {
  color:var(--v-primary-base);
}
.v-slider span {
  color: var(--v-grey-lighten1);
  font-size: 10px;
}
.selected .v-slider__thumb {
  background-color:var(--v-primary-base)!important;
}
.theme--light.v-input--slider .v-slider__ticks {
  font-size:0.70em;
  border-color: var(--v-grey-lighten2) !important;
}

div.v-slider__thumb{
  background-color: #bcbcbc !important;
}
div.v-slider__track-fill {
  background-color: var(--v-grey-lighten3) !important;
}
.v-slider__thumb-container div.v-slider__thumb:hover {
  width: 6px;
  height: 24px;
  left: -4px;
}
.v-slider__thumb-container div.v-slider__thumb {
    width: 6px;
    height: 20px;
    left: -4px;
    border-radius:0;
}

.v-slider__ticks-container .v-slider__ticks.v-slider__ticks--always-show {
  border-width: 1px !important;
left: 50%;
transform: translateY(2px) !important;
height: 5px;
width: 1px;
border-left: none;
padding-top:3px;
}

.v-slider .v-slider__track__container {
  border: 1px solid #e3e3e3;
}

.v-slider .v-slider__track__container, .v-slider .v-slider__track, .v-slider .v-slider__track-fill {
  height:6px;
}


</style>
