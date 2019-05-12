import { chart } from './ejmapChart.js'
import { Bar, mixins } from  'vue-chartjs'
const {reactiveProp} = mixins

export default {
  extends: Bar,
  mixins: [reactiveProp,chart],
  mounted () {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    this.renderChart(this.chartData, this.options)
    //console.log(this);
  }
}
