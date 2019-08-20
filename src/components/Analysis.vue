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
      <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="grey lighten-1" dark depressed @click="close()">Cancel</v-btn>
      <v-btn color="blue" dark depressed :loading="processing" @click="updateAnalysis()">Analyse</v-btn>
      </v-card-actions>
</v-card>
</template>

<script>
//TODO use this https://github.com/websanova/vue-upload
import api from '@/api.js'
const dbConfig = require('@/db.config')

export default {
  props : ['layer', 'areaLayer', 'layerCollection'],
  data() {
    return {
      processing : false,
      layerSelected : "",
      areaLayerSelected:"",
    }
  },
  methods: {
    close() {
      this.processing = false
      this.$emit('close',true)
    },
    updateAnalysis() {
      this.processing = true

    api.updateAnalysis('features',this.areaLayerSelected,{},{},this.layerSelected)
    .then((x,err)=>{
      if (err) console.log(err)
      this.processing = false
      this.$store.dispatch('UPDATE_COLLECTION',{name:'indicators',layer:this.$store.state._col_areaLayers_selected})
    })

    }
},
computed : {
  layers() {
    return this.$store.state['_col_'+this.layerCollection].map(x=>{
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
  this.layerSelected =  this.$store.state['_col_' + this.layerCollection +'_selected']
  this.areaLayerSelected = this.areaLayer || this.$store.state._col_areaLayers_selected
}
}
</script>
