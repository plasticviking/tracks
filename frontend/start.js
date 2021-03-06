const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');

const webpackConfig = require('./webpack.dev');

const devServerOptions = {
  contentBase: [path.join(__dirname, 'public/build'), path.join(__dirname, 'assets')],
  publicPath: '/',
  index: '/generated_index.html',
  disableHostCheck: true,
  historyApiFallback: {
    verbose: true,
    rewrites: [
      { from: /^\/$/, to: '/generated_index.html' },
      { from: /^\/admin/, to: '/generated_index.html' },
      { from: /^\/officer/, to: '/generated_index.html' },
      { from: /^\/area_admin/, to: '/generated_index.html' },
      { from: /^\/license_auth_officer/, to: '/generated_index.html' },
      { from: /^\/operator/, to: '/generated_index.html' }
    ],
  },
  port: 5001,
  compress: true,
  public: 'localhost',
  hot: true,
  watchOptions: {
    ignored: ['node_modules'],
    infoVerbosity: 'verbose',
    poll: 1500,
  },
};

WebpackDevServer.addDevServerEntrypoints(webpackConfig, devServerOptions);
const compiler = Webpack(webpackConfig);
const devServer = new WebpackDevServer(compiler, devServerOptions);

devServer.listen(5001, '0.0.0.0', () => {
});
