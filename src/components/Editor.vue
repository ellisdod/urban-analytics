<template>
  <v-card>
    <v-card-title>
      <span v-if="schema&&schema.name" class="headline">{{mode}} {{ schema.name.slice(0,schema.name.length-1) }}</span>
    </v-card-title>
    <v-tabs
    v-model="activeTab"
    color="#f3f3f3"
    slider-color="grey"
    grow
    >
    <v-tab ripple @click="">Single</v-tab>
    <v-tab v-if="schema.canPaste" ripple @click="">Multiple</v-tab>
    <v-tab-item>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex v-for="(i,key) in schema.schema" xs12>

              <v-select v-if="i._options&&Array.isArray(i._options)" v-model="edited[key]" :label="i._text" :small-chips="i._multiple" :multiple="i._multiple"
              v-bind:items="i._options.map(x=>x.name)">
            </v-select>

            <v-select v-else-if="typeof i._options==='function'&&!i._categorised"
            v-model="edited[key]"
            :label="i._text"
            :small-chips="i._multiple"
            :multiple="i._multiple"
            v-bind:items="i._options($store,edited,collection)"
            item-text="name"
            item-value="_id">
          </v-select>

          <div v-else-if="i._categorised">
            <v-combobox v-model="edited[key]" multiple small-chips> </v-combobox>
            <v-menu full-width offset-y>

              <v-btn
              color="grey"
              outline
              slot="activator"
              >
              {{ key }}
            </v-btn>
            <v-list dense>
              <template v-for="(val,name) in i._options($store,edited,collection)">

                <v-list-tile v-if="val.value" :key="name" @click="edited[key].push(val.value)">
                  {{val.name}}

                </v-list-tile>

                <v-menu v-else-if="val.items" full-width offset-x max-height="500" :key="name" open-on-hover >
                  <v-list-tile slot="activator" @click="">
                    <v-list-tile-title>{{val.name}}</v-list-tile-title>
                  </v-list-tile>
                  <v-list dense>
                    <v-list-tile v-for="(j,ind) in val.items " @click="edited[key].push(name+'.'+j)">
                      <v-list-tile-title>{{ j }}</v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>

              </template>

            </v-list>

          </v-list>


        </v-menu>
      </div>

      <v-switch v-else-if="i.type===Boolean" v-model="edited[key]" :label="i._text"></v-switch>
      <v-text-field v-else-if="i._text" v-model="edited[key]" :label="i._text"></v-text-field>
      <v-text-field v-else v-model="edited[key]" :label="i._text" disabled></v-text-field>
    </v-flex>
  </v-layout>
</v-container>

</v-card-text>

<v-card-actions>
  <v-spacer></v-spacer>
  <v-btn color="grey lighten-1" flat @click="close()">Cancel</v-btn>
  <v-progress-circular v-if="saving" indeterminate mx-3>Saving...</v-progress-circular>
  <v-btn v-else color="blue darken-1" flat @click="save(edited._id)">Save</v-btn>
</v-card-actions>


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

</v-card>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
import api from '@/api.js'
const dbconfig = require('../db.config')


export default {
  components: {
    VueJsonPretty
  },
  props : ['collection','filter','nestedPath','editItem','attributes'],
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
    edit() {
      this.runedit = true
      const item = this.editItem
      //let item = this.$store.state[`_col_${collection}`][index]
      let schema = this.templateFromSchema(this.schema.schema)
      const items = this.$store.state[`_col_${this.collection}`]
      if (this.nestedPath) {

        for(var x=0;x<items.length;x++){
          if (item === this.getNested(this.nestedPath,items[x])) {
            item._id = items[x]._id
            this.editedIndex = x
            break
          }
        }
        //item = this.getNested(this.nestedPath,item)
        schema = this.getNested(this.nestedPath,schema)
        item._path = this.nestedPath

      } else {
        this.editedIndex = items.indexOf(item)
      }
      this.edited = Object.assign({}, schema, item)
      //console.log('dialog data', collection,index,path,item,this.edited)
      //console.log('this',this)
    },
    save(id) {

      this.saving = true;
      if (this.filter) {
        this.edited.layer = this.filterId
      }
      const colparams = dbconfig[this.collection].params ? this.selectedId : ''
      const params = { id: id ,path: this.edited._path }

      console.log('saving', [this.collection, id, this.edited])

      api.update(this.collection,params,this.edited,{},colparams).then(()=>{
        this.$emit('update',true)
        return
      }).catch(err=>{
        alert(err)
        return
      })
      .then(()=>{
        this.saving = false
        this.$emit('close',true)
      })
    },
    close () {
      this.edited = {}
      this.$emit('close',true)
    },
    saveMany() {
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
          this.updateCollection(true)
          this.close()
          this.pasted = ''
        })
      }
    },
    templateFromSchema(schema) {
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
    if (this.mode === 'Add') this.edited = this.templateFromSchema(schema)
    //if (this.editItem) this.edit()
  }

}

</script>
