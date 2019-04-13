const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const OktaJwtVerifier = require('@okta/jwt-verifier')
const building_controller = require('../controllers/building.controller')
const formidableMiddleware = require('express-formidable')
const mongoose = require('mongoose');
require('dotenv').config();

const oktaJwtVerifier = new OktaJwtVerifier({
  client_id: '***REMOVED***',
  issuer: 'https://dev-160658.okta.com/oauth2/default'
})

let app = express()
app.use(cors())
app.use(bodyParser.json())

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
app.use(requireAuth);
app.get('/test', building_controller.test);
app.post('/create', formidableMiddleware(), building_controller.building_create);
app.get('/building/:id', building_controller.building_details);
app.get('/neighbourhood/:name', building_controller.building_neighbourhood);
app.put('/building/:id', building_controller.building_update);


app.listen(8081, () => {
  console.log('listening to port localhost:8081')
})


// Set up mongoose connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
