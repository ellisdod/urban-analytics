<!-- HTML Template -->

<template>
  <v-container fluid grid-list-xl mt-2 >
    <!--UPLOAD-->
    <v-layout row wrap>
      <v-flex sm3 xs4 :key="updateKey">
        <div>{{mainCollection}}</div>
        <v-list dense style="background:none;">
          <v-list-tile class="attribute-row"
          v-for="(x, index) in $store.state.collections[mainCollection]"
          :key="x._id"
          @click="select(index, x._id)">
            <v-list-tile-avatar>
              <v-icon v-if="x.data_type==='Point'">scatter_plot</v-icon>
              <v-icon v-else-if="x.data_type==='LineString'">timeline</v-icon>
              <v-icon v-else-if="x.data_type==='MultiPolygon'">bubble_chart</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <div v-if="x._id" class="attribute-controls-wrapper">
                {{x.name}}
                <div class="attribute-controls">
                  <v-btn small fab color="grey" outline @click="edit(mainCollection, index)">
                    <v-icon>edit</v-icon>
                  </v-btn>
                  <v-btn small fab color="grey" outline @click="del(mainCollection, x._id)">
                    <v-icon>delete</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider/>
          <v-list-tile v-if="mainCollection" @click="add(mainCollection)" >
            <v-list-tile-avatar></v-list-tile-avatar>
            <v-list-tile-content>ADD {{ schemaNames[0].toUpperCase() }}</v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-flex>

      <v-flex sm6 xs8>
        <!--<div v-if="relatedCollection" class="display-1">{{relatedCollection}}</div>-->
        <div v-if="!selectedId" class="py-5 my-5 text-xs-center">
        <v-progress-circular class="py-5 my-5" indeterminate></v-progress-circular>
        <div class="mt-3">Loading data...</div>
        </div>

<v-card>
<map-view v-if="selectedId&&featuresCollection" contextmenu=""
          style="position:relative;height:400px;"
          :features="$store.state.collections[featuresCollection].filter(x=>x.feature)"
          :features-collection="featuresCollection"
          :dataType = "geoDataType"
          zoomLevel="12"
          >
</map-view>
</v-card>

<v-card>
<v-tabs
   v-model="datatableTab"
   color="#fff"
   slider-color="primary"
   class="mt-4"
 >
   <v-tab ripple>{{relatedCollection}}</v-tab>
   <v-tab ripple>{{featuresCollection}}</v-tab>
   <v-tab-item v-if="selectedId&&relatedCollection">

<v-data-table
:headers="relatedHeaders"
:items="$store.state.collections[relatedCollection]"
:rows-per-page-items="[-1]"
>
<template v-slot:items="props">
  <tr class="attribute-row">
    <td><b>{{ props.item.name }}</b></td>
    <td>{{ props.item.type }}</td>
    <td class="text-xs-center">
      <template v-for="func in props.item.func">
        <v-chip v-if="func.slice(0,3)==='sum'" small color="green" outline>{{ func }}</v-chip>
        <v-chip v-else-if="func==='count'" small color="blue" outline>{{ func }}</v-chip>
        <v-chip v-else small color="grey" outline >{{ func }}</v-chip>
      </template>
    </td>
    <td class="text-xs-center">
      <div class="attribute-controls-wrapper">
        <v-icon v-if="props.item.required">check</v-icon>
        <div v-else>-</div>
        <div class="attribute-controls">
          <v-btn small fab color="grey" outline  @click="edit(relatedCollection, props.index)">
            <v-icon>edit</v-icon>
          </v-btn>
          <v-btn small fab color="grey" outline @click="del(relatedCollection, props.item._id)">
            <v-icon>delete</v-icon>
          </v-btn>
        </div>
      </div>
    </td>
  </tr>
</template>
</v-data-table>

<v-btn v-if="selectedId" @click="add(relatedCollection)" color="grey" style="float:right" class="mb-2" flat><v-icon>add</v-icon>Add {{ schemaNames[1] }}</v-btn>

</v-tab-item>

<v-tab-item v-if="selectedId&&featuresCollection">


<v-data-table
:headers="featureHeaders"
:items="$store.state.collections[featuresCollection]"
:rows-per-page-items="[20,50,100,-1]"
sortable
>
<template v-slot:items="props">
  <tr class="attribute-row" v-on:dblclick="edit(featuresCollection, props.index, 'feature.properties')">

    <td v-for="h in featureHeaders.slice(0,-1)">{{props.item.feature.properties[h.value]}}</td>

    <td class="text-xs-center">
      {{props.item.feature.properties[featureHeaders.slice(-1)[0].value]}}
      <div class="attribute-controls-wrapper">
        <div class="attribute-controls">
          <v-btn small fab color="grey" outline  @click="edit(featuresCollection, props.index, 'feature.properties')">
            <v-icon>edit</v-icon>
          </v-btn>
          <v-btn small fab color="grey" outline @click="del(featuresCollection, props.item._id)">
            <v-icon>delete</v-icon>
          </v-btn>
        </div>
      </div>
    </td>
  </tr>
