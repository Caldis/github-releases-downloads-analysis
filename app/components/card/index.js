// Libs
import React from 'react'
// Styles
import style from './index.less'

// Main components
export default (props) => {
    const { className, children, ...restProps } = props
    return (
        <div className={`${style.card} ${className || ''}`} {...restProps}>
            {children}
        </div>
    )
}