// Libs
import React from 'react'
// Styles
import style from './index.module.scss'

// Main components
export default (props) => {
  const { className, children, ...restProps } = props
  return (
    <div className={`${style.card} ${className || ''}`} {...restProps}>
      {children}
    </div>
  )
}
