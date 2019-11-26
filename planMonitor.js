const request = require('request');
const controllers = require('./controllers/base.controller')
const dynamicModels = require('./models/geojson.model')
const HTMLParser = require('node-html-parser');
const rp = require('request-promise-native')
const Cookie = require('tough-cookie').Cookie
const logger = require('heroku-logger')
const mongoose = require('mongoose');
const querystring = require('querystring');
const fs = require('fs');
const jsZip = require("jszip");
var Stream = require('stream').Stream;
mongoose.Promise = global.Promise;
var toJSON = require('./src/plugins/shp2json');



/*
export function getPlanDataX(mavat_id) {
mavat_id = mavat_id || 'TOpflW7W09+v72bfNTNNuVIQg7HrM9yHNs5qCwtxESOQg3YZB16Gw5GTRQjuKeTStGGVEIMWRuT2l7QcUI7c44fDhzuoJNrc2mLvX+5Tgy0='
const url = 'https://script.google.com/macros/s/AKfycby0tzlcXaVgv36LRsVKN1NvxkUgo8XCv_3jpHhxSKE_lCkB41Q/exec?mavat_id='
axios.get(url + encodeURIComponent(mavat_id) + '&callback=myfunc')
.then(function (response) {
// handle success
console.log(response)
return response
})
}

function myfunc(x) {
return x
}*/
//https://script.google.com/macros/s/AKfycby0tzlcXaVgv36LRsVKN1NvxkUgo8XCv_3jpHhxSKE_lCkB41Q/exec?mavat_id=TOpflW7W09%2Bv72bfNTNNuVIQg7HrM9yHNs5qCwtxESOQg3YZB16Gw5GTRQjuKeTStGGVEIMWRuT2l7QcUI7c44fDhzuoJNrc2mLvX%2B5Tgy0%3D&callback=myfunc
//api.create('plans',response)
/*exports.main = function(plans,blocks) {

blocks.forEach(block => {
const newPlans = []
const url = `http://opentaba-server-jerusalem.herokuapp.com/gush/${block}/plans.json`
axios.get(url)
.then(results => {
results.forEach(plan => {
if (!plans[plan.plan_id]) newPlans.push(plan)
})
})
})

}
*/


