// Libs
import React from 'react'
// ECharts
import ReactEchartsCore from 'echarts-for-react/lib/core'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'

const option = (tag, data) => ({
    color: ['#193568'],
    tooltip: {
        trigger: 'axis',
        formatter: "{a} <br/>Version {b}: {c} times",
        axisPointer : {
            type : 'shadow'
        }
    },
    grid: {
        top: 0,
        left: -40,
        right: 0,
        bottom: 0,
        containLabel: true
    },
    xAxis: [{
        type : 'category',
        data : tag,
        axisLine: {
            lineStyle: {
                color: '#999999'
            }
        },
        axisTick: {
            alignWithLabel: true
        },
        axisLabel: {

        }
    }],
    yAxis: [{
        show: false,
        type : 'value',
        axisLine: {
            show: false,
            lineStyle: {
                color: '#999999'
            }
        },
    }],
    series: [
        {
            name:'Download Count',
            type:'bar',
            barWidth: '80%',
            data: data
        }
    ]
})

// Main components
export default ({tag, data}) =>
    <ReactEchartsCore
        echarts={echarts}
        option={option(tag, data)}
        notMerge={true}
        lazyUpdate={true}
    />