<!-- HTML Template -->

<template>
  <div class="container">
    <!--UPLOAD-->
    <form enctype="multipart/form-data" novalidate @submit.prevent="processForm">
      <h1>Upload data</h1>
      <div class="dropbox">



        <input type="file" ref="file" :name="uploadFieldName" :disabled="isSaving" @change="filesChange()" class="input-file">
        <p v-if="isInitial">
          Drag your file(s) here to begin<br> or click to browse
        </p>
        <v-select
          v-if="isSaving"
          name="layer"
          :items="dataTypes"
          label="Layer"
          v-model="dataType"
        ></v-select>
        <v-text-field v-if="isSaving" label="Location" v-model="neighbourhood"></v-text-field>
        <v-btn to="map" class="button">Back</v-btn>
        <v-btn v-if="isSaving" type="submit" class="button is-danger">Upload</v-btn>
      </div>
    </form>
  </div>
</template>

<script>

//TODO use this https://github.com/websanova/vue-upload


import axios from 'axios'
import API from '@/api.js'

const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3;

export default {
  data() {
    return {
      uploadedFiles: [],
      uploadError: null,
      currentStatus: null,
      uploadFieldName: 'GeoJSON',
      file : "",
      neighbourhood: "",
      dataType : 'Buildings',
      dataTypes : ['Buildings','Neighbourhood Boundary']
    }
  },
  computed: {
    isInitial() {
      return this.currentStatus === STATUS_INITIAL;
    },
    isSaving() {
      return this.currentStatus === STATUS_SAVING;
    },
    isSuccess() {
      return this.currentStatus === STATUS_SUCCESS;
    },
    isFailed() {
      return this.currentStatus === STATUS_FAILED;
    }
  },
  methods: {
    filesChange() {
      this.currentStatus = 1;
      this.file = this.$refs.file.files[0];
      this.neighbourhood = this.file.name.split('.')[0];
    },
    processForm () {
      let formData = new FormData();
      formData.append('neighbourhood', this.neighbourhood);
      formData.append('layer', this.dataType);
      formData.append('file', this.file);
      formData.append('file', this.file);
      console.log({ fileData: this.file});
      API.create(formData, {
          'Content-Type': 'multipart/form-data'
        }
    ).then(function(){
      console.log('SUCCESS!!');
    })
    .catch(function(){
      console.log('FAILURE!!');
    });
  }
}
}
</script>
