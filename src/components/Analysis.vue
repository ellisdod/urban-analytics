<!-- HTML Template -->

<template>
  <v-card class="pa-3">

    <!--UPLOAD-->
      <v-select
      name="layer"
      :items="layers"
      label="Layer"
      v-model="layerSelected"
      ></v-select>

      <v-select
      name="areaLayer"
      :items="areaLayers"
      label="Area"
      v-model="areaLayerSelected"
      ></v-select>

      <v-btn color="blue" dark depressed @click="updateAnalysis()">Analyse</v-btn>
</v-card>
</template>

<script>
//TODO use this https://github.com/websanova/vue-upload
import api from '@/api.js'
const dbConfig = require('@/db.config')

export default {
  props : ['layer', 'areaLayer'],
  data() {
    return {
      layerSelected : "",
      areaLayerSelected:"",
    }
  },
  methods: {
    updateAnalysis() {

    api.updateAnalysis('features',this.areaLayerSelected,{},{},this.layerSelected)

    }
},
computed : {
  layers() {
    return this.$store.state._col_layers.map(x=>{
      return {text:x.name, value:x._id}
    }) || []
  },
  areaLayers() {
    return this.$store.state._col_areaLayers.map(x=>{
      return {text:x.name, value:x._id}
    }) || []
  }
},
mounted () {
  this.layerSelected = this.layer || this.$store.state._col_areaLayers_selected
  this.areaLayerSelected = this.areaLayer || this.$store.state._col_layers_selected
}
}
</script>
