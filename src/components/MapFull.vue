<template>
        <map-view
        v-if="$store.state._col_features"
        contextmenu=""
        style="position:relative;height:400px;"
        height=""
        :featureLayers="$store.state._col_layers_selected"
        featuresCollection="features"
        zoomLevel="12"
        v-bind:allLayers="true"
        v-bind:options="{legendStyle:legendStyle,areaSelect:true,mapStyle:{flexDirection:'row-reverse'}}"
        >
      </map-view>
</template>

<script>
import MapView from './MapView.vue'

export default {
  components: {
    MapView
  },
  data () {
    return {
      legendStyle : {
        height: '100%',
        maxHeight: '100%',
        width:'25%',
        maxWidth:'300px',
        minWidth:'200px',
        left:0,
        borderRight:'1px solid #e3e3e3',
        backgroundColor: '#fff',
      }
    }
  }
}
</script>
<style>
</style>
