<!-- HTML Template -->
<template>
  <array-input :buttons="controls" v-bind="$props" v-on="$listeners">
    <slot name="title">
    <v-flex xs12 class="subheading">
    Calculation
    </v-flex>
  </slot>
  </array-input>

</template>

<script>
import ArrayInput from './ArrayInput.vue'
//TODO use this https://github.com/websanova/vue-upload

export default {
  props : ['value','filter','items','type'],
  components : {
    ArrayInput
  },
  extends: ArrayInput,
  methods : {
    validate (e) {
      const lastItem = this.formula[this.formula.length-1]
      return !(lastItem&&this.operators.indexOf(lastItem.text)>-1&&this.operators.indexOf(e)>-1)
    },
  },
  computed : {
    controls () {
      const symbols = this.type === 'conditional' ? this.symbols.concat(this.conditionals).concat(this.operators) : this.symbols
      return [...symbols, this.openBracket, this.closeBracket]
    }
  },
}
</script>

<style>
.break {
  flex-basis:100%;
  height:0;
}
</style>
