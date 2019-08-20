import { chart } from './ejmapChart.js'
import { Line, mixins } from  'vue-chartjs'
const {reactiveProp} = mixins

export default {
  extends: Line,
  mixins: [chart,reactiveProp],
  mounted () {
    //this.options.type = 'line'
    this.options.scales.xAxes[0].scaleLabel = {
      fontSize:7,
      lineHeight:0.8,
      padding:0,
    }
    this.options.scales.xAxes[0].time = {
      bounds : 'ticks',
      source: 'auto',
      stepSize:5,
      tooltipFormat:'MMM YYYY'
    }
    this.options.title.display = false
    this.options.scales.xAxes[0].position = 'top'
    this.options.scales.xAxes[0].type = 'time'
    this.options.scales.xAxes[0].distribution = 'linear'
    this.options.scales.xAxes[0].ticks.display = true
    this.options.scales.xAxes[0].gridLines.display = true
    this.options.animation = false

    //this.opetions.scales.yAxes[0].ticks = false
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    this.renderChart(this.chartData, this.options)
    //console.log(this);
  }
}
