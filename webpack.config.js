const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './example/index.js',

  output: {
    filename: 'bundle.js',
    path: './dist/',
    publicPath: 'http://localhost:8080/',
  },

  devServer: {
    contentBase: './example',
    publicPath: 'http://localhost:8080/',
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap&importLoaders=1') },
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!less-loader') },
    ],
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new ExtractTextPlugin('bundle.css', {
      allChunks: true,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.BROWSER_MODE': 'true',
    }),
    new webpack.SourceMapDevToolPlugin({
      exclude: /node_modules/,
    }),
    new webpack.IgnorePlugin(new RegExp('^(fs|ipc)$')),
  ],
};
