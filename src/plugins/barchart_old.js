import { Bar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Bar,
  mixins: [reactiveProp],
  props:{
    'title': String,
    'x-labels':Boolean,
    'y-labels':Boolean,
    'clickHandler':Boolean
  },
  data: function() {
    const self = this;
    return {
      options: {
        axes: {
          display:false
        },
        scales: {
          yAxes: [{
            display:self.$props.yLabels,
            gridLines:{
              display:false
            },
            scaleLabel: {
              display:self.$props.yLabels
            },
            ticks:{
              display:self.$props.yLabels
            }
          }],
          xAxes: [{
            display:self.$props.xLabels,
            gridLines:{
              display:false
            },
            scaleLabel: {
              display:self.$props.xLabels
            },
            ticks:{
              display:self.$props.xLabels
            }
          }]
        },
        legend: {
          display:false
        },
        title: {
          display:true,
          text:self.$props.title||''
        },
        maintainAspectRatio:false,
        onClick: function(evt,item){
          console.log(self.$props);
          if(self.$props.clickHandler){
            self.$store.commit('UPDATE',{
              key:'neighbourhood',
              value: item[0]['_model'].label
            })
          }
        }
      }
    }
  },
  mounted () {
    let localThis = this;
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    this.renderChart(this.chartData, this.options)
    //console.log(this);
  }
}
