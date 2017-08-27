// 基本库
import webpack from 'webpack'
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// 从基础设置继承
import merge from 'webpack-merge'
import baseConfig from './webpack.dist.base.config.babel.js'
// 日期
import { DATE } from './webpack.base.config.babel'

const config =  merge.smart(baseConfig, {
	plugins: [
		// 设置环境变量
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("development"),
				DATE_ENV: DATE
			}
		}),
		// 输出包文件分析图
		new BundleAnalyzerPlugin()
	]
})

export default config