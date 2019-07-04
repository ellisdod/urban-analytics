<template>
  <div>
    <div v-if="title" class="body-1 mt-2">{{title}}</div>
    <v-select
    style="width:100%;margin-top:-10px;"
    class="caption"
    color="grey"
    :items="items"
    :value="value"
    @change="updateDisplayKey"
    ></v-select>

    <table v-if="legend&&legend.type===Number" class="body-1">
      <tr>
        <td class="key-gradient" v-bind:style="{backgroundImage: 'linear-gradient('+legend.chroma(0)+','+legend.chroma(1)+')'}">
        </td>
        <td class="key-figures">
          <div class="key-max">
            {{legend.items.max }}
          </div>
          <div class="key-min">
            {{legend.items.min }}
          </div>
        </td>
      </tr>
    </table>

    <table v-else-if="legend" class="caption">
      <tr v-for="(val,key) in legend.items">
        <td class="key-icon" v-bind:style="{color:val}">●</td>
        <td class="key-figures"><span style="padding:1px 5px;" class="body-1 grey--text text--darken-2">{{key}}</span> </td>
      </tr>
    </table>
  </div>
</template>

<script>

export default {
  props: ['legend','title','value','items'],
  data () {
    return {}
  },
  methods : {
    updateDisplayKey(e) {
      console.log('updateDisplayKey',e)
      this.$emit('input', e)
    }
  }
}
</script>
<style>
</style>
