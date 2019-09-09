
<template>
  <div class="editable-datatable">
    <div>
      <!-- DATA TABLE -->
      <div v-if="datatable" >
        <!--<div style="margin-top:-43px;float:right;">-->
        <v-toolbar flat color="rgba(0,0,0,0)">
          <v-toolbar-title class="grey--text text--darken-2 font-weight-light">{{title}}</v-toolbar-title>
           <v-spacer></v-spacer>
           <v-text-field v-if="searchable" label="Search" v-model="search" class="mt-2 mr-3">
           </v-text-field>

          <v-toolbar-items class="hidden-xs-only">
          <v-checkbox v-if="multiselect" v-model="selectAll" @change="toggleSelectAll()" color="grey" flat label="Select All" v-bind:class="['mr-2',{'mt-3':$vuetify.breakpoint.mdAndUp,'mt-2':$vuetify.breakpoint.smAndDown}]">
            <v-icon>add</v-icon>Add
          </v-checkbox>
          <v-btn v-if="multiselect" @click="deleteSelected(collection)" color="grey"flat>
            Delete Selected
          </v-btn>
          <v-btn @click="openEditor()" color="grey" flat>
            <v-icon>add</v-icon>Add
          </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-data-table
        v-if="items"
        :headers="featureHeaders"
        :items="items"
        :rows-per-page-items="[20,50,100]"
        v-bind:class="cssclass"
        :search = "search"
        class="ejmap-border"
        >
        <template v-slot:items="props">
          <tr class="attribute-row" v-on:dblclick="openEditor(props.item)">
            <!--Array.isArray(getNested(nestedPath,props.item)[h.value])
            schema.schema[h.value]._options.filter(x=>x.name===h.value)[0].color
          -->
          <td v-for="(h,ind) in featureHeaders"
            v-bind:class="[ind===0 ? 'font-weight-medium':'',h.type === Boolean ? 'text-xs-center':'' ]">

            <template v-if="h.type === Array">
              <v-chip
              v-for="o in getNested(h.value, props.item)"
              :class="'func-'+o"
              outline
              small>
              {{ typeof o === 'object' ? o['text_'+$store.state.language] || o['name_'+$store.state.language] || o.text || o.name  : o }}
            </v-chip>
          </template>

          <v-icon
           v-else-if="h.type === Boolean&&getNested(h.value, props.item)===true"
           small
           color="primary">
           check_circle
         </v-icon>


        <v-checkbox
        v-else-if="h.type === 'select'"
        style="padding-bottom:0;"
        color="grey"
        v-model="props.item._selected"
        >
        </v-checkbox>


        <template v-else>
          {{ getNested(h.value, props.item) }}
        </template>
        <!--
          <div v-if="ind===featureHeaders.length-1" class="attribute-controls-wrapper">
            <div class="attribute-controls" style="top:-30px;">
              <v-btn small fab color="grey" outline  @click="openEditor(props.item)">
                <v-icon>edit</v-icon>
              </v-btn>
              <v-btn small fab color="grey" outline @click="del(collection, props.item._id)">
                <v-icon>delete</v-icon>
              </v-btn>
            </div>
          </div>
        -->
        </td>
      </tr>
    </template>
  </v-data-table>
  <v-btn v-if="addbottom" style="float:right" @click="openEditor()" color="grey" class="mb-2" flat>
    <v-icon>add</v-icon>Add
  </v-btn>
</div>


