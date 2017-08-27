// 基本库
import webpack from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import TransferWebpackPlugin from 'transfer-webpack-plugin'
// 从基础设置继承
import merge from 'webpack-merge'
import baseConfig from './webpack.base.config.babel.js'

const config =  merge.smart(baseConfig, {
	entry: {
		app: [
			// polyfill
			'babel-polyfill',
			// App Entry
			'./app/index.js'
		]
	},

	output: {
        filename: 'bundle.js',
		path: path.resolve(__dirname, '../docs'),
        publicPath: '/',
	},

	performance: {
		hints: false
	},

	plugins: [
		// HTML自动注入, 注意这里需要依赖 output 的 publicPath 为 '/', 不然会导致服务器上historyFallback失效
		new HtmlWebpackPlugin({
			hash: true,
			filename: 'index.html',
			template: './build/index.template.html',
			minify: {
				collapseWhitespace: true,
				collapseInlineTagWhitespace: true,
				removeRedundantAttributes: true,
				removeEmptyAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				removeComments: true
			}
		}),
		// 复制 resources 文件夹
		new TransferWebpackPlugin([{
			from: 'build/resources',
			to: 'resources'
		}]),
		// 启用范围提升 (webpack3, 避免在 dev 中使用! 会造成更新性能问题, 且导致热更新出错)
		new webpack.optimize.ModuleConcatenationPlugin()
	]
})

export default config