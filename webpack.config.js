const path = require('path')
const glob = require('glob-all')
const webpack = require('webpack')
const merge = require('webpack-merge')

const parts = require('./webpack.parts')

const PATHS = {
  app: path.join(__dirname, 'src'),
  build: path.join(__dirname, 'dist'),
}

const commonConfig = merge([
  {
    entry: {
      app: ['@babel/polyfill', PATHS.app],
    },
  },
  parts.loadPug({
    options: {
      pretty: true,
    },
  }),
  parts.loadJavaScript({ include: PATHS.app }),
])

const developmentConfig = merge([
  {
    plugins: [
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
    ],
  },
  parts.devServer({
    // Customize host/port here if needed
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS(),
  parts.loadImages(),
])

const productionConfig = merge([
  {
    output: {
      chunkFilename: 'js/[name].[chunkhash:8].js',
      filename: 'js/[name].[chunkhash:8].js',
      // publicPath: '/mook-blog/',
    },
  },
  // parts.clean(PATHS.build),
  parts.minifyJavaScript(),
  parts.minifyCSS({
    options: {
      preset: ['default', { discardComments: { removeAll: true } }],
      // Run cssnano in safe mode to avoid
      // potentially unsafe transformations.
      safe: true,
    },
  }),
  parts.extractCSS({
    use: ['css-loader', 'fast-sass-loader', parts.autoprefix()],
  }),
  parts.purifyCSS({
    paths: glob.sync(
      [`${PATHS.app}/**/*.js`, `${PATHS.app}/views/**/*.pug`],
      {
        nodir: true,
      }
    ),
  }),
  parts.loadImages({
    options: {
      limit: 15000,
      name: 'images/[name].[hash:8].[ext]',
    },
  }),
  {
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'initial',
          },
        },
      },
      runtimeChunk: {
        name: 'manifest',
      },
    },
  },
  parts.attachRevision(),
])

module.exports = mode => {
  const pages = [
    parts.page({
      title: 'Webpack4 Bone Demo',
      template: `${PATHS.app}/views/index.pug`,
      filename: 'index.html',
      minify: {
        removeScriptTypeAttributes: true,
      },
    }),
    parts.page({
      title: 'Hell World - Webpack4 Bone Demo',
      template: `${PATHS.app}/views/hellworld.pug`,
      filename: 'hellworld.html',
      minify: {
        removeScriptTypeAttributes: true,
      },
    }),
  ]

  const config =
    mode === 'production' ? productionConfig : developmentConfig

  return pages.map(page =>
    merge(commonConfig, config, page, { mode })
  )
}
