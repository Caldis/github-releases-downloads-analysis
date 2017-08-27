// 基本库
import path from 'path'
import webpack from 'webpack'
// 从基础设置继承
import merge from 'webpack-merge'
import baseConfig from './webpack.base.config.babel.js'
// 本地服务器配置
import { host, port } from './webpack.base.config.babel'
// 系统
import os from 'os'
// 日期
import { DATE } from './webpack.base.config.babel'
// 自动打开浏览器
import OpenBrowserPlugin from 'open-browser-webpack-plugin'

export default merge.smart(baseConfig, {
	devtool: 'inline-source-map',

	entry: [
		// polyfill
		'babel-polyfill',
		// activate HMR for React
		'react-hot-loader/patch',
		// App Entry
		'./app/index.js'
	],

	output: {
        filename: 'bundle.js',
		path: path.resolve(__dirname, 'build'),
		publicPath: '/static/'
	},

	plugins: [
		// 设置环境变量
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("development"),
				DATE_ENV: DATE
			}
		}),
		// 启用热更新
		new webpack.HotModuleReplacementPlugin(),
        // 热更新时直接返回更新文件名，而不是文件的id。
        new webpack.NamedModulesPlugin(),
        // 跳过编译时出错的代码并记录，使编译后运行时的包不会发生错误
        new webpack.NoEmitOnErrorsPlugin(),
		// 自动打开浏览器
        new OpenBrowserPlugin({
			url: `http://${host}:${port}`,
			browser: os.platform()==='darwin' ? undefined : 'Chrome'
		})
	],

	devServer: {
		hot: true,
		host: host,
		port: port,
		contentBase: 'build',
		historyApiFallback: true,
	}
})