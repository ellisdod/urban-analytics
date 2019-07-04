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
          console.log('chartoutput',item[0]);
          //console.log('chartoutput',item[0]);
          //if(self.$props.clickHandler){
          //  const code = self.$store.getters.dataByYear.filter(x=>x.name===item[0]._model.label)[0].area_code
          //  self.$store.commit('UPDATE_AREA',code)
          //}
          if(self.$props.clickHandler){
            const area = self.$store.getters.selectedAreas.filter(x=>x.feature.properties.name===item[0]._model.label)[0].feature.properties
            console.log('chartoutput',item[0]);
            self.$store.commit('UPDATE',{key:'neighbourhood',value:area.areaCode});
            self.$store.commit('UPDATE',{key:['map','zoom'],value:15});
            //console.log('changed',this.$store.state.neighbourhood);
            console.log('coords',e.target._map.getCenter());
            self.$store.commit('UPDATE',{
              key:['map','center'],
              value: {
                lon:area.centroid_lng,
                lat:area.centroid_lat
              }
            })
          }
        }
      }
    }
  }
}
