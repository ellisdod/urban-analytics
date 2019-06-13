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
      v-if="!layer"
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
      <v-text-field v-if="isSaving" label="Location" v-model="neighbourhood"></v-text-field>
      <v-btn v-if="isSaving" type="submit" color="blue" dark depressed>Upload</v-btn>
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
      isSaving:false,
      uploadedFiles: [],
      uploadError: null,
      currentStatus: null,
      uploadFieldName: 'GeoJSON',
      file : "",
      neighbourhood: "",
      collection : "",
      collections : ['features','areas','indicators'],
      layerSelected : "",
      indicatorFormats : ['geojson','json','csv'],
      indicatorFormat : null,
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
    processForm () {
      let formData = new FormData();
      formData.append('neighbourhood', this.neighbourhood);
      formData.append('layer', this.layerSelected || this.layer);
      formData.append('file', this.file);
      formData.append('format', this.indicatorFormat);
      formData.append('update', JSON.stringify(this.update))

      const collectionParams = dbConfig[this.collection].params ? this.layer : ''
      const collection = this.collection || alert('Collection required');
      const func = this.uploadFunction==="update" ? "updateMany" : "create"

      api[func](collection, null, formData, {
          'Content-Type': 'multipart/form-data',
        },collectionParams
        ).then(function(){
        console.log('SUCCESS!!');
        })
       .catch(function(){
        console.log('FAILURE!!');
       });


  }
},
computed : {
  layers() {
    this.$store.state[`_col_${this.layerCollection}`] || []
  },
},
mounted () {
  this.layerSelected = this.layer
}
}
</script>