</template>
</v-data-table>

</v-tab-item>
</v-tabs>
</v-card>


</v-flex>
<v-flex sm3 xs12>
  <v-expansion-panel expand v-bind:value="[true]">
    <v-expansion-panel-content>
      <template v-slot:header>
        <div>Feature</div>
      </template>
      <vue-json-pretty
      select-on-click-node
      highlight-selected-node
      highlight-mouseover-node
      show-length
      @click="selectNode"
      v-model="featureEdit"
      v-if="$store.state.selectedFeature"
      class="px-3 mb-2 code"
      :data="$store.getters.selectedFeature">
      </vue-json-pretty>
    </v-expansion-panel-content>
    </v-expansion-panel>

  <v-expansion-panel expand v-bind:value="[true]">
    <v-expansion-panel-content v-if="indicators">
      <template v-slot:header>
        <div>Indicators</div>
      </template>
      <vue-json-pretty
        class="pa-3 my-2 code"
        :data="$store.getters.indicatorsByArea">
      </vue-json-pretty>
    </v-expansion-panel-content>
  </v-expansion-panel>

</v-flex>
</v-layout>



<div class="data-toolbar">
   <v-btn v-if="featuresCollection==='features'&&selectedId"
   color="grey" class="mb-2" flat @click="uploadDialog=true">
    <v-icon class="mr-2">cloud_upload</v-icon>
    Upload
    </v-btn>

    <v-btn v-if="featuresCollection==='features'&&selectedId"
     color="grey" class="mb-2" flat @click="updateAnalysis()">
    <v-icon class="mr-2">assessment</v-icon>
    Update Feature Analysis
    </v-btn>
</div>

<v-dialog v-model="uploadDialog" max-width="600">
   <upload :layer="selectedId" v-bind:collections="[featuresCollection,'indicators']" :layerCollection="mainCollection"></upload>
</v-dialog>

<v-dialog v-if="editedSchema" v-model="dialog" max-width="500px">
  <v-card>
    <v-card-title>
      <span class="headline">{{mode}} {{ editedSchema.name.slice(0,editedSchema.name.length-1) }}</span>
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
            <v-select v-else-if="typeof i._options==='function'"
              v-model="edited[key]"
              :label="i._text"
              :small-chips="i._multiple"
              :multiple="i._multiple"
            v-bind:items="i._options($store,edited,relatedCollection)"
            item-text="name"
           item-value="_id">
          </v-select>
          <v-text-field v-else-if="i._text" v-model="edited[key]" :label="i._text"></v-text-field>
          <v-text-field v-else v-model="edited[key]" :label="i.name"></v-text-field>
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

<v-btn @click="logStore()">Log Store</v-btn>
</v-container>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
import Upload from './Upload.vue'
import MapView from './MapView.vue'

//TODO use this https://github.com/websanova/vue-upload

import api from '@/api.js'
const dbconfig = require('../db.config')

function getNested (p, o) {
  p = typeof p === 'string' ? p.split('.') : p
  return p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)
}



