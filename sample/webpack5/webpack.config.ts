import * as path from 'path';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as Webpack from 'webpack';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
const { DynamicImportCdnPlugin } = require('../../dest/lib');

const VueLoaderPlugin = require('vue-loader/lib/plugin-webpack5');

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
				test: /\.(css|sass|scss)$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					{
						loader: 'css-loader',
					},
				],
			},
			{
				test: /\.(ts|js)$/,
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
			{
				test: /\.(ttf|eot|woff|woff2|svg)$/,
				type: 'asset',
				generator: {
					filename: 'files/[base]',
				},
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
		new DynamicImportCdnPlugin({
			urlPrefix: 'https://cdn.jsdelivr.net/npm',
			css: {
				'video.js/dist/video-js.min.css': '/video.js@7.6.6/dist/video-js.min.css',
				'view-design/dist/styles/iview.css': '/view-design@4.6.1/dist/styles/iview.css',
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
