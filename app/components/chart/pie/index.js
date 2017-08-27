// Libs
import React from 'react'
// ECharts
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';

const option = (data) => ({
    color: ['#193568', '#176297', '#93b7e3'],

    tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>Version {b}: {c} times ({d}%)"
    },

    series : [
        {
            name:'Download Ratio',
            type:'pie',
            radius : [20, 110],
            center: ['50%', '50%'],
            roseType: 'radius',
            grid: {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                containLabel: true
            },
            data: data.sort((a, b) => a.value - b.value),

            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
                return Math.random() * 200;
            }
        }
    ]
})

// Main components
export default ({data}) =>
    <ReactEchartsCore
        echarts={echarts}
        option={option(data)}
        notMerge={true}
        lazyUpdate={true}
    />