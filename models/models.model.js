const mongoose = require('mongoose');
const schemas = require('../src/db.config')


const obj = Object.keys(schemas).reduce((acc,x)=>{
   if (typeof schemas[x].schema === 'string') return acc
   const schema = Object.keys(schemas[x].schema).reduce((obj,i)=>{
      obj[i] = Object.keys(schemas[x].schema[i]).reduce((o,j) => {
         if (j.indexOf('_') !== 0) o[j] = schemas[x].schema[i][j]
         return o;
      },{})
      return obj
   },{})
   const modelName = x.charAt(0).toUpperCase() + x.slice(1,x.length-1)
   acc[x] = mongoose.model(modelName, new mongoose.Schema(schema, schemas[x].schemaOpts), x)
   return acc
},{})

module.exports = obj
