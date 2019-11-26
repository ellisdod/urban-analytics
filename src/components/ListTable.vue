<!-- HTML Template -->

<template>
  <v-card flat>
    <slot></slot>
     <v-list dense class="list-table">
         <v-list-tile class="list-table" v-for="(key, index) in keys"
                     :key="index">
           <v-list-tile-content>
             <v-list-tile-title v-text="key.split('.').slice(-1)[0]"></v-list-tile-title>
           </v-list-tile-content>
           <v-list-tile-avatar>
             <v-list-tile-title v-text="indicator[key]"></v-list-tile-title>
           </v-list-tile-avatar>
         </v-list-tile>
     </v-list>
 </v-card>
</template>

<script>
//import ChartDataLabels from 'chartjs-plugin-datalabels'
//import OuterLabels from  'chartjs-plugin-piechart-outlabels'

export default {
  props : ['figure'],
  data () {
    return {}
  },
  computed : {
    indicator () {
      return this.$store.getters.selectedIndicator
    },
    keys () {
      if (!this.indicator) {
        return []
      } else if (this.figure.length>1){
        return this.figure
      } else {
        return Object.keys(this.indicator).filter(x=>x.indexOf(this.figure[0])>-1)
      }
    }
}
}
</script>
<style>

.list-table.v-list--dense .v-list__tile__title, .list-table.v-list--dense div.v-list__tile{
  height:24px;
}


</style>
