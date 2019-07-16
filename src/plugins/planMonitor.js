import axios from 'axios'
import api from '../api'

export function getPlanData(mavat_id) {
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
}
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
