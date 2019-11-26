<!-- HTML Template -->

<template>
  <v-layout wrap>
      <template v-slot:title></template>

      <div style="flex:1">


      <div class="pa-2" style="background-color:rgba(0,0,0,0.06);min-height:150px;min-width:30px;display:flex;flex-wrap:wrap;align-self:flex-start;"
      @click="sel(-1)">
        <template v-for="(i,index) in formula">
        <div v-if="i.text.indexOf('ELSE')===0" class="break"></div>
        <v-chip
             style="height:40px;margin:0;"
             :key="index"
             :close="i.selected"
             :selected="i.selected"
             :outline="style(i.text).outline"
             :color="style(i.text).color"
             :icon="style(i.text).icon"
             :class="style(i.text).class"
             @click.stop="sel(index)"
             @input="remove(index)">
            {{ format(i.text) }}
        </v-chip>
      </template>

      </div>
      <div style="height:50px;">
        <v-text-field v-if="selected!==null" box class="mt-1"  v-model="formula[selected].text" @change="update"></v-text-field>
        <v-text-field v-else box class="mt-1" v-model="temp" @change="push"></v-text-field>
      </div>
      </div>

        <div style="width:120px;display:flex;flex-wrap:wrap;text-align:center;justify-content: center;">

          <v-btn
             v-for="i in buttons"
             :icon="i.length<4"
             depressed
             round
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
  props : ['value','filter','items','buttons'],
  components : {NestedMenu},
  data () {
    return {
      temp:'',
      combobox: null,
      openBracket : '(',
      closeBracket : ')',
      selected : null,
      conditionals : ['IF','ELSE IF','ELSE','=','!=','in','not in'],
      operators : ['AND','OR'],
      symbols : ['+','-','*','/'],
      formula : [],
      styles : {
        operator : {
          color:'rgba(0,0,0,0)',
          class:'font-weight-medium'
        },
        conditional : {
          color:'rgba(0,0,0,0)',
          class:'grey--text'
        },
        field : {
          color:'rgba(0,0,0,0)',
          class:'primary--text'
        },
        string : {
          color:'rgba(0,0,0,0)',
        },
        number : {
          color:'#555',
        }
      },
    }
  },
  methods : {
    style(val) {
      const keys = Object.keys(this.styles)
      for (let i=0;i<keys.length;i++){
        if (this.isType(val)[keys[i]]) return this.styles[keys[i]]
      }
    },
    validate (e) {
      return true;
      //const lastItem = this.formula[this.formula.length-1]
      //return !(lastItem&&this.operators.indexOf(lastItem.text)>-1&&this.operators.indexOf(e)>-1)
    },
    push (e) {
      e = e.trim()
      if ((!e && e !== 0)||!this.validate(e)) return
      //console.log('test',lastItem,lastItem&&this.operators.indexOf(lastItem.text)>-1,this.operators.indexOf(e)>-1)
      //console.log(this.operators)
      //console.log(this.formula)

      this.$set(this.formula, this.formula.length,this.makeItem(e))
      //this.formula.push(this.makeItem(e))
      this.$emit('change',this.formula.map(x=>x.text))
      this.temp=''
      //this.formula.push( this.makeItem(e) )

      //console.log(e==='+', this.operators.indexOf(e))
      //console.log(this.formula.slice(-1)[0].text)
    },
    update(e) {
      console.log('updating')
      //this.formula.splice(this.selected, 1,this.makeItem(e))
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
      this.selected = index === -1 || this.formula[index].selected ? null : index
      this.formula = this.formula.map((x,i)=>{
          x.selected = i === index ? !x.selected : false;
         return x
      })
      this.$forceUpdate()
    },
    remove(index) {
      //this.$delete(this.formula, index
      console.log('remove',index)
      this.selected = null
      this.formula.splice(index,1)
      this.$emit('change',this.formula.map(x=>x.text))

      //this.formula = [...this.formula]
    },
    clear() {
      this.$emit('change',[])
    },
    isType(text) {
      return {
        field : text.indexOf('$')===0,
        conditional : this.conditionals.includes(text) || text === this.openBracket || text === this.closeBracket,
        operator : this.operators.includes(text),
        symbol : this.symbols.includes(text),
        number : typeof text === 'number',
        string : typeof text === 'string',
        symbol : this.symbols.indexOf(text) > 0,
      }
    },
    format(text) {
      if (text.indexOf('.')>0) {
        return text.split('.').slice(1,text.split('.').length).join('.') || text
      } else if (text.indexOf('$')===0) {
        return this.items.filter(x=>x.value===text)[0].name
      } else {
        return text
      }
    },
    setFormula () {
      this.formula = this.value ? this.value.map(x=>this.makeItem(x)) : []
      //console.log('FORMULA!',this.formula)
    },
  },
  mounted () {
    this.$nextTick(()=>{
      //console.log('VALUE!',this.value)
      this.setFormula()
    })
  },
  watch : {
    value : function(val) {
      //this.setFormula()
    }
  }

}
</script>

<style>
.break {
  flex-basis:100%;
  height:0;
}
</style>
