<!-- HTML Template -->

<template>
  <div>
    <!--UPLOAD-->
    <form enctype="multipart/form-data" novalidate @submit.prevent="processForm">
      <div class="dropbox pa-3" style="background-color:#fff;">

        <input type="file" ref="file" :name="uploadFieldName" @change="filesChange()" class="input-file">
        <v-select
        v-if="isSaving"
        name="function"
        :items="uploadFunctions"
        label="Function"
        v-model="uploadFunction" >
      </v-select>
      <div v-if="uploadFunction=='update'">
         <v-combobox
            v-model="update.matchExisting"
            v-bind:items="[]"
            chips
            multiple
            label="Match Keys for Existing Records"
          ></v-combobox>
          <v-combobox
              v-model="update.matchUpload"
              v-bind:items="[]"
              chips
              multiple
              label="Match Keys for Upload"
            ></v-combobox>
        <v-text-field label="Update Key" v-model="update.key"></v-text-field>
      </div>
      <v-select
      v-if=""
      name="collection"
      :items="collections"
      label="Collection"
      v-model="collection"
      ></v-select>
      <v-select
      name="layer"
      :items="layers"
      label="Layer"
      v-model="layerSelected"
      ></v-select>
      <v-select
      v-if="isSaving"
      name="format"
      :items="indicatorFormats"
      label="Format"
      v-model="indicatorFormat"
      ></v-select>
      <v-checkbox
      v-if="isSaving"
      name="discardOutliers"
      label="Discard features outside of layer"
      v-model="discardOutliers"
      ></v-checkbox>
      <!--<v-text-field v-if="isSaving" label="Location" v-model="neighbourhood"></v-text-field>-->
      <v-spacer></v-spacer>
      <v-btn color="grey lighten-1" dark depressed @click="close()">Cancel</v-btn>
      <v-btn v-if="isSaving" type="submit" :loading="processing" color="blue" dark depressed>Upload</v-btn>
    </div>
  </form>
</div>
</template>

<script>

//TODO use this https://github.com/websanova/vue-upload


import axios from 'axios'
import api from '@/api.js'
const dbConfig = require('@/db.config')

export default {
  props : ['layer', 'layerCollection'],
  data() {
    return {
      processing: false,
      isSaving: false,
      uploadedFiles: [],
      uploadError: null,
      currentStatus: null,
      uploadFieldName: 'GeoJSON',
      file : "",
      neighbourhood: "",
      collection : "",
      layerSelected : "",
      indicatorFormats : ['geojson','json','csv'],
      indicatorFormat : null,
      discardOutliers : false,
      uploadFunction : "create",
      uploadFunctions: ["create","update"],
      update: {
        key:'',
        matchUpload:'',
        matchExisting:''
      },
    }
  },
  methods: {
    filesChange() {
      this.isSaving = true;
      this.file = this.$refs.file.files[0];
      this.neighbourhood = this.file.name.split('.')[0];
      this.indicatorFormat = this.file.name.split('.')[1];
    },
    close () {
      this.processing = false
      this.$emit('close',true)
    },
    processForm () {
      this.processing = true

      const collectionParams = dbConfig[this.collection].params ? this.layerSelected : ''
      const collection = this.collection || alert('Collection required');
      const func = this.uploadFunction==="update" ? "updateMany" : "create"

      let formData = new FormData();
      formData.append('neighbourhood', this.neighbourhood);
      formData.append('layer', this.layerSelected);
      formData.append('file', this.file);
      formData.append('format', this.indicatorFormat);
      formData.append('update', JSON.stringify(this.update))
      formData.append('discardOutliers', this.discardOutliers)

      api[func](collection, null, formData, {
          'Content-Type': 'multipart/form-data',
        },collectionParams
      ).then(()=>{
        console.log('SUCCESS!!');
        return this.$store.dispatch('UPDATE_COLLECTION',{
          name : collection,
          layer : this.layerSelected,
         })
        })
       .then(()=>{
         this.$forceUpdate()
         this.close()
       })
       .catch(err=>{
         this.processing = false
         console.log('err.response',err.response)
         if(!err.response) {
           alert(err)
           return null
         }
         const errors = err.response.data.errors
         alert(Object.keys(errors).reduce((acc,x)=>{
           acc = acc + '\n' + errors[x].name + ': ' + errors[x].message
           return acc
         },''))
       });
  }
},
computed : {
  layers() {
    const layers = this.$store.state[`_col_${this.layerCollection}`]
    if (layers) return layers.map(x=>{
      return {
        text : x.name,
        value : x._id
      }
    })
  },
  collections () {
    console.log('generating collections')
    return Object.keys(dbConfig).reduce((acc,key)=>{
      if (dbConfig[key].canUpload) acc.push(key)
      return acc
    },[])
  }
},
mounted () {
  this.layerSelected = this.layer
}
}
</script>
