// Libs
import React from 'react'
// Styles
import style from './index.module.scss'

// Main components
export default ({ title, data, tail }) => {
  return (
    <div>
      <span className={style.title}>{title}</span>
      <div className={style.content}>
        <h2 className={style.data}>{data}</h2>
        <span className={style.tail}>{tail}</span>
      </div>
    </div>
  )
}
