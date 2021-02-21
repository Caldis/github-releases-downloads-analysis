// Libs
import React from 'react'
// ECharts
import ReactEcharts from 'echarts-for-react'

const option = (data, xAxisData) => ({
  color: ['#193568'],
  tooltip: {
    trigger: 'axis',
    formatter: '{a} <br/>Version {b}: {c} times',
    axisPointer: {
      type: 'shadow',
    },
  },
  grid: {
    top: 0,
    left: -40,
    right: 0,
    bottom: 0,
    containLabel: true,
  },
  xAxis: [{
    type: 'category',
    data: xAxisData,
    axisLine: {
      lineStyle: {
        color: '#999999',
      },
    },
    axisTick: {
      alignWithLabel: true,
    },
    axisLabel: {},
  }],
  yAxis: [{
    show: false,
    type: 'value',
    axisLine: {
      show: false,
      lineStyle: {
        color: '#999999',
      },
    },
  }],
  series: [
    {
      name: 'Download Count',
      type: 'bar',
      barWidth: '80%',
      data: data,
    },
  ],
})

// Main components
export default ({ data, tag }) =>
  <ReactEcharts
    option={option(data, tag)}
    notMerge={true}
    lazyUpdate={true}
  />
