const request = require('request');
const controllers = require('./controllers/features.controller')
const dynamicModels = require('./models/geojson.model')
const HTMLParser = require('node-html-parser');
const rp = require('request-promise-native')
const Cookie = require('tough-cookie').Cookie
const logger = require('heroku-logger')
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


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
  BLOCKS_LAYER_ID = '5d2f372b72079bde94245735';

  var Scraper = function (html,blockId) {

    this.root = HTMLParser.parse(html)
    this.blockId = blockId
    this.nestedPath = 'feature.properties.'
    this.scrapeData = []

    this.scrapeTable = function () {
      let rows = this.root.querySelectorAll('.clsTableRowNormal')
      logger.info('rows',rows.length)
      console.log('rows',rows.length)
      for (var x=0;x<rows.length;x++) {
        const c = rows[x].querySelectorAll('td')
        this.scrapeData.push({
          mavat_code: c[0].text,
          number: c[4].firstChild.text,
          block_number: this.blockId
        })
      }
      return this.scrapeData.length

    }

    this.addFeatureKeys = function () {
      var self = this
      this.scrapeData = this.scrapeData.map(x=> {
        Object.keys(x).reduce(function(acc,key){
        acc[self.nestedPath+key] = x[key]
        return acc
      },{})
    })

  }

  this.postData = function (data) {

    let req = {
      fields : {
        layer : PLANS_LAYER_ID,
        file: JSON.stringify(data),
        update: JSON.stringify({
          matchExisting : 'feature.properties.number',
          matchUpload : 'feature.properties.number',
        })
      }
    }

    dynamicModels[PLANS_LAYER_ID].updateMany(req)
    .then(()=>{
      console.log('sent ' + data.length + ' plans')
    })
    .catch((err)=>{
      console.log(err)
    })

  }


}


var getRandomInt = function(min,max) {
  return min + Math.floor(Math.random() * Math.floor(max-min));
}

var init = function() {
  var today = new Date();
  var toDate = new Date(today.setDate(today.getDate()-7));
  var blocksQuery = {$or: [{'feature.properties.last_checked':{ '$lte': toDate }},{'feature.properties.last_checked': null}]}
  var blocks = []
  var cookiejar = rp.jar();
  var base = 'http://mavat.moin.gov.il'
  var url = base + '/MavatPS/Forms/SV3.aspx?tid=3';
  var _include_headers = function(body, response, resolveWithFullResponse) {
    return {'headers': response.headers, 'data': body};
  };
  console.log('initialising...', Object.keys(dynamicModels))
  //console.log(dynamicModels[BLOCKS_LAYER_ID])
  //console.log(dynamicModels[BLOCKS_LAYER_ID].find({},'',{lean:true}))
  dynamicModels[BLOCKS_LAYER_ID].find({layer:BLOCKS_LAYER_ID},'',{lean: true})
  .then(data=>{
    console.log('received ' + data.length + ' blocks')
    blocks = data.slice(0,1)

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
    logger.info('got cookies!')
    console.log(res.headers['set-cookie'], typeof res.headers['set-cookie'], res.headers['set-cookie'] instanceof Array )


    res.headers['set-cookie'].forEach(x=>{
      cookiejar.setCookie(request.cookie(x).toString(), base)
    });

    return rp(url,{
      jar: cookiejar
    })
  })
  .then(html => {
    console.log('got session identifiers!')
    const form = getSessionIdentifiers(html)

    if (!form['__VIEWSTATE']) return null
    syncLoop(blocks.length, function(loop){
      const i = loop.iteration();
      const blockId = '30610' //blocks[i].feature.properties.number
      console.log(i + '. fetching plans for block: ' + blockId )

      Object.assign(form,{
        ctl00$ContentPlaceHolder1$txtFromBlock:blockId,
        ctl00$ContentPlaceHolder1$txtToBlock:blockId,
      })

      rp({
        uri : url,
        method:'POST',
        body:form,
        json: true,
        followAllRedirects: true, //by default turned off for POST requests
        jar: cookiejar
      }, function(err,resp,body){

        console.log('got plans page!')
        //console.log(html)
        setTimeout(()=>{
          const scraper = new Scraper(body,blockId)
          scraper.scrapeTable()
          scraper.addFeatureKeys()
          console.log(scraper.scrapeData)
          //scraper.postData()
          loop.next();
        },getRandomInt(4000,6000))

      })

    }, function(){
      console.log('finished - took ' + (new Date() - today)/60 + 'minutes' )
    });

  })
  .catch(err=>{
    console.log('error',err)
  })



}

return {
  init:init
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
    'ctl00$ContentPlaceHolder1$txtFromMeetingDate':'01/01/2010',
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
