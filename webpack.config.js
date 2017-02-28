var path = require('path');
var CopyAssetsPlugin = require('copyassets-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var combineLoaders = require("webpack-combine-loaders");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var StyleLintPlugin = require('stylelint-webpack-plugin');
var webpack = require('webpack');

module.exports = {
    context: __dirname,
    node: {
        __filename: true
    },
    entry: ['babel-polyfill', './src/app.js'],
    output: {
        path: './dist',
        filename: '[name].js'
    },
    module: {
        // 在 Webpack 中忽略对已知文件的解析
        noParse: [],
        loaders: [

            {
                test: /\.json$/,
                loader: 'json-loader'
            }, {
                loader: 'babel-loader',
                test: /\.jsx?$/,
                query: {
                    plugins: ['transform-runtime'],
                    presets: ['es2015', 'stage-0']
                },
                exclude: [path.resolve(__dirname, "node_modules")]
            }, {
                test: require.resolve('snapsvg'),
                loader: 'imports-loader?this=>window,fix=>module.exports=0'
            }, {
                test: /\.(s?css)$/,
                // exclude: [path.resolve(__dirname, "node_modules")],
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader'),
                /*combineLoaders([{
                	loader: 'style-loader'
                }, {
                	loader: 'css-loader',
                	query: {
                		modules: true,
                		localIdentName: '[name]__[local]___[hash:base64:5]'
                	}
                }, {
                	loader: 'sass-loader'
                }])*/
            }, {
                test: /\.png$/,
                loader: "url-loader?limit=100000"
            }, {
                test: /\.jpg$/,
                loader: "file-loader"
            }, {
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/font-woff"
            }, {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/octet-stream"
            }, {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file"
            }, {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=image/svg+xml"
            }
        ]
    },
    resolve: {
        modulesDirectories: ['node_modules'],
        alias: {
            TweenLite: 'gsap/src/minified/TweenLite.min.js',
            TimelineMax: 'gsap/src/minified/TimelineMax.min.js'
        },
        extensions: ['', '.js']
    },
    plugins: [
        new StyleLintPlugin({
            syntax: 'scss'
        }),
        new ExtractTextPlugin("styles.css"),
        new HtmlWebpackPlugin({
            favicon: 'resources/favicon.ico',
            template: 'src/index.html',
            title: 'parallelLine',
            css: ['styles.css']
        }),
        new CleanWebpackPlugin(['dist']),
        new CopyAssetsPlugin(['./dist', './docs']),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ],
}