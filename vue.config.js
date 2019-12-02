var merge = require('webpack-merge')
require('dotenv').config()

module.exports = {
  configureWebpack: config => {
    merge(config, {
      VUE_APP_OKTA_CLIENT_ID:process.env.VUE_APP_OKTA_CLIENT_ID,
      VUE_APP_OKTA_URI_:process.env.VUE_APP_OKTA_URI,
      MONGODB_URI:process.env.MONGODB_URI,
    });
  }
}
