import { chart } from './ejmapChart.js'
import { Doughnut, mixins } from  'vue-chartjs'
const {reactiveProp} = mixins

export default {
  extends: Doughnut,
  mixins: [reactiveProp,chart],
  mounted () {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    const options = Object.assign(this.options, {layout: {
            padding: {
                top: 100,
                right:30,
            }
        }
      })
    this.renderChart(this.chartData, this.options)
    //console.log(this);
  }
}