exports.mavatScraper = (function () {

  const PLANS_LAYER_ID = '5d2f0b46fe977fdb42180cd2',
  BLOCKS_LAYER_ID = '5d2f372b72079bde94245735',
  BASE_URL = 'http://ejmap-dev.herokuapp';

  var cookiejar = rp.jar();
  var blockstore;


  var Scraper = function (html,blockId) {

    this.root = HTMLParser.parse(html).removeWhitespace()
    this.blockId = blockId
    this.nestedPath = 'feature.properties.'
    this.scrapeData = []
    const layerid = mongoose.Types.ObjectId(PLANS_LAYER_ID)

    this.scrapeTable = function () {
      let rows = this.root.querySelectorAll('.clsTableRowNormal')
      //console.log('rows',rows.length)
      for (var x=0;x<rows.length;x++) {

        const c = rows[x].childNodes

        this.scrapeData.push({
          mavat_code: c[0].text,
          number: c[4].text,
          block_number: this.blockId
        })
      }
      //console.log('this.scrapedata',this.scrapeData)
      return this.scrapeData.length

    }

    this.addFeatureKeys = function () {
      var self = this
      this.scrapeData = this.scrapeData.map(x=> {
        return Object.keys(x).reduce(function(acc,key){
          acc[self.nestedPath+key] = x[key]
          acc.layer = layerid
          return acc
        },{})
      })

    }

    this.postData = function () {
      if (this.scrapeData.length === 0 ) return null
      const req = {
        fields: {
          update: JSON.stringify({
            matchExisting : 'feature.properties.number',
            matchUpload : 'feature.properties.number',
          }),
          file: JSON.stringify(this.scrapeData)
        }
      }
      new controllers.controller(dynamicModels[PLANS_LAYER_ID]).updateMany(req)
      .then(x=>{
        console.log('sent ' + this.scrapeData.length + ' plans')
        console.log(this.scrapeData)
      })
      .catch((err)=>{
        console.log(err)
      })

    }

  }

  var extractShapefile = async function(plan, index) {
    const sl = plan.feature.properties.shapefile_links
    const fileInfo = sl[index]
    if (!fileInfo) {
      console.log('no shapefile info for index ' + index)
      return null
    }
    const download = downloadFile(fileInfo.entityDocID, fileInfo.entityDocNumber)
    .then(geojson => {
      console.log(JSON.stringify(geojson))
      return dynamicModels[PLANS_LAYER_ID].findOneAndUpdate(
        {_id:mongoose.Types.ObjectId(plan._id)},
        {
          'feature.type' : geojson.features[0].type,
          'feature.geometry' : geojson.features[0].geometry,
          //'feature.properties.block_number' : geojson.features[0].properties
        })
      })
      .catch(err => {
        console.log(err)
        return false
      })

      let result = await download;
      if (!result && sl[index+1]) {
        console.log('trying next shapefile...')
        extractShapefile(plan, index + 1)
      } else {
        return
      }
    }

    var downloadMissingGeodata = function () {
      const query = {
        $and:[
          {'feature.properties.shapefile_links':{$ne:null}},
          {'feature.properties.shapefile_links':{$ne:[]}},
          {'feature.geometry':null},
        ]
      }

     blockstore = new BlockStore()
     return blockstore.load(0)
     .then(()=>{

      return dynamicModels[PLANS_LAYER_ID].find(query,'',{lean: true})
      })
     .then(plans => {

          //plans = plans.slice(0,2)
          console.log('getting spatial files for ' + plans.length + ' plans')
          syncLoop(plans.length, function(loop){
            const i = loop.iteration();
            console.log(i + '. fetching data for plan: ' + plans[i]._id )
            extractShapefile(plans[i],0)
            setTimeout(()=>{
              loop.next()
            }, getRandomInt(2000,6000))
          })
          console.log('finished')
          return Promise.resolve('finished')
     })

    }

    var downloadFile = function(entityDocID, entityDocNumber ) {
      var _include_headers = function(body, response, resolveWithFullResponse) {
        return {'headers': response.headers, 'data': body};
      };
      entityDocID = entityDocID || '6000050340101'
      entityDocNumber = entityDocNumber || 'EC1C88B42724DB44ACF1C48338871CF132F32EBC0248E70FB9A1C03AEBE7809A'
      const downloadurl = 'Attachment.aspx?edid=' + entityDocID + '&edn=' + entityDocNumber + '&opener=AttachmentError.aspx'
      const baseurl = 'http://mavat.moin.gov.il/MavatPS/Forms/'
      return rp({
        uri:  baseurl + downloadurl,
        method : 'GET',
      })
      .then(html =>{
        const challenge = parseChallengeHTML(html)
        //console.log(challenge)
        if (!challenge) rej()

        return rp({
          uri: baseurl + downloadurl,
          method : 'GET',
          headers : challenge,
          transform: _include_headers
        })
      })
      .then(res=>{
        //console.log('got cookies!')

        var request_cookiejar = request.jar();

        res.headers['set-cookie'].forEach(x=>{
          request_cookiejar.setCookie(request.cookie(x).toString(), baseurl)
        });

        return new Promise((resolve,reject)=>{

          request(baseurl + downloadurl,{
            jar: request_cookiejar,
            encoding: null // <- this one is important !
          }, function (err, resp, body) {
            if(err ||  resp.statusCode !== 200) {
              console.log('failed to download file', err)// handle error
              return;
            }
            jsZip.loadAsync(body).then(function (zip) {

              // remove irrelevent files
              const keepList = ['MVT_GVUL','kavim_kchulim']
              const gushZip = jsZip()
              let fileNames = Object.keys(zip.files)

              for (var x= 0 ; x<fileNames.length;x++) {
                if (fileNames[x].indexOf('MVT_GUSH.') > -1 ) {
                  gushZip.loadAsync(zip.generateAsync({type: 'binarystring'}))
                  .then(gZip=>{
                    filterZipFileNames(gZip,['MVT_GUSH.'])
                    shpToJson(gZip).then(json=>blockstore.update(json))
                  })
                  break
                }
              }

              zip = filterZipFileNames(zip,['MVT_GVUL.','kavim_kchulim.'])

              fileNames = Object.keys(zip.files)

              if (fileNames.length < 3) {
                return reject('no files found')
              } else {
                shpToJson(zip).then(json=>resolve(json))
              }
            })

          })
        })
      })
    }

    var BlockStore = function () {

      this.block_numbers = []

      this.blocks = []

      this.loadByCode = function(codes) {
        this.blocks = codes.map(x=>{
          return {
            feature : {
              properties : {
                number : x
              }
            }
          }
        })
        return Promise.resolve()
      }

      this.load = function(daysSinceLastChecked) {
        daysSinceLastChecked = daysSinceLastChecked || 7
        const today = new Date();
        const toDate = new Date(today.setDate(today.getDate()-daysSinceLastChecked));
        const query = {
          $and:[
            {
              $or: [{'feature.properties.last_checked':{ '$lte': toDate }},{'feature.properties.last_checked': null}]
            },
            { layer:BLOCKS_LAYER_ID },
            { 'feature.properties.JIIS_stat_area':{$ne:null} }
          ]
        }

        return dynamicModels[BLOCKS_LAYER_ID].find(query,'',{lean: true})
        .then(data=>{
          this.blocks = data.reduce((acc,x)=>{
            const number = x.feature.properties.number
            if (this.block_numbers.indexOf(number) === -1) {
              this.block_numbers.push(number)
              acc.push(x)
            }
            return acc
          },[])
          console.log('loaded '+this.blocks.length+' blocks')
          return this.blocks
        })
      }

      this.update = function(json) {

        json.features.forEach(feature =>{
          const number = feature.properties.LOT_NUM
          if (this.block_numbers.indexOf(number)>-1) return null
          console.log('adding block', number)
          feature.properties.number = number
          this.block_numbers.push(number)
          this.blocks.push(feature)
          const obj = {
            feature : feature,
            layer : mongoose.Types.ObjectId(BLOCKS_LAYER_ID)
          }
          const query = {$and:[{layer:BLOCKS_LAYER_ID}, {'feature.properties.number':obj.feature.properties.number}]}
          dynamicModels[BLOCKS_LAYER_ID].findOneAndUpdate(query,obj,{upsert:true})
          .then(x=>{
            console.log(x)
            return
          })
        })
      }
    }

    var fixDates = function(){
      const query =  {$and:[{'layer':mongoose.Types.ObjectId(PLANS_LAYER_ID)},{'feature.properties.year':3900}]} //{'layer':{$exist:false}}
      return dynamicModels[PLANS_LAYER_ID].find(query,function(err,x){
        console.log('results:', x.length)
        const ops = x.map(i=>{
          return {
            updateOne : {
              filter : {_id:i._id},
              update : {$set:{'feature.properties.year':2000}}
            }
          }
        })
        console.log(JSON.stringify(ops[0]))
        return dynamicModels[PLANS_LAYER_ID].bulkWrite(ops,function(err,x){
          console.log(x)
          return Promise.resolve('done')
        })
    })
  }

    var uploadLayerId = function() {

      const query =  {$and:[{'feature.properties.mavat_code':{$exists:true}},{'layer':{$exists:false}}]} //{'layer':{$exist:false}}
      return dynamicModels[PLANS_LAYER_ID].find(query,function(err,x){
        console.log('results:', x.length)
        ops = x.map(i=>{
          return {
            updateOne : {
              filter : {_id:i._id},
              update : {$set:{layer:mongoose.Types.ObjectId(PLANS_LAYER_ID)}}
            }
          }
        })
        return dynamicModels[PLANS_LAYER_ID].bulkWrite(ops,function(err,x){
          console.log(x)
          return Promise.resolve('done')
        })
      })

    }

    var fixIndicators = function() {
       dynamicModels.indicators.deleteMany({year:{$lt:100}})
       .then(x=>{
         console.log(x)
       })
    }


    var shpToJson = function(zip) {
      console.log('shpToJson', Object.keys(zip.files))
      return new Promise((resolve,reject) =>{
        const inStream = zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
        const outStream = new Stream;
        outStream.writable = true;
        let data = '';
        outStream.write = function (buf) {
          data += buf;
        };
        outStream.end = function () {
          //console.log('json data', JSON.parse(data));
          resolve(JSON.parse(data))
        }
        toJSON(inStream).pipe(outStream) //fs.createWriteStream('mavat_file.json')
      })

    }

    var filterZipFileNames = function(zip,keepList) {
      Object.keys(zip.files).forEach(filename => {
        if ( keepList.every(x=>filename.indexOf(x) === -1 ) ) zip.remove(filename)
      })
      console.log('filtered', Object.keys(zip.files))
      return zip
    }

    var getRandomInt = function(min,max) {
      return min + Math.floor(Math.random() * Math.floor(max-min));
    }

    var init = function(blockCodes) {

      var testUrl =  'http://localhost:8081'
      var base = 'http://mavat.moin.gov.il'
      var url = base + '/MavatPS/Forms/SV3.aspx?tid=3';
      var _include_headers = function(body, response, resolveWithFullResponse) {
        return {'headers': response.headers, 'data': body};
      };
      console.log('initialising...', Object.keys(dynamicModels))
      //console.log(dynamicModels[BLOCKS_LAYER_ID])
      //console.log(dynamicModels[BLOCKS_LAYER_ID].find({},'',{lean:true}))
      blockstore = new BlockStore()

      const loadMethod = blockCodes ?
         blockstore.loadByCode(blockCodes) : blockstore.load(0)

      return loadMethod
      .then(()=>{
        if (blockCodes) blockstore.loadByCode(blockCodes)
        return rp(url)
      })
      .then(html =>{

        const challenge = parseChallengeHTML(html)
        console.log(challenge)
        if (!challenge) rej()

        return rp({
          uri: url,
          method : 'GET',
          headers : challenge,
          transform: _include_headers
        })
      })
      .then(res=>{
        console.log('got cookies!')

        res.headers['set-cookie'].forEach(x=>{
          cookiejar.setCookie(request.cookie(x).toString(), url)
          cookiejar.setCookie(request.cookie(x).toString(), testUrl)
        });

        return rp(url,{
          jar: cookiejar
        })
      })
      .then(html => {
        console.log('got session identifiers!')
        let form = getSessionIdentifiers(html)
        let logdata = []

        if (!form['__VIEWSTATE']) return null
        return new Promise((res,rej)=>{
          syncLoop(blockstore.blocks.length, function(loop){
            const i = loop.iteration();
            const blockId = blockstore.blocks[i].feature.properties.number
            console.log(i + '. fetching plans for block: ' + blockId )

            Object.assign(form,{
              ctl00$ContentPlaceHolder1$txtFromBlock:blockId,
              ctl00$ContentPlaceHolder1$txtToBlock:blockId,
            })

            const postData = querystring.stringify(form)
            //console.log(form)
            rp({
              uri : url,
              method:'POST',
              body:postData,
              followAllRedirects: true, //by default turned off for POST requests
              jar: cookiejar,
              headers: {
                'Content-Type':'application/x-www-form-urlencoded',
                'Content-Length': postData.length
              }
            }, function(err,resp,body){

              console.log('got plans page!')
              //console.log(body)
              //console.log(html)
              setTimeout(()=>{
                const scraper = new Scraper(body,blockId)
                scraper.scrapeTable()
                scraper.addFeatureKeys()
                scraper.postData()
                //logdata = scraper.scrapeData
                loop.next();
              },getRandomInt(4000,6000))

            })

          }, function(){
            console.log('finished' )
            res()
          });
        })
      })
      .then(x=>{
        console.log('logdata',x)
        return Promise.resolve(x)
      })
      .catch(err=>{
        console.log('error',err)
        return Promise.reject(x)
      })
    }

    return {
      init:init, // adds new plans from mavat website (searches by block)
      downloadFile : downloadFile,
      downloadMissingGeodata : downloadMissingGeodata, // adds geodata attached to mavat plans
      uploadLayerId : uploadLayerId,
      fixDates:fixDates,
      fixIndicators:fixIndicators
    }

  })()

  function parseChallengeHTML(html){
    if (html.indexOf('X-AA-Challenge') > -1) {
      //Logger.log(html)
      //Logger.log('completing challenege')
      var challenge = parse_challenge(html)
      challenge['content-type'] = 'text/plain'
      return challenge
    } else {
      console.log('no challenge found', html)
      return null
    }
  }


  function parse_challenge(page) {
    top = page.split('<script>')[1].split('\n')
    challenge = top[1].split(';')[0].split('=')[1]
    challenge_id = top[2].split(';')[0].split('=')[1]
    return {
      'X-AA-Challenge': challenge,
      'X-AA-Challenge-ID': challenge_id,
      'X-AA-Challenge-Result': get_challenge_answer(challenge)
    }

  }

  function get_challenge_answer(challenge) {
    //challenge = challenge || '612348234'
    var arr = challenge.split(''),
    last_digit = parseInt(arr[arr.length-1])
    arr.sort()
    var min_digit = parseInt(arr[0])
    var subvar1 = (2 * parseInt(arr[2])) + parseInt(arr[1])
    var subvar2 = (2 * parseInt(arr[2])) + arr[1]
    var power = Math.pow( ((parseInt(arr[0]) * 1) + 2) , parseInt(arr[1]) )
    var x = (parseInt(challenge) * 3 + subvar1)
    var y = Math.cos(Math.PI * subvar1)
    var answer = x * y
    answer -= power
    answer += (min_digit - last_digit)
    answer = parseInt(Math.floor(answer)) + subvar2
    //Logger.log(answer)
    return answer
  }


  function getSessionIdentifiers(html) {
    const root = HTMLParser.parse(html);
    //console.log('viewstate', root.querySelector('#__VIEWSTATE').attributes.value)
    //console.log(html)
    return {
      '__EVENTTARGET':'',
      '__EVENTARGUMENT':'',
      '__VIEWSTATE': root.querySelector('#__VIEWSTATE').attributes.value,
      '__VIEWSTATEENCRYPTED':root.querySelector('#__VIEWSTATEENCRYPTED').attributes.value,
      '__EVENTVALIDATION':root.querySelector('#__EVENTVALIDATION').attributes.value,
      //'__VIEWSTATEGENERATOR':root.querySelector('#__VIEWSTATEGENERATOR').attributes.value,
      'ctl00$ContentPlaceHolder1$txtNumb':'',
      'ctl00$ContentPlaceHolder1$cboEntities':'-1',
      'ctl00$ContentPlaceHolder1$cboSubEntities':'-1',
      'ctl00$ContentPlaceHolder1$txtFromBlock':null,
      'ctl00$ContentPlaceHolder1$txtToBlock':null,
      'ctl00$ContentPlaceHolder1$txtFromParcel':'',
      'ctl00$ContentPlaceHolder1$txtToParcel':'',
      'ctl00$ContentPlaceHolder1$cboFilterDistrict':'-1',
      'ctl00$ContentPlaceHolder1$cboFilterArea':'-1',
      'ctl00$ContentPlaceHolder1$cboFilterJurst':'-1',
      'ctl00$ContentPlaceHolder1$cboFilterCity':'-1',
      'ctl00$ContentPlaceHolder1$cboFilterStreet':'-1',
      'ctl00$ContentPlaceHolder1$txtGoals':'',
      'ctl00$ContentPlaceHolder1$txtFilterFromApprovedDate':'',
      'ctl00$ContentPlaceHolder1$txtFilterToApprovedDate':'',
      'ctl00$ContentPlaceHolder1$txtFromMeetingDate':'',
      'ctl00$ContentPlaceHolder1$txtToMeetingDate':'',
      'ctl00$ContentPlaceHolder1$btnFilter.x':'42',
      'ctl00$ContentPlaceHolder1$btnFilter.y':'3',
      'ctl00$ContentPlaceHolder1$SubEntityID':'-1',
      'ctl00$ContentPlaceHolder1$SelectedPlanId':'0',
      'ctl00$ContentPlaceHolder1$SelectedPlanNumber':'0',
      'ctl00$ContentPlaceHolder1$StreetID':'-1',
      'ctl00$ContentPlaceHolder1$CityID':'-1',
      'ctl00$ContentPlaceHolder1$JurstID':'-1',
      'ctl00$ContentPlaceHolder1$AreaID':'-1',
      'ctl00$ContentPlaceHolder1$PID':'-1',
      'ctl00$ContentPlaceHolder1$JID':'-1',
      'ctl00$ContentPlaceHolder1$CCID':'-1',
      'ctl00$ContentPlaceHolder1$SLY':'-1',
      'ctl00$ContentPlaceHolder1$ButtonCode':'-1',
      'ctl00$ContentPlaceHolder1$ShowSearchResult':'0',
    }
  }


  function syncLoop(iterations, process, exit){
    var index = 0,
    done = false,
    shouldExit = false;
    var loop = {
      next:function(){
        if(done){
          if(shouldExit && exit){
            return exit(); // Exit if we're done
          }
        }
        // If we're not finished
        if(index < iterations){
          index++; // Increment our index
          process(loop); // Run our process, pass in the loop
          // Otherwise we're done
        } else {
          done = true; // Make sure we say we're done
          if(exit) exit(); // Call the callback on exit
        }
      },
      iteration:function(){
        return index - 1; // Return the loop number we're on
      },
      breakloop:function(end){
        done = true; // End the loop
        shouldExit = end; // Passing end as true means we still call the exit callback
      }
    };
    loop.next();
    return loop;
  }
