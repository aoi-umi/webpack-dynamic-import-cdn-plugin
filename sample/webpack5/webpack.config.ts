import * as path from 'path';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as Webpack from 'webpack';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
const { DynamicImportCdnPlugin } = require('../../dest/lib');

const VueLoaderPlugin = require('vue-loader/lib/plugin-webpack5');

console.log('process.env.NODE_ENV :>> ', process.env.NODE_ENV);

export default {
	entry: ['@babel/polyfill', './src/main.ts'],
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		publicPath: '/',
	},
	module: {
		rules: [
			{
				test: /\.css|sass|scss$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					{
						loader: 'css-loader',
					},
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [['postcss-preset-env', {}]],
							},
						},
					},
					{
						loader: 'sass-loader',
					},
				],
			},
			{
				test: /\.ts|js$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
					},
				],
			},
			{
				test: /\.vue$/,
				use: [
					{
						loader: 'vue-loader',
					},
				],
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin(),
		new HtmlWebpackPlugin({
			template: 'src/index.html',
		}),
		new Webpack.HotModuleReplacementPlugin(),
		new CleanWebpackPlugin(),
		new VueLoaderPlugin(),
		new Webpack.ProvidePlugin({
			Vue: ['vue/dist/vue.esm.js', 'default'],
		}),
		new Webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
		new DynamicImportCdnPlugin({
			urlPrefix: 'https://cdn.jsdelivr.net/npm',
			css: {
				'video.js/dist/video-js.min.css': '/video.js@7.6.6/dist/video-js.min.css',
			},
			js: {
				vue: {
					moduleName: 'Vue',
					url: '/vue@2.6.10/dist/vue.min.js',
					// noUrlPrefix: true
				},
				'vue-router': {
					moduleName: 'VueRouter',
					url: '/vue-router@3.0.2/dist/vue-router.min.js',
				},

				'video.js': {
					moduleName: 'videojs',
					url: '/video.js@7.6.6/dist/video.min.js',
				},
			}
		})
	],
	resolve: {
		extensions: ['.ts', '.js', '.vue'],
		plugins: [
			// 将 tsconfig 中配置的路径别名映射到 webpack.resolve.alias 上
			new TsconfigPathsPlugin(),
		],
	},
	devtool:
		process.env.NODE_ENV === 'development' ? 'eval-source-map' : 'source-map',
	devServer: {
		contentBase: path.resolve(__dirname, 'dist'),
		open: true,
		port: 8888,
		compress: true,
		hot: true,
		clientLogLevel: 'silent',
		noInfo: true,
	},
} as Webpack.Configuration;
