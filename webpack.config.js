const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const remarkMath = require('remark-math');
const rehypeKatex = require('rehype-katex');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const isDev = process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  devtool: isDev && !isTest ? 'cheap-module-source-map' : undefined,
  context: __dirname,
  mode: isDev ? 'development' : 'production',
  entry: {
    main: './src/index.tsx'
  },
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.mdx?$/,
        use: [
          'babel-loader',
          {
            loader: '@mdx-js/loader',
            options: {
              remarkPlugins: [remarkMath],
              rehypePlugins: [rehypeKatex]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
      },
      {
        test: /\.worker\.(ts|js)$/,
        use: {
          loader: 'worker-loader',
          options: { inline: 'fallback' }
        }
      },
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.(png|jpg|gif|svg|woff(2)?|ttf|eot)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              fallback: 'file-loader',
              name: 'static/[name].[hash].[ext]'
            }
          }
        ]
      }
    ]
  },
  devServer: {
    hot: isDev,
    stats: {
      modules: false,
      chunks: false,
      colors: true
    },
    port: 8080
  },
  plugins: [
    !isTest ? new CleanWebpackPlugin() : null, // Deletes webpack's output path before builds
    isDev && !isTest ? new webpack.HotModuleReplacementPlugin() : null,
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(isDev ? 'development' : 'production')
      }
    }),
    new CaseSensitivePathsPlugin(),
    !isDev ? new ImageminPlugin({ test: /\.(png|jpg|gif|svg)$/ }) : null,
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new FaviconsWebpackPlugin({
      logo: './src/Drexel.png',
      inject: true,
      prefix: '',
      publicPath: '/static',
      outputPath: './static'
    })
  ].filter(Boolean),
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.wasm'],
    alias: {
      src: path.join(__dirname, 'src'),
      'react-dom': isDev ? '@hot-loader/react-dom' : 'react-dom'
    }
  }
};
