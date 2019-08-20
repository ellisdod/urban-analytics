<!-- HTML Template -->

<template>
  <v-card class="pa-3">

    <div>Are you sure you want to delete all features in layer: {{layer.name}} ?</div>
    <v-text-field label="Type DELETE to confirm" v-model="deleteConfirm"></v-text-field>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="grey lighten-1" dark depressed @click="close()">Cancel</v-btn>
      <v-btn :loading="processing" color="red" dark depressed @click="deleteAll()">Delete</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import api from '@/api.js'

export default {
  data() {
    return {
      processing : false,
      deleteConfirm : "",
    }
  },
  methods: {
    close() {
      this.$emit('close',true)
    },
    deleteAll() {
      if (this.deleteConfirm !== 'DELETE') return null
      this.processing = true

      api.deleteMany('features','',{layer:'ObjectId:'+this.$store.state._col_layers_selected},'',this.$store.state._col_layers_selected)
      .then(()=>{
        console.log('deleted')
        this.processing = false
        this.$store.dispatch('UPDATE_COLLECTION',{name:'features',layer:this.$store.state._col_layers_selected})
      })
      .catch(err=>{
        console.log(err)
      })
    },
  },
  computed : {
    layer() {
      return this.$store.getters.selectedLayer
    }
  },

}

</script>
