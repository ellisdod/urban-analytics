const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const OktaJwtVerifier = require('@okta/jwt-verifier')
const building_controller = require('./controllers/building.controller')
const formidableMiddleware = require('express-formidable')
const mongoose = require('mongoose');
const path = require('path');
var history = require('connect-history-api-fallback');
require('dotenv').config();

const oktaJwtVerifier = new OktaJwtVerifier({
  client_id: '***REMOVED***',
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
  oktaJwtVerifier.verifyAccessToken(accessToken)
    .then(jwt => {
      req.user = {
        uid: jwt.claims.uid,
        email: jwt.claims.sub
      }
      next()
    })
    .catch(next) // jwt did not verify!
}

// verify JWT token middleware
//app.use(requireAuth);
let app = express()
//app.use(cors())
app.use(bodyParser.json())

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

app.get('/test', requireAuth, building_controller.test);
app.post('/create', requireAuth, formidableMiddleware(), building_controller.building_create);
app.get('/building/:id', requireAuth, building_controller.building_details);
app.get('/neighbourhood/:name', requireAuth, building_controller.building_neighbourhood);
app.put('/building/:id', requireAuth, building_controller.building_update);

app.use(express.static(__dirname));

app.set('port', (process.env.PORT || 8080));

app.listen(app.get('port'), () => {
  console.log({ ENV: process.env.NODE_ENV });
  console.log('Derp is running at localhost ' + app.get('port') );
});
