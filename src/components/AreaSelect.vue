<template>

    <v-select
      v-if="items"
      :items="items"
      v-model="selected"
      item-text="name"
      item-value="value"
      return-object
      class="area-select"
      solo
      flat
      dense
      append-icon="location_on"
    >
    </v-select>

</template>

<script>
export default {
  data () {
    return {
      selected : '',
    }
  },
  computed : {
    items () {
      if (!this.$store.getters.selectedAreas) return null;
      return this.$store.getters.selectedAreas.map(x=>{
        return {'name':x.feature.properties.name, 'value':x.feature.properties}
      })
    }
  },
  methods : {

    update (properties) {

      this.$store.commit('UPDATE',{
        key:'neighbourhood',
        value: properties.areaCode
      })
      this.$store.commit('UPDATE',{
        key:['map','center'],
        value: {
          lon:properties.centroid_lng,
          lat:properties.centroid_lat
        }
      })
    }
  },
  watch: {
    selected: function(newVal,oldVal) {
      console.log(newVal,oldVal)
      if (newVal !== oldVal) this.update(newVal.value)
      //if this panelIndex matches this component's index.. do stuff since we're selected
    }
  },
  created () {
    const area = this.$store.getters.selectedArea
    this.selected = {'name':area.feature.properties.name, 'value':area.feature.properties}
  },
  mounted () {
    this.$store.watch(
      (state, getters) => getters.selectedArea,
      (newVal, oldVal) => {

          this.selected = {'name':newVal.feature.properties.name, 'value':newVal.feature.properties}

      }
    )
  }

}
</script>

<style>

.area-select div.v-messages {
  height:0px;
  min-height:0px;
}
.area-select div.v-input__slot,
.area-select.v-text-field.v-text-field--enclosed div.v-text-field__details {
  margin-bottom:0;
}
.area-select.theme--light.v-text-field--solo>.v-input__control>.v-input__slot {
  background:none;
  padding:0;
}
.area-select.v-text-field.v-text-field--solo .v-input__control {
  min-height:0;
}



</style>
