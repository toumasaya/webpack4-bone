const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const PurifyCSSPlugin = require('purifycss-webpack')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const cssnano = require('cssnano')
const webpack = require('webpack')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin')

/**
 * Server
 */
exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    stats: 'errors-only',
    host, // Defaults to `localhost`
    port, // Defaults to 8080
    open: true,
    overlay: true,
    hotOnly: true,
  },
})

/**
 * Views
 */
exports.loadPug = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(pug)$/,
        include,
        exclude,
        use: [
          'html-loader',
          {
            loader: 'pug-html-loader',
            options,
          },
        ],
      },
    ],
  },
})

exports.page = ({
  filename,
  template = require.resolve('./src/views/index.pug'),
  title,
  minify,
} = {}) => ({
  plugins: [
    new HtmlWebpackPlugin({
      filename,
      template,
      title,
      minify,
    }),
  ],
})

/**
 * Styles
 */
exports.loadCSS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(scss)$/,
        include,
        exclude,
        use: [
          'style-loader',
          'css-loader?sourceMap',
          'fast-sass-loader?sourceMap',
        ],
      },
    ],
  },
})

exports.extractCSS = ({ include, exclude, use = [] }) => {
  // Output extracted CSS to a file
  const plugin = new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash:8].css',
  })

  return {
    module: {
      rules: [
        {
          test: /\.(scss|sass)$/,
          include,
          exclude,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: '../',
              },
            },
          ].concat(use),
        },
      ],
    },
    plugins: [plugin],
  }
}

exports.purifyCSS = ({ paths }) => ({
  plugins: [
    new PurifyCSSPlugin({
      paths,
    }),
  ],
})

exports.autoprefix = () => ({
  loader: 'postcss-loader',
  options: {
    plugins: () => [require('autoprefixer')()],
  },
})

/**
 * Assets
 */
exports.loadImages = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(png|jpg|svg)$/,
        include,
        exclude,
        use: {
          loader: 'url-loader',
          options,
        },
      },
    ],
  },
})

exports.loadJavaScript = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include,
        exclude,
        use: 'babel-loader',
      },
    ],
  },
})

/**
 * Building
 */
exports.attachRevision = () => ({
  plugins: [
    new webpack.BannerPlugin({
      banner: new GitRevisionPlugin().version(),
    }),
  ],
})

/**
 * Optimizing
 */
exports.minifyCSS = ({ options }) => ({
  plugins: [
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorPluginOptions: options,
      canPrint: false,
    }),
  ],
})

exports.minifyJavaScript = () => ({
  optimization: {
    minimizer: [new UglifyWebpackPlugin({ sourceMap: true })],
  },
})
