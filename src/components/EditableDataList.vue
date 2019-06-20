<!-- HTML Template -->

<template>
  <div>
    <div>
      <!-- DATA TABLE -->
      <div v-if="datatable" >
        <div class="datatable-toolbar" style="margin-top:-40px;float:right;">
          <v-checkbox v-if="multiselect" v-model="selectAll" label="Select All" @change="toggleSelectAll()" color="grey" flat class="mt-2 mr-3"  style="float:left;">
            <v-icon>add</v-icon>Add
          </v-checkbox>
          <v-btn v-if="multiselect" @click="deleteSelected(collection)" color="grey" class="mb-2" flat>
            Delete Selected
          </v-btn>
          <v-btn @click="add(collection)" color="grey" class="mb-2" flat>
            <v-icon>add</v-icon>Add
          </v-btn>
        </div>

        <v-data-table
        :headers="featureHeaders"
        :items="items"
        :rows-per-page-items="[10,20,50,100,-1]"
        v-bind:class="cssclass"
        >
        <template v-slot:items="props">
          <tr class="attribute-row" v-on:dblclick="edit(collection, props.item, nestedPath)">
            <!--Array.isArray(getNested(nestedPath,props.item)[h.value])
            schema.schema[h.value]._options.filter(x=>x.name===h.value)[0].color
          -->
          <td v-for="(h,ind) in featureHeaders">

            <template v-if="h.type === Array">
              <v-chip v-for="o in getNested(nestedPath,props.item)[h.value]"
              :class="'func-'+o"
              outline
              small>
              {{ o }}
            </v-chip>
           </template>

          <template v-else-if="h.type === 'select'">
            <v-checkbox style="padding-bottom:0;" color="grey" v-model="props.item.feature._selected" @change="selectFeature(props.item)"/>
          </template>

          <template v-else>
            {{ getNested(nestedPath,props.item)[h.value] }}
          </template>

          <div v-if="ind===featureHeaders.length-1" class="attribute-controls-wrapper">
            <div class="attribute-controls" style="top:-30px;">
              <v-btn small fab color="grey" outline  @click="edit(collection, props.item, nestedPath)">
                <v-icon>edit</v-icon>
              </v-btn>
              <v-btn small fab color="grey" outline @click="del(collection, props.item._id)">
                <v-icon>delete</v-icon>
              </v-btn>
            </div>
          </div>
        </td>
      </tr>
    </template>
  </v-data-table>
  <v-btn v-if="addbottom" style="float:right" @click="add(collection)" color="grey" class="mb-2" flat>
    <v-icon>add</v-icon>Add
  </v-btn>
</div>


<!-- LIST -->
<div v-else>
  <v-btn v-if="addtop" style="margin-top:-40px;float:right" @click="add(collection)" color="grey" class="mb-2" flat>
    <v-icon>add</v-icon>Add
  </v-btn>
  <v-list dense v-bind:class="cssclass">
    <v-list-tile class="attribute-row"
    v-for="(x, index) in listItems"
    :key="index"
    v-model="x.active"
    @click="select(index, x._id)">
    <v-list-tile-action v-if="listKey&&schema.schema[listKey]._options&&schema.schema[listKey]._options[0]">
      <v-icon>{{schema.schema[listKey]._options.filter(i => i.name === x[listKey])[0].icon}} </v-icon>
    </v-list-tile-action>
    <v-list-tile-content>
      <div v-if="x._id" class="attribute-controls-wrapper">
        {{x.text || x.text_en || x.name}}
        <div class="attribute-controls">
          <v-btn small fab color="grey" outline @click="edit(collection, x)">
            <v-icon>edit</v-icon>
          </v-btn>
          <v-btn small fab color="grey" outline @click="del(collection, x._id)">
            <v-icon>delete</v-icon>
          </v-btn>
        </div>
      </div>
    </v-list-tile-content>

    <div v-if="x.active" style="height:100%;"></div>
  </v-list-tile>
