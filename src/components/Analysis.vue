<!-- HTML Template -->

<template>
  <v-card class="pa-2">

    <v-card-title primary-title>
      <div class="headline mb-0">Analysis</div>
    </v-card-title>
    <v-card-text>

    <!--UPLOAD-->
    <v-select
    name="layer"
    :items="layers"
    label="Layer"
    v-model="layerSelected"
    @change="complete=false"
    ></v-select>

    <v-select
    name="areaLayer"
    :items="areaLayers"
    label="Area"
    v-model="areaLayerSelected"
    @change="complete=false"
    ></v-select>

  </v-card-text>


    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="grey lighten-1" dark depressed @click="close()">{{ complete? "Close" : "Cancel" }}</v-btn>
      <v-btn color="blue" dark depressed :loading="processing" @click="updateAnalysis()">
        <v-icon v-if="complete">done</v-icon>
        <template v-else>Analyse</template>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
//TODO use this https://github.com/websanova/vue-upload
import api from '@/api.js'
import displayMessage from '../mixins/message.js'
const dbConfig = require('@/db.config')

export default {
  props : ['layer', 'areaLayer', 'layerCollection'],
  mixins: [displayMessage],
  data() {
    return {
      processing : false,
      complete: false,
      layerSelected : "",
      areaLayerSelected:"",
      resultMessage:"",
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
        this.processing = false
        this.complete = true
        this.$store.dispatch('UPDATE_COLLECTION',{name:'indicators',layer:this.$store.state._col_areaLayers_selected})
      })
      .catch(err=>{
        this.processing = false
        this.displayMessage(err)
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
