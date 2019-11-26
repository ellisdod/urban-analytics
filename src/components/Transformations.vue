<!-- HTML Template -->

<template>
  <div>

  <span>Transformations</span>


<v-card
v-for="(item,index) in items"
:key="index"
flat
color="rgba(0,0,0,0.06)">
<v-toolbar color="indigo" dark>
  <v-toolbar-title>{{item.text_en}}</v-toolbar-title>
  <v-spacer></v-spacer>
  <v-btn icon @click="remove(index)"><v-icon>close</v-icon></v-btn>
</v-toolbar>

<v-card-text>
  <v-template v-for="(t,paramIndex) in transformations[item.name].params">
  <component
  v-if="t.component"
  :is="t.component"
  :items="t.items?t.items($store,edited):null"
  :type="t.type"
  :value="items[index].params[paramIndex].value"
  @change="function(e){items[index].params[paramIndex].value=e}">
 </component>

  <v-text-field
   v-else
  box class="mt-1"
  :label="t.name"
  v-model="items[index].params[paramIndex].value">
</v-text-field>
  </v-template>
  </v-card-text>

</v-card>

<v-select
:items="Object.values(transformations)"
label="ADD"
item-text="text_en"
return-object
@change="function(e){push(e)}">
</v-select>


</div>
</template>

<script>
import NestedMenu from './NestedMenu.vue'
//TODO use this https://github.com/websanova/vue-upload
const dbConfig = require('@/db.config')
const transConfig = require('@/transformations.config')
import Calculator from './Calculator.vue'

export default {
  props : ['value','filter'],
  components : {NestedMenu,Calculator},
  data () {
    return {
      items : [],
      transformations : transConfig,
    }
  },
  methods : {
    push (e) {
      console.log(e,this.items)
      if (!e && e !== 0) return

      //const lastItem = this.formula[this.formula.length-1]
      //if (lastItem&&this.operators.indexOf(lastItem.text)>-1&&this.operators.indexOf(e)>-1) return

      //console.log('test',lastItem,lastItem&&this.operators.indexOf(lastItem.text)>-1,this.operators.indexOf(e)>-1)
      //console.log(this.operators)
      //console.log(this.formula)
      this.items.push(e)
      this.update()
      //this.$set(this.formula, this.formula.length,e)
      //this.formula.push(this.makeItem(e))
      //this.$emit('change',this.formula.map(x=>x.text))
      //this.formula.push( this.makeItem(e) )

      //console.log(e==='+', this.operators.indexOf(e))
      //console.log(this.formula.slice(-1)[0].text)
    },
    update() {
      console.log('updating')
      this.$emit('change',this.items)
      //this.formula.splice(this.selected, 1,this.makeItem(e))
      //this.$set(this.formula, this.selected,this.makeItem(e))
      //this.$emit('change',this.formula.map(x=>x.text))
    },
    sel(index) {
      console.log('sel ' + index )
      this.selected = this.formula[index].selected ? null : index
      this.formula = this.formula.map((x,i)=>{
        x.selected = i === index ? !x.selected : false;
        return x
      })
      this.$forceUpdate()
    },
    remove(index) {
      //this.$delete(this.formula, index)
      this.items.splice(index,1)
      this.update()
      //this.formula = [...this.formula]
    },
    clear() {
      this.$emit('change',[])
    }
  },
  mounted () {
    this.$nextTick(()=>{
      this.items = this.value ? this.value : []
    })

  }

}
</script>
