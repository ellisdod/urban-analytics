<template>
        <map-view
        v-if="$store.state._col_features"
        contextmenu=""
        style="position:relative;height:400px;"
        :height="legendBottom ? '80%' : ''"
        :featureLayers="$store.state._col_layers_selected"
        featuresCollection="features"
        zoomLevel="12"
        :editable="false"
        :allLayers="true"
        :legendBottom="legendBottom"
        v-bind:options="{legendStyle:legendStyle,areaSelect:true,mapStyle:mapStyle}"
        >
      </map-view>
</template>

<script>
import MapView from './MapView.vue'

export default {
  components: {
    MapView
  },
  computed : {
    legendBottom () {
      return this.$vuetify.breakpoint.xsOnly
    },
    mapStyle () {
      return {
        flexDirection:'row-reverse',
      }
    },
    legendStyle (){
      const self = this
      return {
        maxHeight: '100%',
        width:self.legendBottom ? '100%':'25%',
        maxWidth:self.legendBottom ? 'auto':'300px',
        minWidth:self.legendBottom ? '100%':'200px',
        left:0,
        borderRight:self.legendBottom ? 'none':'1px solid #e3e3e3',
        backgroundColor: '#fff',
      }
    }
  }
}
</script>
<style>
</style>
