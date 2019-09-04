<template>
  <v-card>
    <v-card-title v-if="title">
      <span v-if="schema&&schema.name" class="headline">{{mode}} {{ schema.name.slice(0,schema.name.length-1) }}</span>
    </v-card-title>
    <v-tabs
    v-model="activeTab"
    color="#f3f3f3"
    slider-color="grey"
    grow
    v-bind:height="schema.canPaste ? null : '0px'"
    >
    <v-tab ripple @click="">Single</v-tab>
    <v-tab v-if="schema.canPaste" ripple @click="">Multiple</v-tab>
    <v-tab-item>
      <v-form ref="form">
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex v-for="(i,key) in schema.schema" xs12>

              <v-select
              v-if="i._options&&Array.isArray(i._options)&&i._options.length>0"
              v-model="edited[key]"
              :label="i._text"
              :small-chips="i._multiple"
              :multiple="i._multiple"
              clearable
              item-text="name"
              item-value="name"
              :rules="[validateItem(edited[key],i)]"
              box
              validate-on-blur
              v-bind:items="i._options">
            </v-select>

            <component v-if="i._options&&i._options.component" :is="i._options.component" :value="edited[key]" @change="function(e){edited[key]=e}"/>

            <div v-else-if="i._options&&i._options==='dynamic'" style="display:flex;flex-direction:column;" >
            <p class="subheading"> {{ Object.keys(edited[key]).length ? 'Choices' : '' }} </p>
            <div style="flex-basis: 100%;"></div>
              <div style="width:100%;display:flex;" v-for="(item,i) in edited[key]">
                <v-text-field
                v-for="l in $store.state.languages"
                v-model="item['text_'+l.name]"
                :label="i+1+'. '+l.text"
                :rules="[validateItem(edited[key],i)]"
                box
                validate-on-blur
                class="pl-2">
              </v-text-field>
              <v-btn icon  @click="edited[key].splice(i,1)"><v-icon color="grey">clear</v-icon></v-btn>
            </div>

            <v-spacer></v-spacer>
            <v-btn flat outline color="grey" @click="addItem(edited[key])">{{ Object.keys(edited[key]).length ? 'add option' : 'Make Multiple Choice' }}</v-btn>
          </div>

          <v-select v-else-if="typeof i._options==='function'&&!i._categorised"
          v-model="edited[key]"
          :label="i._text"
          :small-chips="i._multiple"
          :multiple="i._multiple"
          clearable
          v-bind:items="i._options($store,edited,collection)"
          item-text="name"
          item-value="_id"
          box
          validate-on-blur
          :rules="[validateItem(edited[key],i)]"
          >
        </v-select>

        <div v-else-if="i._categorised" style="display:flex;">
          <v-combobox
          small-chips
          multiple
          box
          v-model="edited[key]"
          ></v-combobox>
          <nested-menu :items="i._options($store,edited)" title="add" @change="function(e){edited[key].push(e)}"></nested-menu>
        </div>

    <v-switch v-else-if="i.type===Boolean||i.type==='Boolean'" v-model="edited[key]" :label="i._text" color="primary"></v-switch>
    <v-text-field v-else-if="i._text" v-model="edited[key]" :label="i._text" :type="i.type==='Number'?'number':'text'" :rules="[validateItem(edited[key],i)]" box validate-on-blur></v-text-field>

    <v-text-field v-else v-model="edited[key]" :label="i._text" validate-on-blur disabled></v-text-field>

  </v-flex>
</v-layout>
</v-container>

</v-card-text>

<v-card-actions>
  <v-btn color="red darken-1" flat @click="save(true)">Delete</v-btn>
  <v-spacer></v-spacer>
  <v-btn color="grey lighten-1" flat @click="close()">Close</v-btn>
  <v-progress-circular v-if="saving" indeterminate mx-3>Saving...</v-progress-circular>
  <v-btn v-else color="blue darken-1" flat @click="save()">Save</v-btn>
</v-card-actions>

</v-form>
</v-tab-item>

<v-tab-item>
  <v-card-text>
    <v-container grid-list-md>
      <div class="title pb-2">Paste attributes</div>
      Paste as rows of text, separated by commas or tabs: <br>
      <v-text-field v-model="pasted" v-bind:hint="Object.keys(schema.schema).join(', ')" textarea auto-grow rows="3"></v-text-field>

      Preview
      <vue-json-pretty
      v-if="pastedComputed"
      class="pa-3 my-2 code"
      :data="pastedComputed">
    </vue-json-pretty>

  </v-container>
</v-card-text>

<v-card-actions>
  <v-spacer></v-spacer>
  <v-btn color="grey lighten-1" flat @click="close()">Cancel</v-btn>
  <v-progress-circular v-if="saving" indeterminate mx-3>Saving...</v-progress-circular>
  <v-btn v-else color="blue darken-1" flat @click="saveMany()">Save</v-btn>
</v-card-actions>

</v-tab-item>
</v-tabs>

<v-snackbar
      v-model="success"
      top
      :timeout="1000"
      :color="$store.state.colors[2]"
><v-icon>check</v-icon>Saved</v-snackbar>

</v-card>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
import api from '@/api.js'
import Calculator from './Calculator.vue'
import NestedMenu from './NestedMenu.vue'
const dbconfig = require('../db.config')
const arrayUtils = require('@/plugins/arrayUtils')