<!-- LIST -->
<div v-else>
  <v-btn v-if="addtop" style="margin-top:-40px;float:right" @click="openEditor()" color="grey" class="mb-2" flat>
    <v-icon>add</v-icon>Add
  </v-btn>
  <v-list dense v-bind:class="cssclass">
    <v-list-tile class="attribute-row"
    v-for="(x, index) in listItems"
    :key="index"
    v-model="x.active"
    @click="select(index, x._id)"
    v-on:dblclick="openEditor(x)"
    >
    <v-list-tile-action v-if="listKey&&schema.schema[listKey]._options&&schema.schema[listKey]._options[0]">
      <v-icon>{{schema.schema[listKey]._options.filter(i => i.name === x[listKey])[0].icon}} </v-icon>
    </v-list-tile-action>
    <v-list-tile-content>
      <div v-if="x._id" class="attribute-controls-wrapper">
        {{x.text || x.text_en || x.name}}
        <!--
        <div v-if="!disabled" class="attribute-controls">
          <v-btn small fab color="grey" outline @click="openEditor(x)">
            <v-icon>edit</v-icon>
          </v-btn>
          <v-btn small fab color="grey" outline @click="del(collection, x._id)">
            <v-icon>delete</v-icon>
          </v-btn>
        </div>
      -->
      </div>
    </v-list-tile-content>

    <div v-if="x.active" style="height:100%;"></div>
  </v-list-tile>
</v-list>
<v-btn v-if="addbottom" @click="openEditor()" color="grey" style="float:right" class="mb-2" flat>
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

<v-dialog v-if="schema&&dialog" v-model="dialog" max-width="700px">
  <editor
  :collection="collection" :filter="filter" :editItem="editItem" :nestedPath="nestedPath" v-on:close="close()" v-on:update="updateCollection(true)">
</editor>
</v-dialog>
</div>

</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
import Upload from './Upload.vue'
import Editor from './Editor.vue'
import api from '@/api.js'
const arrayUtils = require('../plugins/arrayUtils')
const dbconfig = require('../db.config')
const flatten = require('flatten-obj')()

//TODO use this https://github.com/websanova/vue-upload

