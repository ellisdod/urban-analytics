<!-- HTML Template -->

<template>
  <v-container  grid-list-xl mt-4 >
    <!--UPLOAD-->
    <v-layout row wrap>
      <v-flex xs4>
        <div class="heading-tab">Layers</div>
        <v-list dense>
          <v-list-tile class="attribute-row" v-for="(layer, index) in $store.state.layers" @click="selectTable(index)">
            <v-list-tile-avatar>
              <v-icon v-if="layer.data_type==='Point'">gps_fixed</v-icon>
              <v-icon v-else-if="layer.data_type==='LineString'">timeline</v-icon>
              <v-icon v-else-if="layer.data_type==='MultiPolygon'">bubble_chart</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <div v-if="layer" class="attribute-controls-wrapper">
              {{layer.text_en}}
              <div class="attribute-controls">
                <v-btn small fab color="grey" outline @click="editLayer(index,'Edit')">
                 <v-icon>edit</v-icon>
                </v-btn>
                <v-btn small fab color="grey" outline @click="deleteLayer(layer._id)">
                 <v-icon>delete</v-icon>
                </v-btn>
              </div>
             </div>
            </v-list-tile-content>

          </v-list-tile>
          <v-divider/>
          <v-list-tile @click="addLayer()" >
            <v-list-tile-avatar>

            </v-list-tile-avatar>
            <v-list-tile-content>
              ADD LAYER
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-flex>
      <v-flex xs8>
        <div v-if="layer" class="display-1">{{layer.text_en}}</div>
        <div class="heading-tab">Attributes</div>
        <v-data-table
        :headers="attributeHeaders"
        :items="tabledata"
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
              <v-btn small fab color="grey" outline  @click="editAttribute(props.item,'Edit')">
               <v-icon>edit</v-icon>
              </v-btn>
              <v-btn small fab color="grey" outline @click="deleteAttribute(props.item)">
               <v-icon>delete</v-icon>
              </v-btn>
             </div>
           </div>
          </td>
        </tr>
        </template>
       </v-data-table>

  <v-dialog v-model="attributeDialog" max-width="500px">
  <template v-slot:activator="{ on }">
   <v-btn @click="editAttribute(null,'Add')" color="grey" outline style="float:right" class="mb-2" depressed v-on="on" round>Add attribute</v-btn>
  </template>
  <v-card>
    <v-card-title>
      <span class="headline">{{mode}} Attribute</span>
    </v-card-title>
    <v-card-text>
      <v-container grid-list-md>
        <v-layout wrap>
          <v-flex xs12>
            <v-text-field v-model="editedAttribute.name" label="Name"></v-text-field>
            <v-select v-model="editedAttribute.type" :items="attributeTypes" label="Type"></v-select>
            <v-combobox v-model="editedAttribute.func" :items="attributeFunctions" small-chips multiple label="Function"></v-combobox>
            <v-switch v-model="editedAttribute.required" label="Required"></v-switch>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="grey lighten-1" flat @click="closeAttribute">Cancel</v-btn>
      <v-progress-circular v-if="saving" indeterminate mx-3>Saving...</v-progress-circular>
      <v-btn v-else color="blue darken-1" flat @click="saveAttribute()">Save</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<v-dialog v-model="layerDialog" v-if="editedLayer" max-width="500px">
<v-card>
<v-card-title>
<span class="headline">Add Layer</span>
</v-card-title>
<v-card-text>
<v-container grid-list-md>
  <v-layout wrap>
    <v-flex v-for="i in layerSchema" xs12>
      <v-select v-if="i.options" v-model="editedLayer[i.value]" :label="i.text" v-bind:items="i.options.map(x=>x.name)"></v-select>
      <div v-else-if="i.array&&!editedLayer.attributes[0]" class="grey--text">
        <div class="subheading">Paste attributes</div>
        <v-text-field v-model="attributesPasted" :label="i.text" textarea auto-grow hint="Name, Type, Func, Required" rows="3"></v-text-field>
        Paste attributes as rows of text, separated by commas or tabs: <br>
        FID, Number, count, true<br>
        students Number  sum false
      </div>
      <vue-json-pretty
      v-else-if="i.array&&editedLayer.attributes"
      class="pa-3 my-2 code"
      :data="editedLayer.attributes">
      </vue-json-pretty>
      <v-text-field v-else v-model="editedLayer[i.value]" :label="i.text"></v-text-field>
    </v-flex>
  </v-layout>