</v-list>
<v-btn v-if="addbottom" @click="add(collection)" color="grey" style="float:right" class="mb-2" flat>
  <v-icon>add</v-icon>Add
</v-btn>
</div>

<!--
<v-btn @click="forceUpdate()" color="grey" style="float:right" class="mb-2" flat>
<v-icon>add</v-icon>update
</v-btn>
<v-btn @click="logStore()" color="grey" style="float:right" class="mb-2" flat>
<v-icon>add</v-icon>log
</v-btn>
-->
</div>

<v-dialog v-if="editedSchema" v-model="dialog" max-width="700px">
  <v-card>
    <v-card-title>
      <span class="headline">{{mode}} {{ schema.name.slice(0,schema.name.length-1) }}</span>
    </v-card-title>
    <v-tabs
    v-model="activeTab"
    color="#f3f3f3"
    slider-color="grey"
    grow
    >
    <v-tab ripple @click="">Single</v-tab>
    <v-tab v-if="editedSchema.canPaste" ripple @click="">Multiple</v-tab>
    <v-tab-item>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex v-for="(i,key) in editedSchema.schema" xs12>

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


              <v-menu full-width offset-x max-height="500" :key="name" open-on-hover v-for="(val,name) in i._options($store,edited,collection)" >
                <v-list-tile slot="activator" @click="">
                  <v-list-tile-title>{{val.name}}</v-list-tile-title>
                </v-list-tile>
                <v-list dense>
                  <v-list-tile v-for="(j,ind) in val.items " @click="edited[key].push(name+'.'+j)">
                    <v-list-tile-title>{{ j }}</v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>

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
  <v-btn v-else color="blue darken-1" flat @click="save(editedCollection, edited._id)">Save</v-btn>
</v-card-actions>


</v-tab-item>

<v-tab-item>
  <v-card-text>
    <v-container grid-list-md>
      <div class="title pb-2">Paste attributes</div>
      Paste as rows of text, separated by commas or tabs: <br>
      <v-text-field v-model="pasted" v-bind:hint="Object.keys(editedSchema.schema).join(', ')" textarea auto-grow rows="3"></v-text-field>

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
  <v-btn v-else color="blue darken-1" flat @click="saveMany(editedCollection, edited.layer)">Save</v-btn>
</v-card-actions>

</v-tab-item>
</v-tabs>

</v-card>
</v-dialog>
</div>

</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
import Upload from './Upload.vue'

//TODO use this https://github.com/websanova/vue-upload

import api from '@/api.js'
const dbconfig = require('../db.config')


