!function(t){function e(e){for(var i,o,s=e[0],l=e[1],c=e[2],d=0,p=[];d<s.length;d++)o=s[d],n[o]&&p.push(n[o][0]),n[o]=0;for(i in l)Object.prototype.hasOwnProperty.call(l,i)&&(t[i]=l[i]);for(u&&u(e);p.length;)p.shift()();return a.push.apply(a,c||[]),r()}function r(){for(var t,e=0;e<a.length;e++){for(var r=a[e],i=!0,s=1;s<r.length;s++){var l=r[s];0!==n[l]&&(i=!1)}i&&(a.splice(e--,1),t=o(o.s=r[0]))}return t}var i={},n={0:0},a=[];function o(e){if(i[e])return i[e].exports;var r=i[e]={i:e,l:!1,exports:{}};return t[e].call(r.exports,r,r.exports,o),r.l=!0,r.exports}o.m=t,o.c=i,o.d=function(t,e,r){o.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(t,e){if(1&e&&(t=o(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(o.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)o.d(r,i,function(e){return t[e]}.bind(null,i));return r},o.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(e,"a",e),e},o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},o.p="/";var s=window.webpackJsonp=window.webpackJsonp||[],l=s.push.bind(s);s.push=e,s=s.slice();for(var c=0;c<s.length;c++)e(s[c]);var u=l;a.push([134,1]),r()}({129:function(t,e,r){"use strict";var i=r(24);r.n(i).a},130:function(t,e,r){"use strict";var i=r(25);r.n(i).a},131:function(t,e,r){"use strict";var i=r(26);r.n(i).a},134:function(t,e,r){"use strict";r.r(e);var i=r(7),n=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("v-app",{attrs:{id:"keep"}},[r("v-navigation-drawer",{staticClass:"grey lighten-4",attrs:{fixed:"","hide-overlay":"",left:"",clipped:""},model:{value:t.drawer,callback:function(e){t.drawer=e},expression:"drawer"}},[r("div",{staticStyle:{height:"70px"}}),t._v(" "),r("v-list",{staticClass:"grey lighten-4",attrs:{dense:""}},[t._l(t.items,function(e,i){return[e.children?r("v-list-group",{key:e.text,attrs:{"prepend-icon":e.model?e.icon:e["icon-alt"],"append-icon":""},scopedSlots:t._u([{key:"activator",fn:function(){return[r("v-list-tile",[r("v-list-tile-content",[r("v-list-tile-title",[t._v("\n              "+t._s(e.heading)+"\n            ")])],1)],1)]},proxy:!0}],null,!0),model:{value:e.model,callback:function(r){t.$set(e,"model",r)},expression:"item.model"}},[t._v(" "),t._l(e.children,function(e,i){return r("v-list-tile",{key:i,on:{click:function(t){}}},[r("v-list-tile-action",[r("v-icon",[t._v("\n          "+t._s(e.icon)+"\n        ")])],1),t._v(" "),r("v-list-tile-content",[r("v-list-tile-title",[t._v("\n          "+t._s(e.text)+"\n        ")])],1)],1)})],2):e.heading?r("v-layout",{key:i,attrs:{row:"","align-center":""}},[r("v-flex",{attrs:{xs6:""}},[e.heading?r("v-subheader",[t._v("\n      "+t._s(e.heading)+"\n    ")]):t._e()],1)],1):e.divider?r("v-divider",{key:i,staticClass:"my-3",attrs:{dark:""}}):r("v-list-tile",{key:i,attrs:{to:e.route}},[r("v-list-tile-action",[r("v-icon",[t._v(t._s(e.icon))])],1),t._v(" "),r("v-list-tile-content",[r("v-list-tile-title",{staticClass:"grey--text"},[t._v("\n    "+t._s(e.text)+"\n  ")])],1)],1)]})],2)],1),t._v(" "),r("v-toolbar",{attrs:{dark:"",color:"#1c222d",app:"",absolute:"","clipped-left":"","clipped-right":""}},[r("v-layout",{attrs:{"align-center":"","justify-end":"","fill-height":""}},[r("v-toolbar-side-icon",{on:{click:function(e){t.drawer=!t.drawer}}}),t._v(" "),r("div",{staticClass:"ml-3 mr-5"},[r("div",{staticClass:"subheading"},[t._v("East Jerusalem ")]),t._v(" "),r("div",{staticClass:"subheading font-weight-light"},[t._v("Neighbourhood Map")])]),t._v(" "),r("v-spacer"),t._v(" "),t.activeUser?r("div",{staticClass:"pt-1 mr-1"},[t._v(t._s(t.activeUser.email))]):r("v-btn",{attrs:{small:""},on:{click:function(e){return e.preventDefault(),t.login(e)}}},[t._v("Log in")]),t._v(" "),t.activeUser?r("v-menu",{attrs:{"min-width":"300","offset-y":""},scopedSlots:t._u([{key:"activator",fn:function(e){var i=e.on;return[r("v-btn",t._g({attrs:{fab:"",dark:"",flat:"",small:"",outline:""}},i),[r("v-icon",[t._v("person")])],1)]}}],null,!1,2642177997)},[t._v(" "),r("v-card",[r("v-list",[r("v-list-tile",{attrs:{avatar:""}},[r("v-list-tile-content",[r("v-list-tile-title",[t._v(t._s(t.activeUser.name))]),t._v(" "),r("v-list-tile-sub-title",[t._v("IPCC")])],1)],1)],1),t._v(" "),r("v-divider"),t._v(" "),r("v-card-actions",[r("v-spacer"),t._v(" "),r("v-btn",{attrs:{color:"primary",flat:""},on:{click:t.logout}},[t._v("Logout")])],1)],1)],1):t._e()],1)],1),t._v(" "),r("v-content",[r("router-view",{staticStyle:{height:"100%"}})],1)],1)};n._withStripped=!0;var a=r(1),o=r.n(a),s=r(4),l=r.n(s),c=r(19),u=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("v-data-table",{staticClass:"elevation-1",attrs:{headers:t.headers,items:t.desserts},scopedSlots:t._u([{key:"items",fn:function(e){return[r("td",[t._v(t._s(e.item.name))]),t._v(" "),r("td",{staticClass:"text-xs-right"},[t._v(t._s(e.item.calories))]),t._v(" "),r("td",{staticClass:"text-xs-right"},[t._v(t._s(e.item.fat))]),t._v(" "),r("td",{staticClass:"text-xs-right"},[t._v(t._s(e.item.carbs))]),t._v(" "),r("td",{staticClass:"text-xs-right"},[t._v(t._s(e.item.protein))]),t._v(" "),r("td",{staticClass:"text-xs-right"},[t._v(t._s(e.item.iron))])]}}])})};u._withStripped=!0;var d={data:function(){return{headers:[{text:"Dessert (100g serving)",align:"left",sortable:!1,value:"name"},{text:"Calories",value:"calories"},{text:"Fat (g)",value:"fat"},{text:"Carbs (g)",value:"carbs"},{text:"Protein (g)",value:"protein"},{text:"Iron (%)",value:"iron"}],desserts:[{name:"Frozen Yogurt",calories:159,fat:6,carbs:24,protein:4,iron:"1%"},{name:"Ice cream sandwich",calories:237,fat:9,carbs:37,protein:4.3,iron:"1%"},{name:"Eclair",calories:262,fat:16,carbs:23,protein:6,iron:"7%"},{name:"Cupcake",calories:305,fat:3.7,carbs:67,protein:4.3,iron:"8%"},{name:"Gingerbread",calories:356,fat:16,carbs:49,protein:3.9,iron:"16%"},{name:"Jelly bean",calories:375,fat:0,carbs:94,protein:0,iron:"0%"},{name:"Lollipop",calories:392,fat:.2,carbs:98,protein:0,iron:"2%"},{name:"Honeycomb",calories:408,fat:3.2,carbs:87,protein:6.5,iron:"45%"},{name:"Donut",calories:452,fat:25,carbs:51,protein:4.9,iron:"22%"},{name:"KitKat",calories:518,fat:26,carbs:65,protein:7,iron:"6%"}]}}},p=r(2),v=Object(p.a)(d,u,[],!1,null,null,null);v.options.__file="src/components/Viewer.vue";var f=v.exports,h=(r(15),{name:"App",components:{MapView:c.a,Viewer:f},data:function(){return{activeUser:null,authenticated:!1,drawer:!1,drawerIndicators:!1,layersPanel:!0,currentView:"map-view",layers:[],indicators:[{heading:"Demographics",icon:"keyboard_arrow_up","icon-alt":"keyboard_arrow_down",text:"More",model:!1,children:[{name:"Persons",value:29e4},{name:"Median Age",value:25.4},{name:"Growth - natural (2018)",value:"3.5%"},{name:"Growth - migration (2018)",value:"4.5%"},{name:"Gender m/f",value:"49/50"}]},{heading:"Housing",icon:"keyboard_arrow_up","icon-alt":"keyboard_arrow_down",text:"More",model:!1,children:[{name:"Housing Units",value:36700},{name:"Avg. Persons per Household",value:5.2},{name:"Avg. Rooms per Household",value:3.5},{name:"Avg. Area of Household",value:"70m2"}]},{heading:"Services",icon:"keyboard_arrow_up","icon-alt":"keyboard_arrow_down",text:"More",model:!1,children:[{name:"Secondary Schools",value:3},{name:"Primary Schools",value:2},{name:"Kindergartens",value:5}]}]}},computed:{items:function(){var t=[{heading:"Layers",icon:"keyboard_arrow_up","icon-alt":"keyboard_arrow_down",text:"More",model:!1,children:[{icon:"add",text:"Background"},{icon:"add",text:"Boundaries"},{icon:"add",text:"Buildings"},{icon:"add",text:"Roads"}]}],e=[{divider:!0},{icon:"settings",text:"Settings"},{icon:"chat_bubble",text:"About"},{icon:"help",text:"Help"},{icon:"cloud_download",text:"Export Data"}];return this.activeUser?t.concat([{divider:!0},{icon:"cloud_upload",text:"Upload data",route:"upload"},{icon:"grid_on",text:"View surveys",route:"survey"}]).concat(e):t.concat(e)}},props:{source:String},created:function(){var t=this;return l()(o.a.mark(function e(){return o.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.refreshActiveUser();case 2:case"end":return e.stop()}},e,t)}))()},watch:{$route:"refreshActiveUser"},methods:{login:function(){this.$auth.loginRedirect()},refreshActiveUser:function(){var t=this;return l()(o.a.mark(function e(){return o.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.$auth.getUser();case 2:t.activeUser=e.sent;case 3:case"end":return e.stop()}},e,t)}))()},logout:function(){var t=this;return l()(o.a.mark(function e(){return o.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.$auth.logout();case 2:return e.next=4,t.refreshActiveUser();case 4:t.$router.push("/");case 5:case"end":return e.stop()}},e,t)}))()},printUser:function(){console.log("USER"),console.log(this.activeUser),console.log(this.$auth)}}}),m=(r(130),Object(p.a)(h,n,[],!1,null,null,null));m.options.__file="src/App.vue";var g=m.exports,_=r(62),b=r(63),y=r.n(b);r(0),r(132),r(133);i.default.use(y.a),i.default.config.productionTip=!0,new i.default({router:_.a,render:function(t){return t(g)}}).$mount("#app")},135:function(t,e,r){"use strict";var i=function(){var t=this.$createElement;this._self._c;return this._m(0)};i._withStripped=!0;r(131);var n=r(2),a=Object(n.a)({},i,[function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"hero"},[e("div",[e("h1",{staticClass:"display-3"},[this._v("Hello World")]),this._v(" "),e("p",{staticClass:"lead"},[this._v("This is the homepage of your vue app")])])])}],!1,null,null,null);a.options.__file="src/components/Hello.vue";a.exports},19:function(t,e,r){"use strict";var i=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",[r("v-layout",{attrs:{row:"","align-center":"","justify-center":""}},[r("v-dialog",{attrs:{persistent:"","max-width":"500"},model:{value:t.editDialog,callback:function(e){t.editDialog=e},expression:"editDialog"}},[r("v-card",[r("v-card-title",[r("svg",{attrs:{width:"80vh",height:"200"},domProps:{innerHTML:t._s(t.editFeaturePath)}})]),t._v(" "),r("v-card-text",[r("v-text-field",{attrs:{label:"Building Stories"},model:{value:t.editFeature.building_stories,callback:function(e){t.$set(t.editFeature,"building_stories",e)},expression:"editFeature.building_stories"}}),t._v(" "),r("v-text-field",{attrs:{label:"Building Use"},model:{value:t.editFeature.building_use,callback:function(e){t.$set(t.editFeature,"building_use",e)},expression:"editFeature.building_use"}}),t._v(" "),r("v-text-field",{attrs:{label:"Building Materials"},model:{value:t.editFeature.building_materials,callback:function(e){t.$set(t.editFeature,"building_materials",e)},expression:"editFeature.building_materials"}}),t._v(" "),r("v-text-field",{attrs:{label:"Building Construction Year"},model:{value:t.editFeature.building_year,callback:function(e){t.$set(t.editFeature,"building_year",e)},expression:"editFeature.building_year"}})],1),t._v(" "),r("v-card-actions",[r("v-spacer"),t._v(" "),r("v-btn",{on:{click:t.closeEditor}},[t._v("Cancel")]),t._v(" "),r("v-btn",{attrs:{color:"primary"},on:{click:t.saveEditor}},[t._v("Save")])],1)],1)],1)],1),t._v(" "),r("l-map",{attrs:{zoom:t.zoom,center:t.center,options:t.mapOptions,id:"main-map"},on:{"update:center":t.centerUpdate,"update:zoom":t.zoomUpdate}},[r("l-protobuf",{attrs:{url:"https://maps.tilehosting.com/data/v3/{z}/{x}/{y}.pbf?key=ArAI1SXQTYA6P3mWFnDs",options:t.protobufOpts}}),t._v(" "),t._l(t.surveyData,function(e,i){return t.survey?r("l-geo-json",{key:e._id,attrs:{color:"#000",options:t.geoJsonOptions,geojson:e.feature}}):t._e()})],2),t._v(" "),r("v-toolbar",{staticStyle:{width:"300px","z-index":"1",position:"absolute",left:"none",top:"12px",right:"12px"},attrs:{"extension-height":"200"}},[r("v-text-field",{attrs:{"hide-details":"","prepend-icon":"search","single-line":""}}),t._v(" "),r("v-btn",{attrs:{icon:""},on:{click:function(e){t.optionsDialog=!t.optionsDialog}}},[r("v-icon",[t._v("more_vert")])],1),t._v(" "),t.optionsDialog?r("v-list",{staticStyle:{background:"none"},attrs:{slot:"extension",dense:""},slot:"extension"},[t._l(t.items,function(e,i){return[e.children?r("v-list-group",{key:e.text,attrs:{"prepend-icon":e.model?e.icon:e["icon-alt"],"append-icon":""},scopedSlots:t._u([{key:"activator",fn:function(){return[r("v-list-tile",[r("v-list-tile-content",[r("v-list-tile-title",[t._v("\n              "+t._s(e.heading)+"\n            ")])],1)],1)]},proxy:!0}],null,!0),model:{value:e.model,callback:function(r){t.$set(e,"model",r)},expression:"item.model"}},[t._v(" "),t._l(e.children,function(e,i){return[r("v-switch",{key:i,attrs:{label:e.text},on:{click:function(r){return t.getSurveyData(e.text)}},model:{value:e.selected,callback:function(r){t.$set(e,"selected",r)},expression:"child.selected"}})]})],2):e.heading?r("v-layout",{key:i,attrs:{row:"","align-center":""}},[r("v-flex",{attrs:{xs6:""}},[e.heading?r("v-subheader",[t._v("\n      "+t._s(e.heading)+"\n    ")]):t._e()],1)],1):e.divider?r("v-divider",{key:i,staticClass:"my-3",attrs:{dark:""}}):t._e()]}),t._v(" "),r("hr"),t._v(" "),r("v-layout",{attrs:{"px-4":""}},[t.surveys?r("v-select",{attrs:{items:t.surveys,"menu-props":"auto",label:"Select a survey","hide-details":"","prepend-icon":"map","single-line":""},on:{input:function(e){return t.getSurveyData(e)}},model:{value:t.selectedSurvey,callback:function(e){t.selectedSurvey=e},expression:"selectedSurvey"}}):r("v-btn",{on:{click:t.getSurveyNames}},[t._v("Load surveys")])],1)],2):t._e()],1)],1)};i._withStripped=!0;var n=r(10),a=r.n(n),o=r(137),s=r(138),l=r(139),c=r(140),u=r(141),d=r(142),p=r(143),v=function(){var t=this.$createElement;return(this._self._c||t)("div")};v._withStripped=!0;var f=r(0),h=r.n(f);r(105);if(void 0===h.a)throw new Error("leaflet library must be installed in order to use vue2-leaflet-vectorgrid.");if(void 0===h.a.vectorGrid)throw new Error("leaflet.vectorgrid library must be installed in order to use vue2-leaflet-vectorgrid.");var m={props:{url:{type:String,required:!0},options:{type:Object,default:function(){return{}}}},watch:{url:function(){this.updateLayer()},options:function(){this.updateLayer()}},mounted:function(){this.mapObject=h.a.vectorGrid.protobuf(this.url,this.options),this.$parent._isMounted&&this.deferredMountedTo(this.$parent.mapObject)},beforeDestroy:function(){this.removeLayer()},methods:{deferredMountedTo:function(t){this.mapObject.addTo(t),this.attributionControl=t.attributionControl;for(var e=0;e<this.$children.length;e++)"function"==typeof this.$children[e].deferredMountedTo&&this.$children[e].deferredMountedTo(this.mapObject)},setAttribution:function(t,e){this.attributionControl.removeAttribution(e),this.attributionControl.addAttribution(t)},setToken:function(t){this.options.token=t},removeLayer:function(){this.$parent.mapObject.removeLayer(this.mapObject)},updateLayer:function(){this.removeLayer(),this.mapObject=h.a.vectorGrid.protobuf(this.url,this.options),this.deferredMountedTo(this.$parent.mapObject)}}},g=r(2),_=Object(g.a)(m,v,[],!1,null,null,null);_.options.__file="public/Vue2LeafletVectorGridProtobuf.vue";var b=_.exports,y=r(61),x=r.n(y)()({water:{fill:!0,weight:1,fillColor:"#06cccc",color:"#06cccc",fillOpacity:.2,opacity:.4},admin:[],waterway:{weight:1,fillColor:"#2375e0",color:"#2375e0",fillOpacity:.2,opacity:.4},landcover:{fill:!0,weight:1,fillColor:"#53e033",color:"#53e033",fillOpacity:.1,opacity:.4},landuse:{fill:!0,weight:1,fillColor:"#efe6f2",color:"#efe6f2",fillOpacity:.2,opacity:.4},park:{fill:!0,weight:1,fillColor:"#84ea5b",color:"#84ea5b",fillOpacity:.2,opacity:.4},boundary:function(){return 1==arguments[0].disputed?{weight:3,fillColor:"red",color:"red",fillOpacity:.2,opacity:.8}:4==arguments[0].admin_level?{weight:2,fillColor:"pink",color:"pink",fillOpacity:.2,opacity:.8}:arguments[0].admin_level<4?{weight:3,fillColor:"#999",color:"#999",fillOpacity:.2,opacity:.8}:[]},aeroway:{weight:1,fillColor:"#51aeb5",color:"#51aeb5",fillOpacity:.2,opacity:.4},road:{weight:1,fillColor:"#f2b648",color:"#f2b648",fillOpacity:.2,opacity:.4},tunnel:{weight:.5,fillColor:"#f2b648",color:"#f2b648",fillOpacity:.2,opacity:.4},bridge:{weight:.5,fillColor:"#f2b648",color:"#f2b648",fillOpacity:.2,opacity:.4},transportation:{weight:.5,fillColor:"#f2b648",color:"#f2b648",fillOpacity:.2,opacity:.4},transit:{weight:.5,fillColor:"#f2b648",color:"#f2b648",fillOpacity:.2,opacity:.4},building:{fill:!0,weight:.5,fillColor:"#999",color:"#999",fillOpacity:.4,opacity:.8},water_name:[],transportation_name:[],place:[],housenumber:[],poi:[],earth:[],country_label:[],marine_label:[],state_label:[],place_label:[],waterway_label:[],poi_label:[],road_label:[],housenum_label:[],country_name:[],marine_name:[],state_name:[],place_name:[],waterway_name:[],poi_name:[],road_name:[],housenum_name:[],mountain_peak:[]},"poi_name",[]),w=r(8),k=r(15),C=r.n(k),S={name:"MapView",components:{LMap:o.a,LTileLayer:s.a,LMarker:l.a,LPopup:c.a,LTooltip:u.a,LProtobuf:b,LPolygon:d.a,LGeoJson:p.a},data:function(){var t=this;return{url:"http://{s}.tile.osm.org/{z}/{x}/{y}.png",zoom:14,center:L.latLng(31.778837,35.243452),attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',currentZoom:14,currentCenter:L.latLng(31.778837,35.243452),showParagraph:!1,mapOptions:{zoomSnap:.5},geoJsonOptions:{onEachFeature:function(e,r){var i=t;r.on({click:function(t){i.openEditor(t)}})}},protobufOpts:{vectorTileLayerStyles:x,maxNativeZoom:14},survey:!1,surveyData:[],editFeature:{building_stories:null,building_use:null,building_materials:null,building_year:null},editFeatureDefaults:{building_stories:null,building_use:null,building_materials:null,building_year:null},editDialog:!1,editFeaturePath:"",editFeatureViewBox:"",editIndex:0,editMapCenter:{lat:31.843725284728198,lng:35.22635998187065},editMapFeature:null,editMapZoom:16,optionsDialog:!1,surveys:null,selectedSurvey:null}},computed:{items:function(){return this.$auth.isAuthenticated(),[]}},methods:{zoomUpdate:function(t){this.currentZoom=t},centerUpdate:function(t){this.currentCenter=t},showLongText:function(){this.showParagraph=!this.showParagraph},innerClick:function(){console.log(!0)},popup:function(t){console.log(t)},getCoordsPoint:function(t){var e=t.geometry.coordinates[0][0];return L.latLng(e[1],e[0])},getSurveyNames:function(){var t=this;w.a.getSurveyNames().then(function(e){console.log(e),t.surveys=e.data})},getSurveyData:function(t){var e=this;console.log(t),w.a.getSurveyData(t).then(function(t){console.log(t),t.data.forEach(function(t){return t.feature.properties.Id=t._id}),e.surveyData=t.data,e.survey=!0,e.center=e.editMapCenter=e.getCoordsPoint(t.data[0].feature)})},openEditor:function(t){var e=this;console.log(t),this.surveyData.forEach(function(r,i){r._id==t.target.feature.properties.Id&&(e.editIndex=i)}),a()(this.editFeature,this.surveyData[this.editIndex].feature.properties),this.editDialog=!0;var r=t.target._path.outerHTML,i=1/this.currentZoom*1/this.currentZoom*1/this.currentZoom*1/this.currentZoom*2e5,n=(r=r.replace(">",'transform="translate() scale('+i+')">')).match(/d="M[\d\s-]*/)[0].slice(4).split(" ").map(function(t){return parseInt(t)});n[0]=-n[0]*i+200,n[1]=-n[1]*i+50,r=(r=r.replace("translate()","translate("+n[0]+" "+n[1]+")")).replace(/stroke-width="\d"/,'stroke-width="0.2"'),this.editFeaturePath=r,console.log(r),console.log(n),console.log(t.target.feature),this.editMapFeature=t.target.feature,this.editMapCenter=this.getCoordsPoint(t.target.feature),console.log(this.getCoordsPoint(t.target.feature))},closeEditor:function(){this.editDialog=!1,a()(this.editFeature,this.editFeatureDefaults)},saveEditor:function(){var t=this.surveyData[this.editIndex],e={lastEdited:{time:new Date}};a()(t.feature.properties,e,this.editFeature),console.log("/building/"+t._id,t.feature.properties),C.a.put("/building/"+t._id,t).then(function(t){return console.log(t)}),this.closeEditor()}},mounted:function(){this.getSurveyNames()}},O=(r(129),Object(g.a)(S,i,[],!1,null,null,null));O.options.__file="src/components/MapView.vue";e.a=O.exports},24:function(t,e,r){},25:function(t,e,r){},26:function(t,e,r){},62:function(t,e,r){"use strict";(function(t){var i=r(7),n=r(39),a=(r(135),r(19)),o=r(65),s=r(64),l=r(38),c=r.n(l);console.log(window.location.origin),i.default.use(c.a,{clientId:t.env.VUE_APP_OKTA_CLIENT_ID,issuer:"https://dev-160658.okta.com/oauth2/default",redirect_uri:window.location.origin+"/implicit/callback",scope:"openid profile email"}),i.default.use(n.a);var u=new n.a({mode:"history",routes:[{path:"/",component:a.a},{path:"/upload",component:o.a},{path:"/map",component:a.a},{path:"/implicit/callback",component:c.a.handleCallback()},{path:"/posts-manager",name:"PostsManager",component:s.a,meta:{requiresAuth:!0}}]});u.beforeEach(i.default.prototype.$auth.authRedirectGuard()),e.a=u}).call(this,r(36))},64:function(t,e,r){"use strict";var i=function(){var t=this.$createElement;this._self._c;return this._m(0)};i._withStripped=!0;var n=r(10),a=r.n(n),o=r(1),s=r.n(o),l=r(4),c=r.n(l),u=r(8),d={data:function(){return{loading:!1,posts:[],model:{}}},created:function(){var t=this;return c()(s.a.mark(function e(){return s.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:t.refreshPosts();case 1:case"end":return e.stop()}},e,t)}))()},methods:{refreshPosts:function(){var t=this;return c()(s.a.mark(function e(){return s.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t.loading=!0,e.next=3,u.a.getPosts();case 3:t.posts=e.sent,t.loading=!1;case 5:case"end":return e.stop()}},e,t)}))()},populatePostToEdit:function(t){var e=this;return c()(s.a.mark(function r(){return s.a.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:e.model=a()({},t);case 1:case"end":return r.stop()}},r,e)}))()},savePost:function(){var t=this;return c()(s.a.mark(function e(){return s.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(!t.model.id){e.next=5;break}return e.next=3,u.a.updatePost(t.model.id,t.model);case 3:e.next=7;break;case 5:return e.next=7,u.a.createPost(t.model);case 7:return t.model={},e.next=10,t.refreshPosts();case 10:case"end":return e.stop()}},e,t)}))()},deletePost:function(t){var e=this;return c()(s.a.mark(function r(){return s.a.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:if(!confirm("Are you sure you want to delete this post?")){r.next=6;break}return e.model.id===t&&(e.model={}),r.next=4,u.a.deletePost(t);case 4:return r.next=6,e.refreshPosts();case 6:case"end":return r.stop()}},r,e)}))()}}},p=r(2),v=Object(p.a)(d,i,[function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"container-fluid mt-4"},[e("h1",{staticClass:"h1"},[this._v("Posts Manager")])])}],!1,null,null,null);v.options.__file="src/components/PostsManager.vue";e.a=v.exports},65:function(t,e,r){"use strict";var i=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"container"},[r("form",{attrs:{enctype:"multipart/form-data",novalidate:""},on:{submit:function(e){return e.preventDefault(),t.processForm(e)}}},[r("h1",[t._v("Upload data")]),t._v(" "),r("div",{staticClass:"dropbox"},[r("input",{ref:"file",staticClass:"input-file",attrs:{type:"file",name:t.uploadFieldName,disabled:t.isSaving},on:{change:function(e){return t.filesChange()}}}),t._v(" "),t.isInitial?r("p",[t._v("\n        Drag your file(s) here to begin"),r("br"),t._v(" or click to browse\n      ")]):t._e(),t._v(" "),t.isSaving?r("v-select",{attrs:{name:"layer",items:t.dataTypes,label:"Layer"},model:{value:t.dataType,callback:function(e){t.dataType=e},expression:"dataType"}}):t._e(),t._v(" "),t.isSaving?r("v-text-field",{attrs:{label:"Location"},model:{value:t.neighbourhood,callback:function(e){t.neighbourhood=e},expression:"neighbourhood"}}):t._e(),t._v(" "),r("v-btn",{staticClass:"button",attrs:{to:"map"}},[t._v("Back")]),t._v(" "),t.isSaving?r("v-btn",{staticClass:"button is-danger",attrs:{type:"submit"}},[t._v("Upload")]):t._e()],1)])])};i._withStripped=!0;r(15);var n=r(8),a={data:function(){return{uploadedFiles:[],uploadError:null,currentStatus:null,uploadFieldName:"GeoJSON",file:"",neighbourhood:"",dataType:"Buildings",dataTypes:["Buildings","Neighbourhood Boundary"]}},computed:{isInitial:function(){return 0===this.currentStatus},isSaving:function(){return 1===this.currentStatus},isSuccess:function(){return 2===this.currentStatus},isFailed:function(){return 3===this.currentStatus}},methods:{filesChange:function(){this.currentStatus=1,this.file=this.$refs.file.files[0],this.neighbourhood=this.file.name.split(".")[0]},processForm:function(){var t=new FormData;t.append("neighbourhood",this.neighbourhood),t.append("layer",this.dataType),t.append("file",this.file),t.append("file",this.file),console.log({fileData:this.file}),n.a.create(t,{"Content-Type":"multipart/form-data"}).then(function(){console.log("SUCCESS!!")}).catch(function(){console.log("FAILURE!!")})}}},o=r(2),s=Object(o.a)(a,i,[],!1,null,null,null);s.options.__file="src/components/Upload.vue";e.a=s.exports},8:function(t,e,r){"use strict";var i=r(1),n=r.n(i),a=r(10),o=r.n(a),s=r(4),l=r.n(s),c=r(7),u=r(15),d=r.n(u).a.create({baseURL:"http://localhost:8081/",json:!0});e.a={execute:function(t,e,r,i){var a=this;return l()(n.a.mark(function s(){var l;return n.a.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return i=i||{},n.next=3,c.default.prototype.$auth.getAccessToken();case 3:return l=n.sent,n.abrupt("return",d({method:t,url:e,data:r,headers:o()({Authorization:"Bearer "+l},i)}));case 5:case"end":return n.stop()}},s,a)}))()},getSurveyData:function(t){return this.execute("get","/neighbourhood/"+t)},getSurveyNames:function(){return this.execute("get","/survey/buildings")},getPost:function(t){return this.execute("get","/posts/"+t)},create:function(t,e){return this.execute("post","/create",t,e)},updatePost:function(t,e){return this.execute("put","/posts/"+t,e)},deletePost:function(t){return this.execute("delete","/posts/"+t)}}}});