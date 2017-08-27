/**
 * 名称: HMR入口
 * 用途: 用于承载 React Hot Loader, 实际的 APP 入口位于 app.js 中
**/

// React Libs
import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
// App Entry
import App from './app'

const render = Component => {
    ReactDOM.render(
		<AppContainer>
			<Component/>
		</AppContainer>,
        document.getElementById('root')
    )
}

render(App)

if (module.hot) module.hot.accept('./app', () => {
    // 在 webpack 以 ES6 模式编写时, 这里需要重新 require 一次 app, 然后重新传入 render, 方会在改变后自动刷新
    // 同时, 需要安装 babel 的插件 add-module-exports, 并在 .babelrc 中在 react-hot-loader/babel 前面引用该插件
    // .babelrc 的插件列表中, react-hot-loader/babel 需要放在最后
    const NextApp = require('./app')
	render(NextApp)
})