export default {
  components: {
    VueJsonPretty, Calculator, NestedMenu
  },
  props : ['collection','filter','nestedPath','editItem','attributes','linkedFeature','permanent','title'],
  data() {
    return {
      activeTab : null,
      saving : false,
      editedIndex : null,
      pasted : null,
      attributeTypes: ['String','Number','Boolean'],
      editedCollection : null,
      edited : {},
      uploadDialog:false,
      featureEdit:[],
      datatableTab:null,
      selectAll:false,
      runedit : false,
      success : false,
    }
  },
  computed : {
    mode () {
      return this.editItem ? 'Edit' : 'Add'
    },
    filterId () {
      return this.$store.state[`_col_${this.filter}_selected`]
    },
    schema () {
      return this.$store.getters.collectionSchema(this.collection,this.filter)
    },
    schemaNames () {
      //returns array of strings
      if (!this.schema.name)return null
      return [this.schema.name,this.relatedSchema.name].reduce((acc,x)=>{
        if (x) {
          //console.log('check', x, typeof x)
          acc.push( x.slice(0,x.length - 1) )
        }
        return acc
      },[])
    },
    pastedComputed () {
      let str = this.pasted
      if (!str) return []
      str = str.replace(/\t/g, ',')
      console.log('replaced',str)
      const schemaKeys = Object.keys(this.schema.schema)
      const rows = str.split('\n')
      return rows.reduce((acc,x)=>{
        const arr = x.split(',')
        if (arr.length < 2) return acc
        acc.push(
          arr.reduce((obj,i,index) => {
            const key = schemaKeys[index]
            i = i.trim();
            if (this.schema.schema[key].type === Boolean) i = (i.toLowerCase()==='true')
            obj[key] = i
            return obj
          },{})
        )
        return acc
      },[])
    },
  },
  methods : {
    validateItem(v,i) {
      if (i.required && !v && v!==0 ) return i['_text_en'] + ' is required'
      return true
    },
    addItem (object) {
      const item = Object.assign({value:object.length.toString()},
        this.$store.state.languages.reduce((acc,x)=>{
          acc['text_'+x.name]=''
          return acc
        },{}))
        this.$set(object,object.length,item)
      },
      edit () {
        console.log('edited 1', this.edited)
        this.runedit = true
        //let item = this.$store.state[`_col_${collection}`][index]
        let schema = this.templateFromSchema(this.schema.schema)
        const edited = Object.assign({}, schema, arrayUtils.getNested(this.nestedPath, this.editItem))
        console.log('edited', edited)
        /*Object.keys(edited).forEach(key=>{
          this.$set(this.edited,key,edited[key])
        })*/
        this.edited = Object.assign({}, schema, arrayUtils.getNested(this.nestedPath, this.editItem))

        //this.edited.func = this.editItem.func.map(x=>x)
        console.log('editItem', this.edited, schema, this.editItem, edited)
        //console.log('dialog data', collection,index,path,item,this.edited)
        //console.log('this',this)
      },
      save (del) {

        this.saving = true;
        console.log(this.$refs.form.validate())
        if (!del&&!this.$refs.form.validate()) {
          this.saving = false
          return null
        }
        const id = this.editItem ? this.editItem._id : null
        const params = del ? id : { id:id }
        const self = this
        let updateObj = Object.assign({},this.edited)

        if (this.nestedPath) {
          updateObj = Object.keys(this.edited).reduce((acc,key)=>{
            let value = self.edited[key]
            value = typeof value === 'string' && value.trim() === '' ? null : value
            value = value && this.schema.schema[key].type === 'Number' ? parseInt(value) : value
            value = value && this.schema.schema[key].type === 'Text' ? value.toString() : value
            acc[ self.nestedPath+'.'+key] = value
            return acc
          },{})
        }

        if (this.filter) updateObj.layer = this.filterId
        if (this.linkedFeature) updateObj.feature = this.linkedFeature

        const colparams = dbconfig[this.collection].params ? this.filterId : ''

        console.log('saving', [this.collection, params.id, updateObj])

        const func = del ? 'del':'update'

        api[func](this.collection,params,updateObj,{},colparams)
        .then(()=>{
          this.edit()
          this.$emit('update',true)
          this.saving = false
          this.success = true
          this.$forceUpdate()
          if (!this.permanent) this.$emit('close',true)
        }).catch(err=>{
          alert(err)
          return
        })

      },
      close () {
        this.edited = {}
        this.$emit('close',true)
      },
      saveMany () {
        this.saving = true;
        console.log('filterId: ' + this.filterId + ' collection: ' + this.collection)

        if (this.pastedComputed[0] && Object.keys(this.pastedComputed[0]).length > 1) {
          this.pastedComputed = this.pastedComputed.map(x=>{
            x.layer = this.filterId
            return x
          })
          let formData = new FormData();
          formData.append('data', JSON.stringify(this.pastedComputed))
          console.log('making request...')
          api.create(this.collection,'',formData).then(x=>{
            console.log('uploaded')
            //this.$store.dispatch('UPDATE_COLLECTION',{name:'surveyRecords',layer:this.filterId})
            this.close()
            this.pasted = ''
          })
        }
      },
      templateFromSchema (schema) {
        if (schema) return Object.keys(schema).reduce((acc,x)=>{
          if(schema[x].type === Array){
            acc[x] = []
          } else if (schema[x].type === Boolean) {
            acc[x] = false
          } else {
            acc[x] = ''
          }
          return acc
        },{});
      },
    },
    watch : {
      editItem () {
        this.edit()
      }
    },
    mounted () {
      let schema = dbconfig[this.collection].schema
      if (typeof schema === 'string') schema = this.attributes
      this.edit()
      //if (this.editItem) this.edit()
    }

  }

  </script>
