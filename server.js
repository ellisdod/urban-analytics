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

var history = require('connect-history-api-fallback');
require('dotenv').config();


const oktaJwtVerifier = new OktaJwtVerifier({
    clientId: process.env.VUE_APP_OKTA_CLIENT_ID || '***REMOVED***',
    issuer: 'https://dev-160658.okta.com/oauth2/default'
  })


// Set up mongoose connection
//use test instead of ejmap for testing
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://general:***REMOVED***@cluster0-hn3xl.mongodb.net/ejmap?retryWrites=true', { useNewUrlParser: true });
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
  /*

  const webpack = require('webpack')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const config = require('./webpack.dev.config.js')

  // Set up webpack compiler
  const compiler = webpack(config)
  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
  }));
  app.use(webpackHotMiddleware(compiler));
  */


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
  console.log('getting plan data')
  planMonitor.mavatScraper.init()
  res.status(200).send('ok')
}

app.post('/planmonitor',planMonitorFeed)



//console.log('features controller', dbControl.areas)
//console.log('features controller', dbControl.features.find)




app.listen(process.env.PORT || 8081, () => {
  console.log({ ENV: process.env.NODE_ENV, ID: process.env.VUE_APP_OKTA_CLIENT_ID, PORT: process.env.PORT });
  console.log('running on port ' + (process.env.PORT || 8081));
});



/*
collections.forEach(x=>{
  UrlHandler(x.name,x.controller,x.middleware)
})


app.post('/create/Buildings', requireAuth, formidableMiddleware(), building_controller.building_create);


app.get('/building/:id', requireAuth, building_controller.building_details);
app.get('/neighbourhood/:name', requireAuth, building_controller.building_neighbourhood);
app.put('/building/:id', requireAuth, building_controller.building_update);
app.get('/survey/buildings', requireAuth, building_controller.surveys);

//indicators
app.post('/indicators/create', requireAuth, formidableMiddleware(), indicators_controller.create);
app.get('/indicators',indicators_controller.getAll);

//areas
app.post('/areas/create', requireAuth, formidableMiddleware(), areas_controller.create);
app.get('/areas',verifyLayer(), spatialjoin_controller.getAll);

//features
app.post('/features/create', verifyLayer(), requireAuth, formidableMiddleware(), features_controller.create);
app.post('/features/:layer', verifyLayer(), features_controller.update);
app.get('/features/:params', verifyLayer(), features_controller.getSubset)

//layers
app.post('/layers/delete/:id',layers_controller.delete);
app.post('/layers/update/:id',layers_controller.update);
app.get('/layers',layers_controller.getAll)

function UrlHandler(path, controller, middleware) {
  app.get(`/${path}/getAll`, middleware, controller.getAll)
  app.get(`/${path}/find/:query`, middleware, controller.find)
  app.get(`/${path}/unique/:key`, middleware, controller.unique)
  app.post(`/${path}/create`, requireAuth, formidableMiddleware(), middleware, controller.create)
  app.post(`/${path}/update`, middleware, controller.update)
  app.post(`/${path}/delete/:id`, requireAuth, controller.delete)
  app.post(`/${path}/update/:id`, requireAuth, controller.update)
}
UrlHandler('layers',layers_controller)
UrlHandler('features',features_controller,verifyLayer())
UrlHandler('areas',areas_controller)
UrlHandler('indicators',indicators_controller)

*/

//app.use(express.static(__dirname));
