import { chart } from './ejmapChart.js'
import { Doughnut, mixins } from  'vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ChartOutLabels from 'chartjs-plugin-piechart-outlabels';
const {reactiveProp} = mixins


export default {
  extends: Doughnut,
  mixins: [reactiveProp,chart],
  props:{
    'outlabels' : Boolean,
    'padding' : Array
  },
  computed : {
    paddingStyle () {
      let style = {
        top:50,
        right: 50,
        bottom: 100,
        left: 50,
      }
      if (Array.isArray(this.padding)) Object.keys(style).reduce((acc,key,index)=>{
         acc[key] = this.padding[index] === 'undefined' ? acc[key] : parseInt(this.padding[index])
         return acc
      },style)
      return style
    }
  },
  mounted () {
    let self = this
    this.addPlugin(ChartDataLabels)
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    const options = Object.assign(this.options, {
      layout: {
        padding: this.paddingStyle,
      },
      plugins : {
        outlabels : {
          text : '%l',
        /*  backgroundColor : null,
          borderColor: '#e3e3e3',
          borderWidth:1,
          borderRadius:2,
          padding:4,
          lineColor: '#e3e3e3',
          lineWidth: 1, */
          color: 'white',
          font : {
            size : '18'
          },
          display : function(context) {
            return  self.outlabels&&context.dataset.data[context.dataIndex] ? true : false
          }
        },
        datalabels : {
          color: 'white',
          font : {
            weight : 'bold'
          },
          formatter : function(value, context) {
            //console.log('context.dataset.data', context.dataset)
            const total = context.dataset.data.reduce((acc,x)=>acc + x,0)
            const pc = context.dataset.data[context.dataIndex]/total * 100
            return pc > 2 ? pc.toFixed(0)+'%' : ''
          }
        }
      }
    })
    this.renderChart(this.chartData, options)
    //console.log(this);
  }
}