export default {
  components: {
    VueJsonPretty, Upload
  },
  props : ['collection','filter','datatable','listKey','nestedPath','cssclass','addtop','addbottom','multiselect'],
  data() {
    return {
      updateKey : 0,
      activeTab : null,
      dialog: false,
      mode : null,
      saving : false,
      editedIndex : null,
      layerDialog : false,
      attributeDialog : false,
      selected : 0,
      selectedId : '',
      pasted : null,
      attributeTypes: ['String','Number','Boolean'],
      editedCollection : null,
      edited : {},
      uploadDialog:false,
      featureEdit:[],
      datatableTab:null,
      selectAll:false,
    }
  },
  computed : {
    menuItems () {
      //console.log('changed', this.$store.state.collections[this.mainCollection])
      //return this.$store.state.collections[this.mainCollection]
      return this.$store.getters.areaLayers
    },
    filterId () {
      return this.$store.state[`_col_${this.filter}_selected`]
    },
    listItems (){
      const items = this.items.map((x,i)=>{
        x.active = this.selected === i ? true : false
        return x
      })
      console.log('listitems',items)
      return items
    },
    items() {
      if (this.collection==='features') {
        let features = this.$store.state._col_features[this.filterId]
        if (!features) return []
        features = Array.isArray(features) ? features : features[this.$store.state.neighbourhood]
        if (!this.multiselect) return items
        return features.map((x,i)=>{
          x.feature.properties._selected = x.feature.properties._selected || false
          x.feature.properties._index = i
          return x
        })
        return features ? features : []
      }

      let collectionData = Array.from(this.$store.state[`_col_${this.collection}`])
      console.log('collectiondata',this.collection,collectionData)
      if (!collectionData[0]) {
        //this.updateCollection()
        return []
      }
      if (this.filter&&collectionData[0]) {
        console.log("filterlayer", this.filter)
        //console.log('coldata',collectionData.filter(x=>x.layer === this.$store.state.selected[this.filter]))
        return collectionData.filter(x=>x.layer === this.filterId)
      } else {
        return collectionData
      }
    },
    filteredItems () {

    },
    firstItem () {
      const col = this.$store.state[`_col_${self.collection}`]
      if (col) {
        return   this.$store.state[`_col_${self.collection}`][0]
      } else {
        return {}
      }
    },
    schema () {
      let schema = dbconfig[this.collection]
      if (this.collection==='features') {
        let attributes = this.$store.getters.selectedLayerAttributes
        if (!attributes) {
          this.$store.dispatch('UPDATE_COLLECTION','layerAttributes')
          .then(i=> {
            console.log('callback attrs',i)
            schema = Object.assign(schema, {schema: this.schemaFromAttributes(Array.from(i))} )
          })
        } else {
          console.log('attrs',attributes)
          schema = Object.assign(schema, {schema: this.schemaFromAttributes(Array.from(attributes))} )
        }
      }
      console.log('schema',schema)
      console.log('schematype',typeof schema.schema)
      return schema ? schema : {}
    },
    editedSchema() {
      return Object.assign({},this.schema)
      /*
      if (this.editedCollection === 'features') {
      let tabledata = {
      name :  this.$store.state.collections[this.collection][this.selected].name
    }
    let x = this.$store.state.collections['layerAttributes'].filter( x=> x.layer === this.selectedId )

    tabledata.schema = x.reduce((acc, i) => {
    acc[i.name] = i
    return acc
  },{})
  console.log('editedschema',tabledata)
  return tabledata
} else {
return dbconfig[this.editedCollection]
}*/
},
schemaNames () {
  //returns array of strings
  return [this.schema.name,this.relatedSchema.name].reduce((acc,x)=>{
    if (x) {
      //console.log('check', x, typeof x)
      acc.push( x.slice(0,x.length - 1) )
    }
    return acc
  },[])
},
tabledata () {
  if(this.layer) return this.layer.attributes
},
featureHeaders() {
  if (!this.schema.schema) return []
  let base = this.multiselect ? [{value:'select',type:'select',_text:''}] : []
  const x = Object.keys(this.schema.schema).reduce((acc,x)=>{
    if (this.schema.schema[x]._text) acc.push({
      value:x,
      text:this.schema.schema[x]._text,
      type:this.schema.schema[x].type
    })
    return acc
  },base)
  /*const x = this.$store.state.collections[this.collection].map(x=>{
  return {value:x.name,text:x.name}
})*/
console.log('featureHeaders',x)
return x
},
pastedComputed () {
  let str = this.pasted
  if (!str) return []
  str = str.replace(/\t/g, ',')
  console.log('replaced',str)
  const schemaKeys = Object.keys(this.editedSchema.schema)
  const rows = str.split('\n')
  return rows.reduce((acc,x)=>{
    const arr = x.split(',')
    if (arr.length < 2) return acc
    acc.push(
      arr.reduce((obj,i,index) => {
        const key = schemaKeys[index]
        i = i.trim();
        if (this.editedSchema.schema[key].type === Boolean) i = (i.toLowerCase()==='true')
        obj[key] = i
        return obj
      },{})
    )
    return acc
  },[])
},

},
methods: {
  addSelects(items,value) {
    if (!this.multiselect) return items
    return items.map((x,i)=>{
      x.feature._selected = x._selected || value || false
      x.feature.properties._index = i
      return x
    })
  },
  updateCollection(force) {
    if ((!force && !this.collection==='features') || (!force && this.$store.state[`_col_${this.collection}_selected`])) return Promise.reject();
    const self = this
    console.log('EDITABLEDATALIST updating collection ' + this.collection)
    return new Promise((res,rej)=>{
      let request = this.collection
      if (this.collection==='features') {
        const layer = self.filterId
        request = {
          name : 'features',
          layer : layer
        }
        if (!layer || (!force && this.$store.state._col_features[layer])) rej('No layer specified')
      }
      self.$store.dispatch('UPDATE_COLLECTION',request)
      .then(x=>{
        self.$forceUpdate()
        res(x)
      })
      .catch(err=> {
        console.log('update failed',err)
        rej()
      })
    })

    //promises.forEach(x=>{
    //  x.then(console.log('updated'))
    //  })
    //Promise.all(promises).then(x=>{console.log('updated store')})

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
  schemaFromAttributes(attrs) {
    //console.log('selected layer', this.$store.state.selected.layers)
    console.log('schema from attributes, attrs', attrs)
    return attrs.reduce((acc,x)=> {
      if (x.layer === this.$store.state._col_layers_selected) {
        x._text = x._text || x.name
        acc[x.name] = x
      }
      return acc
    },{})
  },
  selectFeature(item,value) {
    console.log(item)
    this.$store.commit("UPDATE_FEATURE_PROPERTIES",{layer:this.$store.state._col_layers_selected, feature: item})
  },
  select(index,id) {
    console.log('index',index,id  );
    //console.log('feature data type',this.geoDataType)
    this.selected = index
    this.selectedId = id
    console.log('updating selected value: ', this.collection, id)
    //this.$store.commit("UPDATE",{key:['selected',this.collection],value:id})
    this.$store.commit("UPDATE",{key:'_col_'+this.collection+'_selected',value: id})

    this.$nextTick(() => this.$forceUpdate())
    //this.$forceUpdate()

  },
  add(collection) {
    console.log(collection)
    this.mode = 'Add'
    this.editedCollection = collection
    this.edited = this.templateFromSchema(dbconfig[collection].schema)
    this.dialog = true
    console.log('dialog data', collection,this.edited)
  },
  edit(collection,item,path) {
    this.mode = 'Edit'
    //let item = this.$store.state[`_col_${collection}`][index]
    let schema = this.templateFromSchema(dbconfig[collection].schema)
    const items = this.$store.state[`_col_${collection}`]
    if (path) {

      for(var x=0;x<items.length;x++){
        if (item === this.getNested(path,items[x])) {
          item._id = items[x]._id
          this.editedIndex = x
          break
        }
      }
      //item = this.getNested(path,item)
      schema = this.getNested(path,schema)
      item._path = path

    } else {
      this.editedIndex = items.indexOf(item)
    }
    this.edited = Object.assign({}, schema, item)
    this.editedCollection = collection
    this.dialog = true
    //console.log('dialog data', collection,index,path,item,this.edited)
    console.log('this',this)
  },
  del(collection,id) {
    this.loading = true
    confirm('Are you sure you want to delete this item?') && api.del(collection,id).then(x=>{
      this.updateCollection(true)
      this.selected = this.selected > 0 ? this.selected - 1 : 0;
      this.loading = false;
    })
  },
  close() {
    this.saving = false
    this.dialog = false
  },
  save(collection,id,path) {

    this.saving = true;
    this.close()
    if (this.filter) {
      this.edited.layer = this.filterId
    }
    const colparams = dbconfig[collection].params ? this.selectedId : ''
    const params = { id: id ,path: this.edited._path }

    console.log('saving', [collection, id, this.edited])

    api.update(collection,params,this.edited,{},colparams).then(x=>{
      this.updateCollection(true)
      this.close()
    })

  },
  saveMany(collection,layerid) {
    this.saving = true;
    console.log('filterId: ' + this.filterId + ' collection: ' + collection)

    if (this.pastedComputed[0] && Object.keys(this.pastedComputed[0]).length > 1) {
      this.pastedComputed = this.pastedComputed.map(x=>{
        x.layer = this.filterId
        return x
      })
      let formData = new FormData();
      formData.append('data', JSON.stringify(this.pastedComputed))
      console.log('making request...')
      api.create(collection,'',formData).then(x=>{
        console.log('uploaded')
        this.updateCollection(true)
        this.close()
        this.pasted = ''
      })
    }

  },
  toggleSelectAll() {
    const data = this.addSelects(this.items, this.selectAll)
    const request = {
      name : 'features',
      layer : this.filter,
      data : this.addSelects(this.items, this.selectAll)
    }

    this.$store.dispatch('UPDATE_COLLECTION', request)
    .then(()=> this.$forceUpdate())
  },
  deleteSelected() {
    console.log(this.items)
    const data = this.items.filter(x=>x.feature._selected)
    confirm('Are you sure you want to delete '+data.length+' items?') &&
    api.deleteMany('features','',data.map(x=>x._id),'',this.filterId)
    .then(()=>{
      console.log('deleted')
      this.updateCollection(true)
    })
  },
  getNested (p, o) {
    p = typeof p === 'string' ? p.split('.') : p
    if (!p) return o
    const n =  p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)
    //console.log('nested',n)
    return n
  },
    forceUpdate() {
      this.$forceUpdate()
      console.log('force updated', this.$store.getters.selectedLayerAttributes)
    },
    logStore() {
      console.log('data',this)
      console.log('store',this.$store.state)
    }

  },
  watch: {
    dialog(val) {
      console.log(val)
      val || this.close();
    },
    menuItems (newVal) {
      console.log('menuItems', newValue)
    },
    filterId (newValue) {
      console.log('WATCH: layerchanged',newValue)
      if (this.collection==='features') this.updateCollection()
    }
  },
  created () {

    console.log('created')
    this.updateCollection()
    .then(x=>{
      /*console.log('fetching ' +this.collection,x)
      if (!this.$store.state['_col_'+this.collection+'_selected']) this.select(0,x[0]._id)
      console.log('firstid',x[0]._id)*/
    }) // update store with selected value
    .catch(err=>console.log('failed to update store'))

  },
  mounted () {
  }
}
</script>

