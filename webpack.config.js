const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = (env) => {
  const mode = env.production ? 'production' : 'development';
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  return {
    mode,
    entry: path.resolve(__dirname, 'src/index.tsx'),
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: isProduction
        ? 'static/js/[name].[contenthash:8].js'
        : 'static/js/[name].js',
      chunkFilename: isProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : 'static/js/[name].chunk.js',
      assetModuleFilename: isProduction
        ? 'static/media/[name].[hash][ext]'
        : 'static/js/[name][ext]',
      publicPath: '/',
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.(bmp|gif|jpe?g|png)$/,
              type: 'asset',
              parser: {
                dataUrlCondition: {
                  maxSize: 10000,
                },
              },
            },
            {
              test: /\.svg$/,
              use: [
                {
                  loader: '@svgr/webpack',
                  options: {
                    prettier: false,
                    svgo: false,
                    svgoConfig: {
                      plugins: [{ removeViewBox: false }],
                    },
                    titleProp: true,
                    ref: true,
                  },
                },
                {
                  loader: 'file-loader',
                  options: {
                    name: isProduction
                      ? 'static/media/[name].[hash].[ext]'
                      : 'static/media/[name].[ext]',
                  },
                },
              ],
              issuer: {
                and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
              },
            },
            {
              test: /\.(js|jsx|mjs|ts|tsx)$/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {
                    plugins: [isDevelopment && 'react-refresh/babel'].filter(
                      Boolean
                    ),
                  },
                },
                {
                  loader: 'ts-loader',
                  options: {
                    transpileOnly: true,
                  },
                },
              ],
              include: path.resolve(__dirname, 'src'),
            },
            {
              exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              type: 'asset/resource',
            },
          ],
        },
      ],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
    },
    plugins: [
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ko/),
      !isProduction &&
        new HtmlWebpackPlugin(
          Object.assign(
            {},
            {
              inject: true,
              template: path.resolve(__dirname, 'public/index.html'),
            },
            isProduction
              ? {
                  minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true,
                  },
                }
              : undefined
          )
        ),
      new ForkTsCheckerWebpackPlugin(),
      new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
      }),
      isDevelopment && new ReactRefreshWebpackPlugin(),
      isDevelopment && new webpack.HotModuleReplacementPlugin(),
    ].filter(Boolean),
    cache: {
      type: 'filesystem',
      cacheDirectory: path.resolve(__dirname, 'node_modules/.cache'),
      store: 'pack',
      buildDependencies: {
        defaultWebpack: ['webpack/lib/'],
        config: [__filename],
        tsconfig: [path.resolve(__dirname, 'tsconfig.json')].filter((f) =>
          fs.existsSync(f)
        ),
      },
    },
    optimization: isProduction
      ? {
          minimize: isProduction,
          minimizer: [
            new TerserPlugin({
              extractComments: false,
              terserOptions: {
                parse: {
                  ecma: 8,
                },
                compress: {
                  ecma: 5,
                  warnings: false,
                  comparisons: false,
                  inline: 2,
                },
                mangle: {
                  safari10: true,
                },
                output: {
                  ecma: 5,
                  comments: false,
                  ascii_only: true,
                },
              },
            }),
          ],
        }
      : undefined,
    devServer: {
      compress: true,
      client: {
        logging: 'none',
      },
      historyApiFallback: true,
      port: 3000,
      open: true,
    },
  };
};
