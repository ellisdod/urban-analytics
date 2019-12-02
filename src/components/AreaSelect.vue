<template>

    <v-select
      v-if="items"
      :items="items"
      v-model="selected"
      item-text="name"
      item-value="value"
      return-object
      class="area-select"
      color="tertiary"
      solo
      flat
      dense
      :prepend-icon="icon"
      :style="childStyle"
    >
    </v-select>

</template>

<script>
export default {
  props : ['icon','childStyle','value'],
  data () {
    return {
      selected : '',
    }
  },
  computed : {
    items () {
      if (!this.$store.getters.selectedAreas) return null;
      return this.$store.getters.selectedAreas.map(x=>this.makeListObject(x))
    }
  },
  methods : {

    update (properties) {
      this.$emit('change', properties._id)
      this.$store.commit('UPDATE',{
        key:'neighbourhood',
        value: properties.areaCode
      })
      this.$store.commit('UPDATE',{
        key:['map','center'],
        value: {
          lng:properties.centroid_lng,
          lat:properties.centroid_lat
        }
      })
    },
    makeListObject(area) {
      if (!area) return null
      const p = area.feature.properties;
      p._id = area._id
      return {
        'name':p['text_'+this.$store.state.language] || p.text_en,
        'value':p
      }
    },
    setArea(area) {
      this.selected = this.makeListObject(area)
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
    const selected = this.value ? this.$store.state._col_areas.filter(x=>x._id===this.value)[0]
                   : this.$store.getters.selectedArea
    this.setArea(selected)
  },
  mounted () {
    const self = this
    this.$store.watch(
      (state, getters) => getters.selectedArea,
      (area) => self.setArea(area)
    )
  }

}
</script>

<style>
.area-select .v-text-field.v-text-field--solo .v-input__append-outer, .v-text-field.v-text-field--solo .v-input__prepend-outer {
    margin-top: 5px;
}
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
.area-select .v-text-field {
    padding-top: 0px;
   margin-top: 0px;
}
.area-select .v-select__selections {
  line-height:normal;
}


</style>