export default {
  components: {
    VueJsonPretty, Upload, Editor
  },
  props : ['collection','filter','datatable','listKey','nestedPath','cssclass','addtop','addbottom','multiselect','disabled','searchable','title'],
  data() {
    return {
      search : '',
      updateKey : 0,
      dialog: false,
      mode : null,
      saving : false,
      editedIndex : null,
      layerDialog : false,
      attributeDialog : false,
      selected : 0,
      selectedId : '',
      editedCollection : null,
      edited : {},
      editItem : null,
      selectAll:false,
      items : [],
    }
  },
  computed : {
    schema () {
      return this.$store.getters.collectionSchema(this.collection,this.filter)
    },
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
      //console.log('listitems',items)
      return items
    },

    firstItem () {
      const col = this.$store.state[`_col_${self.collection}`]
      if (col) {
        return   this.$store.state[`_col_${self.collection}`][0]
      } else {
        return {}
      }
    },

    tabledata () {
      if(this.layer) return this.layer.attributes
    },
    featureHeaders () {
      if (!this.schema.schema) return []
      let base = this.multiselect ? [{value:'_selected',type:'select',_text:'', sortable: false}] : []
      const x = Object.keys(this.schema.schema).reduce((acc,x)=>{
        if (this.schema.schema[x]._text) acc.push({
          value: this.nestedPath ? this.nestedPath + '.' + x : x,
          text:this.schema.schema[x]._text,
          type:this.schema.schema[x].type,
          class:['datatable-header','theme--dark']
        })
        return acc
      },base)
      /*const x = this.$store.state.collections[this.collection].map(x=>{
      return {value:x.name,text:x.name}
    })*/
    //console.log('featureHeaders',x)
    return x
  },


},
methods: {
  prepareItems () {
    console.log('preparing items',this.collection, this.filterId)
    let items = []
    if (dbconfig[this.collection].storeByLayer) {
      items = this.$store.state[`_col_${this.collection}`][this.filterId] || []
      items = Array.isArray(items) ? items : items[this.$store.state.neighbourhood]
    } else {
      items = Array.from(this.$store.state[`_col_${this.collection}`])
      if (this.filter &&items[0]) items = items.filter(x=>x.layer === this.filterId)
    }
    console.log('items',items)
    //if (this.nestedPath) items = items.map(x=>flatten(x))
    return this.multiselect ? this.addSelects(items) : items || []
  },
  getNested (path,obj) {
    if (!path) return obj
    return arrayUtils.getNested(path,obj)
  },
  openEditor (item) {
    this.editItem = item
    this.dialog = true
  },
  addSelects (items,value) {
    if (!this.multiselect) return items
    return items.map((x,i)=>{
      //const p = this.nestedPath ? arrayUtils.getNested(this.nestedPath, x) : x
      x._selected = value || false
      x._index = i
      return x
    })
  },
  updateCollection (force) {
    if (!force && !dbconfig[this.collection].storeByLayer && this.$store.state[`_col_${this.collection}_selected`]) {
      this.items = this.prepareItems()
      console.log('rejecting')
      return Promise.reject();
    }
    const self = this
    //console.log('EDITABLEDATALIST updating collection ' + this.collection)
    return new Promise((res,rej)=>{
      let request = this.collection
      if (dbconfig[this.collection].storeByLayer) {
        const layer = self.filterId
        request = {
          name : this.collection,
          layer : layer
        }
        if (!layer || (!force && this.$store.state._col_features[layer])) rej('No layer specified')
      }
      self.$store.dispatch('UPDATE_COLLECTION',request)
      .then(x=>{
        //console.log('forcing update')
        this.items = this.prepareItems()
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
  setMode() {
    this.$store.commit("UPDATE",{key:'mode',value: this.collection})
  },
  select(index,id) {
    //console.log('index',index,id  );
    //console.log('feature data type',this.geoDataType)
    this.selected = index
    this.selectedId = id
    //console.log('updating selected value: ', this.collection, id)
    //this.$store.commit("UPDATE",{key:['selected',this.collection],value:id})
    this.$store.commit("UPDATE",{key:'_col_'+this.collection+'_selected',value: id})
    this.setMode()
    const self = this;
    this.$nextTick(() => self.$forceUpdate())
    //this.$forceUpdate()
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
    this.dialog = false
  },
  toggleSelectAll() {
    const data = this.addSelects(this.items, this.selectAll)
    const request = {
      name : 'features',
      layer : this.$store.state['_col_'+this.filter+'_selected'],
      data : data
    }
    const self = this
    this.$store.dispatch('UPDATE_COLLECTION', request)
    .then(()=> self.$forceUpdate())
  },
  deleteSelected() {
    //console.log(this.items)
    let query;
    const data = this.items.reduce((acc,x,index)=>{
      if (!x._selected) return acc
      x._selected = false
      this.$set(this.items,index, x)
      acc.push(x)
      return acc
    },[])
    const filter = dbconfig[this.collection].params ? this.filterId : null
    if (!confirm('Are you sure you want to delete '+data.length+' items?')) return null
    if (this.selectAll && this.filter) query = {'layer':this.$store.state['_col_'+this.filter+'_selected']}
    else query = data.map(x=>x._id)
    api.deleteMany(this.collection,'',query,'',filter)
    .then(()=>{
      console.log('deleted')
      this.updateCollection(true)
    })
  },
  logStore() {
    //console.log('data',this)
    //console.log('store',this.$store.state)
  }

},
watch: {
  dialog(val) {
    //console.log(val)
    val || this.close();
  },
  menuItems (newVal) {
    //console.log('menuItems', newValue)
  },
  filterId (newValue) {
    //console.log('WATCH: layerchanged',newValue)
    if (this.collection==='features') this.updateCollection()
    this.$nextTick(()=>this.items = this.prepareItems())
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
  if (!this.datatable) this.setMode()
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

.data-toolbar {
  position:absolute;
  right:12px;
  top:0;
  margin-top:-50px;
}
.editable-datatable .v-list__tile--active{
  border-right: 3px solid;
  background-color: var(--v-grey-lighten3);
  border-right-color: var(--v-primary-base);
}
.editable-datatable .v-list__tile--active .v-list__tile__content {
  font-weight:500;
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

.editable-datatable th {
  color:#000 !important;
}


span.func-sum {
}

span.func-count {
}

</style>