</v-container>
</v-card-text>

<v-card-actions>
<v-spacer></v-spacer>
<v-btn color="grey lighten-1" flat @click="closeLayer()">Cancel</v-btn>
<v-progress-circular v-if="saving" indeterminate mx-3>Saving...</v-progress-circular>
<v-btn v-else color="blue darken-1" flat @click="saveLayer(editedLayer._id)">Save</v-btn>
</v-card-actions>
</v-card>
</v-dialog>

   <div v-if="layer&&$store.state.layers[selected]">
     <map-view style="height:400px;" :features="geodata"></map-view>
     <div class="heading-tab">Upload Data</div>
     <upload :layer="$store.state.layers[selected].name" collection="features"></upload>
   </div>
    </v-flex>
  </v-layout>

  <v-btn @click="logStore()">Log Store</v-btn>
</v-container>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
import Upload from './Upload.vue'
import MapView from './MapView.vue'

//TODO use this https://github.com/websanova/vue-upload

import api from '@/api.js'


export default {
  components: {
    VueJsonPretty, Upload, MapView
  },
  data() {
    return {
      geodata : [],
      mode : null,
      saving : false,
      editedIndex : null,
      layerDialog : false,
      attributeDialog : false,
      selected : 0,
      attributesPasted : null,
      attributeTypes: ['String','Number','Boolean'],
      attributeHeaders : [
        { text: 'Name', value: 'name' },
        { text: 'Type', value: 'type' },
        { text: 'Function', value: 'func' },
        { text: 'Required', value: 'required' }
      ],
      editedAttribute : {
        name : '',
        type : '',
        func : [],
        required : ''
      },
      editedLayer : {},
      defaultLayer : null,
      defaultAttribute : null,
      layerSchema:[
        {
          value : 'name',
          text : 'Name'
        },
        {
          value : 'text_en',
          text : 'Text (English)'
        },
        {
          value : 'text_ar',
          text : 'Text (Arabic)'
        },
        {
          value : 'data_type',
          text : 'Type',
          options : [
          {
            name : 'Point',
            icon : 'gps_fixed'
          },
          {
            name : 'LineString',
            icon : 'timeline'
          },
          {
            name :'MultiPolygon',
            icon : 'bubble_chart'
          }
        ]
      },
      {
        value : 'spatial_intersect',
        text : 'Spatial Intersect'
      },
      {
        value : 'attributes',
        text : 'Attributes',
        array : true,
      },
      ],
    }

  },
  computed : {
    layer () {
      if (!this.$store.state.layers[0]) return {}
      const params = {
        collection: this.$store.state.layers[this.selected].name,
        query: {
          location : this.$store.state.neighbourhood
        }
      }
      this.$store.commit('UPDATE_FEATURES', params)
      return this.$store.state.layers[this.selected];
    },
    tabledata () {
      if(this.layer) return this.layer.attributes
    },
    attributeFunctions () {
      if(this.tabledata) {
        let baseOpts = ['count','']
        baseOpts = this.editedAttribute.type === 'Number' ? baseOpts.concat(['sum']) : baseOpts
        return this.tabledata.reduce((acc,x)=>{
        if (x.type === 'Number') acc.push(`sum: ${x.name}`)
        return acc
      },baseOpts)
    }
    },
    attributesComputed () {
        let str = this.attributesPasted
        if (!str) return []
        str = str.replace(/\t/g, ',')
        console.log('replaced',str)

        const rows = str.split('\n')
        return rows.reduce((acc,x)=>{
          const arr = x.split(',')
          if (arr.length < 2) return acc
          acc.push({
            name:arr[0].trim(),
            type:arr[1].trim(),
            func:[arr[2].trim()],
            required:arr[3].trim() == 'true'
          })
          return acc
        },[])
      }
  },
  methods: {
    initialize () {
      this.$store.commit('GET_LAYERS');
      this.editedLayer = this.layerSchema.reduce((acc,x)=>{
        acc[x.value]=''
        return acc
      },{});
      this.defaultLayer = Object.assign({},this.editedLayer)
      this.defaultAttributes = Object.assign({},this.editedAttributes)
    },
    selectTable(index){
      console.log('index',index);
      this.selected = index
      console.log('tabledata',this.layer.attributes)
    },
    addLayer() {
      this.mode = 'Add'
      this.layerDialog = true
    },
    editLayer(index,mode) {
      this.mode = mode
      this.editedLayer = Object.assign({},this.$store.state.layers[index]||{})
      this.editedIndex = index
      this.layerDialog = true
    },
    deleteLayer(id) {
      this.loading = true;
      console.log(id);
      confirm('Are you sure you want to delete this item?') && api.del('layers',id).then(x=>{
        this.$store.commit('GET_LAYERS');
        this.selected = this.selected > 0 ? this.selected - 1 : 0;
        this.loading = false;
      })
    },
    closeLayer() {
      this.editedLayer = Object.assign({},this.defaultLayer)
      this.saving = false;
      this.layerDialog = false;
    },
    saveLayer(id) {
      //this.layers[this.editedLayer.name] = Object.assign({},this.editedLayer)
      this.saving = true;
      console.log(id)

      //process pasted attributes
      if (this.attributesComputed[0] && Object.keys(this.attributesComputed[0]).length > 3) {
        this.editedLayer.attributes = this.attributesComputed.slice(0)
      }
      this.attributesPasted = ''

      //add area attributes
      const areaAttributes = this.layer.spatial_intersect
          .forEach(x=> {
          const area = {
            name:x,
            func:[],
            type : 'Number',
            required:false
          }
          if (this.editedLayer.attributes.indexOf(area)===-1) this.editedLayer.attributes.push(area)
        }
        )

      api.update('layers',{id:id},this.editedLayer).then(x=>{
        this.$store.commit('GET_LAYERS');
        this.closeLayer()
      })
    },
    editAttribute(item,mode) {
      this.mode = mode
      this.editedIndex = mode === 'Add' ? null : this.layer.attributes.indexOf(item);
      //console.log('index', this.editedIndex, this.editedAttribute, this.attributeTypes.indexOf(item.type))
      this.editedAttribute = Object.assign({}, item)
      this.attributeDialog = true
    },
    deleteAttribute(attribute) {
      const layer = Object.assign({},this.layer)
      const index = layer.attributes.indexOf(attribute)
      console.log('deleting index',index)
      layer.attributes.splice(index,index+1)
      confirm('Are you sure you want to delete this item?') && api.update('layers',{id:layer._id},layer).then(x=>{
        this.$store.commit('GET_LAYERS');
      })
    },
    saveAttribute() {
      console.log(this.editedAttribute)
      const layer = Object.assign({},this.layer)
      if (this.editedIndex===null) {
        layer.attributes.push(this.editedAttribute)
      } else {
        layer.attributes.splice(this.editedIndex,this.editedIndex+1,this.editedAttribute)
      }
      api.update('layers',{id:layer._id},layer).then(x=>{
        this.$store.commit('GET_LAYERS');
        this.closeAttribute()
      })
    },
    closeAttribute() {
      this.editedAttribute = Object.assign({},this.defaultAttribute)
      this.attributeDialog = false;
      this.saving = false;
    },
    logStore() {
      console.log(this.$store.state)
    }

  },
  watch: {
    layerDialog(val) {
        console.log(val)
        val || this.closeLayer();
    },
    attributeDialog(val) {
        console.log(val)
        val || this.closeAttribute();
    }
  },
  created () {
    this.initialize()
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
  background-color:#fff;
  font-size:20px;
  font-weight:bold;
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
</style>
