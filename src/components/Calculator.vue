<!-- HTML Template -->

<template>
  <v-layout wrap>
      <v-flex xs12 class="subheading">Calculation</v-flex>

      <div style="flex:1">


      <div style="background-color:rgba(0,0,0,0.06);min-height:150px;display:flex;flex-wrap:wrap;align-self:flex-start;" @click.stop="sel(-1)">

        <v-chip
             v-for="(i,index) in formula"
             style="height:40px;"
             :key="index"
             :close="i.selected"
             :selected="i.selected"
             :outline = "operators.indexOf(i.text)>-1"
             :color="operators.indexOf(i.text)>-1 ? 'grey':'white'"
             @click.stop="sel(index)"
             @input="remove(index)">
            {{ i.text.split('.').slice(1,i.text.split('.').length).join('.') || i.text }}
        </v-chip>
        <v-spacer></v-spacer>

        <v-btn icon @click="clear"><v-icon>clear</v-icon></v-btn>
      </div>
      <div style="height:50px;">
        <v-text-field box class="mt-1" v-if="selected!==null" v-model="formula[selected].text" @change="update"></v-text-field>
      </div>
      </div>

        <div style="width:120px;display:flex;flex-wrap:wrap;text-align:center;justify-content: center;">

          <v-btn
             v-for="i in controls"
             icon
             color="rgba(0, 0, 0, 0.06)"
             @click="function(e){push(e.srcElement.textContent)}"
             :value="i">
            {{i}}
          </v-btn>

          <nested-menu
          :items="items"
          title="attributes"
          @change="function(e){selected!==null ? update(e) : push(e)}">
          </nested-menu>

        </div>

      </v-layout>
</template>

<script>
import NestedMenu from './NestedMenu.vue'
//TODO use this https://github.com/websanova/vue-upload
const dbConfig = require('@/db.config')

export default {
  props : ['value','filter'],
  components : {NestedMenu},
  data () {
    return {
      combobox: null,
      operators : ['+','-','*','/'],
      openBracket : '(',
      closeBracket : ')',
    }
  },
  methods : {
    push (e) {
      if (!e && e !== 0) return
      e = e.trim()
      const lastItem = this.formula.slice(-1)[0]
      if (lastItem&&this.operators.indexOf(lastItem.text)>-1&&this.operators.indexOf(e)>-1) return

      //console.log('test',lastItem,lastItem&&this.operators.indexOf(lastItem.text)>-1,this.operators.indexOf(e)>-1)
      //console.log(this.operators)
      //console.log(this.formula)

      this.$set(this.formula, this.formula.length,this.makeItem(e))
      this.$emit('change',this.formula.map(x=>x.text))
      //this.formula.push( this.makeItem(e) )

      //console.log(e==='+', this.operators.indexOf(e))
      //console.log(this.formula.slice(-1)[0].text)
    },
    update(e) {
      console.log('updating')
      this.$set(this.formula, this.selected,this.makeItem(e))
      this.$emit('change',this.formula.map(x=>x.text))
    },
    makeItem(text) {
      return {
        text : text,
        selected : false
      }
    },
    sel(index) {
      console.log('sel ' + index )
      this.formula.forEach((x,i)=>{
        if (i === index) {
         x.selected = !x.selected
       } else {
         x.selected = false;
       }
      })
      this.$forceUpdate()
    },
    remove(index) {
      this.$delete(this.formula, index)
      this.$emit('change',this.formula.map(x=>x.text))
      //this.formula = [...this.formula]
    },
    clear() {
      this.$emit('change',[])
    }
  },
  computed : {
    formula () {
      return this.value ? this.value.map(x=>this.makeItem(x)) : []
    },
    selected () {
      for (var x=0;x<this.formula.length;x++) {
          if (this.formula[x].selected) return x
      }

      return null
    },
    controls () {
      return [...this.operators, this.openBracket, this.closeBracket]
    },
    items () {
      return dbConfig.indicatorBlocks.schema.figure._options(this.$store,{})
    },
  },

}
</script>
