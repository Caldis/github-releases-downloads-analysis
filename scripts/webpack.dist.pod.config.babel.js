// 基本库
import path from 'path'
import webpack from 'webpack'
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
				NODE_ENV: JSON.stringify("production"),
				DATE_ENV: DATE
			}
		}),
		// 代码压缩
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: false,
            comments: false,
			compress: {
				warnings: false
			}
		}),
		// Loader压缩
		new webpack.LoaderOptionsPlugin({
			minimize: true
		})
	]
})

// 高级配置 (暂时禁用)
const SPLIT = false
const SOURCEMAP = false
// 代码分割 (https://zhuanlan.zhihu.com/p/26710831)
if (SPLIT) {
	config.output = {
		path: path.resolve(__dirname, '../dist'),
		filename: '[name].js',
		chunkFilename: '[name].chunk.js',
	}
	config.plugins.concat(
		// 代码分割
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			minChunks: ({ resource }) => (
				resource &&
				resource.indexOf('node_modules') >= 0 &&
				resource.match(/\.js$/)
			),
		}),
		new webpack.optimize.CommonsChunkPlugin({
			async: 'common',
			minChunks: (module, count) => (
				count >= 2
			),
		}),
	)
}
// source map
if (SOURCEMAP) {
	config.devtool = '#source-map'
}

export default config