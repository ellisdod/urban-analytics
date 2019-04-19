'use strict'
var nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const path = require('path')

const utils = require('./utils')

module.exports = {
  output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].[hash].js',
        publicPath: '/'
  },
  entry: "./src/main.js",
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': utils.resolve('src'),
      //'assets': utils.resolve('assets'),
      'pages': utils.resolve('src/pages'),
      'static': utils.resolve('static'),
      'components': utils.resolve('src/components')
    }
  },
  //target: 'node', // in order to ignore built-in modules like path, fs, etc.
  //externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  module: {
    rules: [
/*      {
    test: /\.html$/,
    exclude: [/node_modules/], //[/node_modules/,require.resolve('../index.html')]
    use: {
        loader: 'file-loader',
        query: {
            name: '[name].[ext]'
        },
    },
},*/
      {
        test: /\.(js|vue)$/,
        use: 'eslint-loader',
        enforce: 'pre'
      }, {
        test: /\.vue$/,
        use: 'vue-loader'
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
      }, {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('img/[name].[hash:7].[ext]')
          }
        }
      }, {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('media/[name].[hash:7].[ext]')
          }
        }
      }, {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
          }
        }
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, '../dist', 'index.html'),
     template: path.join(__dirname, '..', 'index.html'),
      inject: true
    }),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([{
      from: utils.resolve('static/img'),
      to: utils.resolve('dist/static/img'),
      toType: 'dir'
    }])
  ]
}
