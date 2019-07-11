<template>

    <v-select
      :items="$store.state[`_col_${collection}`]"
      v-model="selected"
      item-text="text_en"
      item-value="_id"
      class="area-select"
      solo
      flat
      dense
    >
    </v-select>

</template>

<script>

export default {
  props : ['collection'],
  data () {
    return {
      selected : '',
    }
  },
  computed : {
  },
  methods : {

    update (val) {
      this.$store.commit('UPDATE',{
        key:'_col_'+this.collection+'_selected',
        value: val
      })
    }
  },
  watch: {
    selected: function(newVal,oldVal) {
      console.log(newVal,oldVal)
      if (newVal !== oldVal) this.update(newVal)
      //if this panelIndex matches this component's index.. do stuff since we're selected
    }
  },
  created () {
    this.selected = this.$store.state['_col_'+this.collection+'_selected']
  },
  mounted () {
    this.$store.watch(
      (state, getters) => state['_col_'+this.collection+'_selected'],
      (newVal, oldVal) => {

        this.selected = newVal

      }
    )
  }

}
</script>
