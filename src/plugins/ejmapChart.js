export const chart = {
  props:{
    'title': String,
    'x-labels':Boolean,
    'y-labels':Boolean,
    'clickHandler':Boolean
  },
  data () {
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
          //console.log('chartoutput',item[0]);
          if(self.$props.clickHandler){
            const code = self.$store.getters.dataByYear.filter(x=>x.name===item[0]._model.label)[0].area_code
            self.$store.commit('UPDATE_AREA',code)
          }
        }
      }
    }
  }
}