export default {
  components: {
    VueJsonPretty, Upload, MapView
  },
  props : ['mainCollection', 'relatedCollection', 'featuresCollection','indicators'],
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
      datatableTab:''
    }
  },
  computed : {
    menuItems () {
      //console.log('changed', this.$store.state.collections[this.mainCollection])
      //return this.$store.state.collections[this.mainCollection]
      return this.$store.getters.areaLayers
    },
    mainSchema () {
      const schema = dbconfig[this.$props.mainCollection]
      return schema ? schema : {}
    },
    relatedSchema () {
      const schema = dbconfig[this.$props.relatedCollection]
      return schema ? schema : {}
    },
    editedSchema() {
      if (this.editedCollection === 'features') {
        let tabledata = {
          name :  this.$store.state.collections[this.mainCollection][this.selected].name
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
      }
    },
    schemaNames () {
      //returns array of strings
      return [this.mainSchema.name,this.relatedSchema.name].reduce((acc,x)=>{
        if (x) {
          //console.log('check', x, typeof x)
          acc.push( x.slice(0,x.length - 1) )
        }
        return acc
      },[])
    },
    features () {
      return this.$store.state.collections[this.featuresCollection];
    },
    tabledata () {
      if(this.layer) return this.layer.attributes
    },
    featureHeaders() {
      if (!this.relatedCollection) return []
      console.log('featureheaders',this.$store.state.collections[this.relatedCollection].map(x=>x.name))
      return this.$store.state.collections[this.relatedCollection].map(x=>{
        return {value:x.name,text:x.name}
      })
      },
    relatedHeaders() {
        if (!this.relatedSchema) return []
        return Object.keys(this.relatedSchema.schema).reduce((acc,x)=>{
          const text = this.relatedSchema.schema[x]._text
            if (!text) return acc
            acc.push({value:x, text: text})
            return acc
          },[])
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
      geoDataType () {
        const col = this.$store.state.collections[this.mainCollection]
        if(col) {
          return col[this.selected].data_type || 'MultiPolygon'
        }
      },
    },
    methods: {
      updateStore () {
        let collections = [this.$props.mainCollection,this.$props.relatedCollection]
        //if (this.$props.relatedCollection) collections.push(this.$props.relatedCollection)
        /*if (this.$props.featuresCollection) {
          collections.push({
            name:this.$props.featuresCollection,
            query:this.$
          })
        }*/
      const promises = [
        this.$store.dispatch('UPDATE_COLLECTIONS',collections)
      ]
      if (this.indicators)  promises.push(this.$store.dispatch('UPDATE_INDICATORS'))
      //console.log(promises)
      Promise.all(promises).then(x=>{
        const self = this
        setTimeout(function(){
          console.log('updated',self.$store.state.collections[self.mainCollection])
          self.selectedId = self.selectedId || self.$store.state.collections[self.mainCollection][0]._id
          self.updateFeatures()
          self.$forceUpdate()
        }, 500);
      })
      //promises.forEach(x=>{
      //  x.then(console.log('updated'))
    //  })
      //Promise.all(promises).then(x=>{console.log('updated store')})

      },
      templateFromSchema(schema) {
        if (schema) return Object.keys(schema).reduce((acc,x)=>{
          acc[x] = x.type === Array ? [] : ''
          return acc
        },{});
      },
      updateFeatures() {
        const params = {
         name : this.featuresCollection,
         query : {},
         layer: this.selectedId
        }
        console.log(params)
        this.$store.dispatch('UPDATE_COLLECTIONS', [params]).then(x=>{
          const self=this
          setTimeout(function(){
            //console.log('updated')
            self.$forceUpdate()
          }, 500);
        })
      },
      select(index,id) {
        //.log('index',index);
        //console.log('feature data type',this.geoDataType)
        this.selected = index
        this.selectedId = id
        this.updateFeatures()
      },
      add(collection) {
        console.log(collection)
        this.mode = 'Add'
        this.editedCollection = collection
        this.edited = this.templateFromSchema(dbconfig[collection].schema)
        this.dialog = true
      },
      edit(collection,index,path) {
        this.mode = 'Edit'
        let item = this.$store.state.collections[collection][index]
        let schema = this.templateFromSchema(dbconfig[collection].schema)
        if (path) {
          const id = item._id
          item = getNested(path,item)
          schema = getNested(path,schema)
          item._id = id
          item._path = path
        }
        this.edited = Object.assign({}, schema, item)
        this.editedIndex = index
        this.editedCollection = collection
        this.dialog = true
        console.log('dialog data', collection,index,path,item,this.edited)
      },
      del(collection,id) {
        this.loading = true
        confirm('Are you sure you want to delete this item?') && api.del(collection,id).then(x=>{
          this.updateStore()
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
        if (!this.edited.layer && collection === this.relatedCollection) {
          this.edited.layer = this.selectedId
        }

        const params = { id: id ,path: this.edited._path }

        console.log('saving', [collection, id, this.edited])
        api.update(collection,params,this.edited,{},this.selectedId).then(x=>{
          this.updateStore()
          this.close()
        })
      },
      saveMany(collection,layerid) {
        this.saving = true;

        if (this.pastedComputed[0] && Object.keys(this.pastedComputed[0]).length > 3) {
          this.pastedComputed = this.pastedComputed.map(x=>{
            x.layer = this.selectedId
            return x
          })
          let formData = new FormData();
          formData.append('data', JSON.stringify(this.pastedComputed))
          api.create(collection,'',formData).then(x=>{
            this.updateStore()
            this.close()
            this.pasted = ''
          })
        }

      },
      updateAnalysis() {

        const layer = this.$store.state.collections['layers'][this.selected]
        layer.spatial_intersect.forEach(id=>
          {
            api.updateAnalysis('features',id,{},{},layer._id)
          })

      },
      logStore() {
        console.log('data',this)
        console.log('store',this.$store.state)
      },

      selectNode(path,data) {
        console.log(path,data)
      }


    },
    watch: {
      dialog(val) {
        console.log(val)
        val || this.close();
      },
      menuItems (newVal) {
          console.log('menuItems', newValue)
      }
    },
    created () {
      this.updateStore()
    },
    mounted () {
      self.$store.commit("UPDATE",{key:'selectedFeature',value:''})
      this.$store.watch(
     (state) => state.collections,
     (newValue, oldValue) => {
       // Do whatever makes sense now
       console.log('watching',this.$props.mainCollection,newValue)

     }
   );

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
  </style>
