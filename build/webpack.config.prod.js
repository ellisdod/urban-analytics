'use strict'

const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const MiniCssExtractPlugin  = require('mini-css-extract-plugin')

require('dotenv').config()


module.exports = merge(baseConfig, {
  mode: 'production',
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all",
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.css?$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }, {
        test: /\.styl(us)?$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'stylus-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'main.css'
    }),
    new webpack.DefinePlugin({
      'process.env.VUE_APP_OKTA_CLIENT_ID' : JSON.stringify(process.env.VUE_APP_OKTA_CLIENT_ID),
      'process.env.VUE_APP_OKTA_URI' : JSON.stringify(process.env.VUE_APP_OKTA_URI),
      'process.env.MONGODB_URI': JSON.stringify(process.env.MONGODB_URI)
    })
  ]
})
