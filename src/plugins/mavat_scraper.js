var mavatScraper = (function () {


 var BASE_URL = 'https://ejmap-dev.herokuapp.com',
     PLANS_LAYER_ID = '5d2f0b46fe977fdb42180cd2',
     BLOCKS_LAYER_ID = '5d2f372b72079bde94245735';


var syncLoop = function(iterations, process, exit){
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


   var Scraper = function () {
   
   this.nestedPath = 'feature.properties.'
   this.scrapeData = []

   this.scrapeTable = function () {
    let rows = document.getElementsByClassName('clsTableRowNormal')
    
    for (var x=0;x<rows.length;x++) {
        const c = rows[x].children
        this.scrapeData.push({
            mavat_code: c[0].innerText,
            number: c[4].firstChild.innerText
        })
    }
    return this.scrapeData.length
        
   }

   this.addFeatureKeys = function (data) {
    var self = this
    return data.map(x=> Object.keys(x).reduce(function(acc,key){
        acc[self.nestedPath+key] = x[key]
        return acc
      },{})
    )
     
   }

   this.postData = function () {

    var query = {
      matchExisting : 'feature.properties.number',
      matchUpload : 'feature.properties.number',
    }
    let data = this.addFeatureKeys(this.scrapeData)
    let formData = new FormData()
    formData.append('update', JSON.stringify(query))
    formData.append('file', JSON.stringify(data))
    formData.append('layer', PLANS_LAYER_ID)

    let options = {
      'method': 'POST',
      'mode':'no-cors',
      'body': formData
    }

    fetch( BASE_URL +'/features/'+PLANS_LAYER_ID+'/updateMany/'+ encodeURIComponent(query)
,options)
    .then(()=>{
      console.log('sent ' + data.length + ' plans')
    })
    .catch((err)=>{
      console.log(err)
    })
    

   }


}


var getPlansByBlock = function(blockId) {
  
  document.getElementById('ctl00_ContentPlaceHolder1_txtFromBlock').value = blockId + ''
  document.getElementById('ctl00_ContentPlaceHolder1_txtToBlock').value = blockId + ''
  document.getElementById('ctl00_ContentPlaceHolder1_btnFilter').click()
  
  setTimeout(()=>{
    
    const scraper = new Scraper(config)
    scraper.scrapeTable()
    scraper.postData()
    window.history.back()

  },getRandomInt(4000,6000))

}

var getRandomInt = function(min,max) {
  return min + Math.floor(Math.random() * Math.floor(max-min));
}

var init = function() {
   var today = new Date();
   var toDate = new Date(today.setDate(today.getDate()-7));
   var query = JSON.stringify({$or: [{'feature.properties.last_checked':{ '$lte': toDate }},{'feature.properties.last_checked': null}]})

   fetch( BASE_URL +'/features/'+BLOCKS_LAYER_ID+'/updateMany/'+ encodeURIComponent(query)
   ,options)
    .then(()=>{
      console.log('sent ' + data.length + ' plans')
    })
 
}

return {
  syncLoop : syncLoop,
  Scraper : Scraper,
  getPlansByBlock : getPlansByBlock,
  init:init
}
  

})()


mavatScraper.init()
