const express = require('express')
const bodyParser = require('body-parser')
const OktaJwtVerifier = require('@okta/jwt-verifier')
const building_controller = require('./controllers/building.controller')
const formidableMiddleware = require('express-formidable')
const mongoose = require('mongoose');
const path = require('path');
var history = require('connect-history-api-fallback');
//require('dotenv').config();

const oktaJwtVerifier = new OktaJwtVerifier({
  client_id: process.env.VUE_APP_OKTA_CLIENT_ID || '***REMOVED***',
  issuer: 'https://dev-160658.okta.com/oauth2/default'
})


// Set up mongoose connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function requireAuth(req, res, next) {
  // require every request to have an authorization header
  if (!req.headers.authorization) {
    return next(new Error('Authorization header is required'))
  }
  let parts = req.headers.authorization.trim().split(' ')
  let accessToken = parts.pop()
  console.log({accessToken : accessToken}); //for testing only
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

if (process.env.NODE_ENV != 'production') {
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
  const cors = require('cors')
  app.use(cors())
}

app.use(bodyParser.json())

//if (process.env.NODE_ENV == 'production') {
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
//}


app.get('/test', requireAuth, building_controller.test);
app.post('/create', requireAuth, formidableMiddleware(), building_controller.building_create);
app.get('/building/:id', requireAuth, building_controller.building_details);
app.get('/neighbourhood/:name', requireAuth, building_controller.building_neighbourhood);
app.put('/building/:id', requireAuth, building_controller.building_update);
app.get('/survey/buildings', requireAuth, building_controller.surveys);

app.use(express.static(__dirname));

app.listen(process.env.PORT || 8081, () => {
  console.log({ ENV: process.env.NODE_ENV, ID: process.env.VUE_APP_OKTA_CLIENT_ID, PORT: process.env.PORT });
  console.log('running on port ' + (process.env.PORT || 8081));
});