<style>
.attribute-row:hover .attribute-controls{
  display: block;
}
.attribute-controls {
  position: absolute;
  margin-right:0;
  top:-10px;
  right:-20px;
  display: none;
  border-radius:25px;
  z-index:10;
  min-width:120px;
}
.attribute-controls-wrapper {
  position:relative;
  width:100%;
}
.heading-tab {
  background:none;
  color:rgba(0,0,0,0.54);
  font-size:1.2em;
  font-weight:500;
  margin-top:20px;
  padding: 8px;
  padding-left: 15px;
  width:200px;
}

.attribute-controls > button.v-btn.v-btn--outline {
  height:30px !important;
  width:30px !important;
  margin-left: 0;
  margin-right: 4px;
  background:#f5f5f5!important;
}

.code {
  background-color:none;
}
.vjs-tree {
  font-size: 0.95em;
}
.v-tabs__container {
  margin-left:50px;
}

.data-toolbar {
  position:absolute;
  right:12px;
  top:0;
  margin-top:-50px;
}
.v-list__tile--active{
  border-right: 3px solid;
  background-color: rgba(0,0,0,0.02);
  border-right-color: var(--v-primary-base);
}
.no-background,.no-background div {
  background:none !important;
}
.v-input--checkbox .v-input__control .v-input__slot {
  margin-bottom:0 !important;
}
.v-input--checkbox .v-input__control .v-messages {
  min-height:0;
}

span.func-sum {
  color:var(--v-primary-base)!important;
}

span.func-count {
  color:#0ddb97 !important;
}

</style>
