<template>
  <v-layout v-if="style" class="ejmap-border pa-2 style-picker" style="border-radius:2px;">
    <v-flex xs3 class="caption ejmap-border-right pr-2 pa-0" style="flex-direction: column;display: flex;">
      <v-list dense class="pt-0">
        <v-list-tile
        v-for="(item,key,index) in items"
        :key="key"
        :value="selected===index"
        active-class="highlight"
        @click="picker=item.color;selected=index"
        >
        <v-list-tile-content>
          <v-list-tile-title>{{ item.text }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <symbol-icon :value="style" width="90px"></symbol-icon>

  </v-flex>
  <v-flex pa-0 grow>
    <div style="position:relative">
      <chrome-picker :value="style[picker]" @input="function(e){style[picker]=e.hex8}"/>
      <div v-if="picker==='borderColor'" style="position:absolute;bottom:5px; left:18px">
        <v-divider></v-divider>
        <div class="body-1 pt-3 grey--text text--darken-2" style="width:100%;display:flex;">
          <div style="flex-grow:1">Border Width</div>
          <span class="font-weight-medium">{{style.borderWidth + 'px'}}</span>
        </div>
        <v-slider
        v-model="style.borderWidth"
        min="0"
        max="8"
        @change="update(style)"
        />
      </div>
    </div>
  </v-flex>
</v-layout>
</template>

<script>
import { Chrome } from 'vue-color'
import SymbolIcon from './SymbolIcon.vue'

export default {
  components : {
    'chrome-picker' : Chrome,
    SymbolIcon : SymbolIcon
  },
  props : ['value'],
  data () {
    return {
      style : '',
      selected : 0,
      items : {
        fill: {
          text : 'Fill',
          color: 'fillColor',
          active:true,
        },
        border: {
          text : 'Border',
          color: 'borderColor',
          width: 'borderWidth',
          active:false,
        },
      },
      picker : 'fillColor',
    }
  },
  methods : {
    update (val) {
      this.$emit('input',val)
    }
  },
  mounted () {
    this.$nextTick(function(){
      this.style = Object.assign({
     borderColor : '#333',
     fillColor : '#e3e3e3',
     borderWidth : 2,
   }, this.$props.value)
 })
 },
  watch : {
    style : function(val) {
      this.$emit('input',val)
    }
  }
}
</script>

<style>
.vc-chrome-body {
  width:300px;
}
.vc-chrome-saturation-wrap {
  width:100%;
}
div.vc-chrome {
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  box-shadow:none;
}
div.vc-chrome-color-wrap {
  display:none;
}
div.vc-chrome-hue-wrap {
  margin-bottom:20px;
}
div.vc-chrome-alpha-wrap {
  margin-bottom:5px;
}
.highlight {
  background-color: var(--v-grey-lighten3);
}
</style>
