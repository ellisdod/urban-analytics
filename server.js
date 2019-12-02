const express = require('express')
const bodyParser = require('body-parser')
const OktaJwtVerifier = require('@okta/jwt-verifier')
const mongoose = require('mongoose');
const path = require('path');
const formidableMiddleware = require('express-formidable')
const controllers = require('./controllers/features.controller')
//const controllers = require('./controllers/base.controller')
const func = require('./src/api.functions.js')
const dbConfig = require('./src/db.config')
const planMonitor = require('./planMonitor')
const request = require('request')

var history = require('connect-history-api-fallback');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const oktaJwtVerifier = new OktaJwtVerifier({
    clientId: process.env.VUE_APP_OKTA_CLIENT_ID,
    issuer: process.env.VUE_APP_OKTA_URI
  })


// Set up mongoose connection
//use test instead of ejmap for testing
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function requireAuth(req, res, next) {
  // require every request to have an authorization header
  if (!req.headers.authorization) {
    console.log('headers of rejected request', req.headers)
    return next(new Error('Authorization header is required'))
  }
  let parts = req.headers.authorization.trim().split(' ')
  let accessToken = parts.pop()
  //console.log({accessToken : accessToken}); //for testing only
  oktaJwtVerifier.verifyAccessToken(accessToken)
    .then(jwt => {
      req.user = {
        uid: jwt.claims.uid,
        email: jwt.claims.email
      }
      next()
    })
    .catch(next) // jwt did not verify!
}

// verify JWT token middleware
//app.use(requireAuth);
let app = express()

if (process.env.NODE_ENV !== 'production') {

  const cors = require('cors');
  app.use(cors());
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

}

app.use(bodyParser.json())

if (process.env.NODE_ENV === 'production') {
  const staticFileMiddleware = express.static(__dirname + "/dist");
  app.use(staticFileMiddleware);
  app.use(history({
    disableDotRule: true,
    verbose: true
  }));
  app.use(staticFileMiddleware);

  app.get('/', function (req, res) {
    res.render(path.join(__dirname + '/dist/index.html'))
  })
}



const middlewareKey = {
  formidable : formidableMiddleware()
}

//console.log(dbConfig)
controllers.then(controllers=>{
  console.log(Object.keys(controllers))
  //console.log('layers',controllers.layers)
  //console.log('arealayers model',controllers.areaLayers.model)

  Object.keys(dbConfig).forEach(col => {
    //console.log(col +' find',controllers[col].find)
    //console.log(controllers[col] instanceof base.controller)
    //console.log(controllers[col])
    if (!controllers[col]) return null
    for (let i = 0; i < func.length; i++) {
      //console.log(col.name,func.name,func.method, func.params)
      if (func[i].restrict && func[i].restrict.indexOf(col)===-1 )
        continue;

      const params = dbConfig[col].params || ''
      const url = `/${col}${params}/${func[i].name}${func[i].params}`
      console.log(func[i].method,url)
      const method = function(req, res,next) { controllers[col][func[i].name](req, res,next) }

      if (func[i].middleware) {
          app[func[i].method](url, middlewareKey[func[i].middleware], method)
      } else {
          app[func[i].method](url, method)
      }
    }
  })

})


function planMonitorFeed (req, res, next) {
  /*console.log('getting plan data')
  //planMonitor.mavatScraper.fixIndicators()
  planMonitor.mavatScraper.init([30788,
30786,
30792,
31242,
31251,
31239,
31249,
30921,
30919,
30898,
30899,
29988]).then(x=>{
      console.log('logdata',x)
      res.status(200).send(x)
  })

planMonitor.mavatScraper.init().then(x=>{
      console.log('logdata',x)
      planMonitor.downloadMissingGeodata()
      res.status(200).send(x)
  })*/
}

function testFeed (req, res, next) {
  scrapePlans()
  res.status(200).send('')
}

app.post('/planmonitor',planMonitorFeed)
app.post('/test',testFeed)



app.listen(process.env.PORT || 8081, () => {
  console.log({ ENV: process.env.NODE_ENV, ID: process.env.VUE_APP_OKTA_CLIENT_ID, PORT: process.env.PORT });
  console.log('running on port ' + (process.env.PORT || 8081));
});


var cron = require('node-cron');

//cron.schedule('*/10 * * * *', scrapePlans);

function scrapePlans() {
  request({
    method: 'POST',
    uri : process.env.GOOGLE_SCRIPT_URI,
    body : {key:process.env.GOOGLE_SCRIPT_KEY},
    json: true
  }, function(err,x) {
    console.log('scrapePlans')
  })
}
