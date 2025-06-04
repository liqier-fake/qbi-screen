import React, { useMemo, useEffect, useRef } from "react";
import BaseChart from "./BaseChart";
import type { EChartsOption, SetOptionOpts, ECharts } from "echarts";

// 折线数据类型定义
interface LineData {
  name: string;
  data: Array<number | string | { value: number; isPrediction: boolean }>;
  color?: string;
  type?: string;
  barWidth?: string;
  barGap?: number;
  barCategoryGap?: number;
  yAxisIndex?: number;
}

// 组件 Props 类型定义
interface LineChartProps {
  lineData: LineData[];
  xData: string[] | number[];
  predictionData?: boolean[]; // 添加预测数据标识
  chartSeries?: EChartsOption;
  className?: string;
  style?: React.CSSProperties;
  // 是否启用平移动画效果
  enableSlide?: boolean;
  // 平移速度（毫秒）
  slideInterval?: number;
  // 可视区域宽度（显示多少个数据点）
  visibleDataPoints?: number;
  xAxis?: EChartsOption["xAxis"];
  yAxis?: EChartsOption["yAxis"];
  tooltip?: EChartsOption["tooltip"];
  chartType?: "line" | "thb";
}

// 定义 tooltip 参数类型
interface TooltipParam {
  axisValue: string;
  marker: string;
  seriesName: string;
  value: number | string;
  data?: { value: number; isPrediction: boolean };
}

const LineChart: React.FC<LineChartProps> = ({
  lineData = [],
  xData = [],
  predictionData = [],
  className,
  style,
  enableSlide = false,
  slideInterval = 2000,
  visibleDataPoints = 10,
  yAxis = {},
  tooltip = {},
  xAxis = {},
  chartType = "line",
}) => {
  // 图表实例引用
  const chartInstanceRef = useRef<ECharts | null>(null);
  // 定时器引用
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // 当前视图起始索引
  const startIndexRef = useRef<number>(0);

  const option = useMemo(() => {
    const colorList = ["#00FFC3", "#7D00FF", "#00AEFF", "#FF3B3B", "#FF7B00"];

    // 计算当前视图的数据范围
    const endIndex = Math.min(
      startIndexRef.current + visibleDataPoints,
      xData.length
    );
    const visibleXData = xData.slice(startIndexRef.current, endIndex);
    const visiblePredictionData = predictionData.slice(
      startIndexRef.current,
      endIndex
    );

    // 对每个线条做同样的截取处理
    const visibleLineData = lineData.map((line) => ({
      ...line,
      data: line.data.slice(startIndexRef.current, endIndex),
    }));

    return {
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "40px",
        containLabel: true,
      },
      legend: {
        data: lineData.map((item) => item.name),
        top: 0,
        textStyle: {
          color: "#fff",
          fontSize: 10,
        },
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
      },
      tooltip: {
        trigger: "axis",
        appendToBody: true,
        axisPointer: {
          type: "cross",
        },
        textStyle: {
          fontSize: 10,
        },
        formatter: function (params: TooltipParam[]) {
          let result = params[0].axisValue + "<br/>";
          // 过滤掉值为"-"的数据
          const validParams = params.filter((item) => item.value !== "-");

          // 过滤重复值
          const uniqueParams = validParams.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.seriesName === item.seriesName)
          );

          uniqueParams.forEach((item) => {
            const value =
              chartType === "thb" && item.seriesName.includes("比")
                ? `${item.value}%`
                : item.value;
            result += `${item.marker} ${item.seriesName}: ${value}<br/>`;
          });
          return result;
        },
        ...tooltip,
      },

      xAxis: {
        type: "category",
        data: visibleXData,
        boundaryGap: chartType === "thb", // 为柱状图设置为true
        axisLine: {
          lineStyle: {
            color: "#304766",
          },
        },
        axisLabel: {
          color: "#fff",
          interval: 0, // 强制显示所有标签
          rotate: 0, // 保持不倾斜
          fontSize: 10, // 保持小字体
          margin: 14, // 与轴线距离
          width: 80, // 标签容器宽度
          overflow: "break", // 文字过长时换行
          lineHeight: 12, // 行高
          align: "left", // 文字左对齐
          padding: [0, 0, 0, -30], // 向左偏移标签
          formatter: (value: string, index: number) => {
            return visiblePredictionData[index] ? `${value}\n(预测)` : value;
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#304766",
            type: "dashed",
          },
        },
        ...xAxis,
      },
      yAxis: Array.isArray(yAxis) ? yAxis : [yAxis], // 确保yAxis始终是数组
      series: visibleLineData.map((item, index) => ({
        itemStyle: {
          color: item.color || colorList[index],
        },
        ...item,
        smooth: item.type === "line",
        symbol: item.type === "line" ? "none" : undefined,
        areaStyle:
          item.type === "line"
            ? {
                opacity: 0.1,
              }
            : undefined,
      })),
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
      ],
    } as EChartsOption;
  }, [
    visibleDataPoints,
    xData,
    predictionData,
    lineData,
    tooltip,
    chartType,
    xAxis,
    yAxis,
  ]);

  // 处理图表平移效果
  useEffect(() => {
    if (!enableSlide || xData.length <= visibleDataPoints) return;

    // 清除之前的定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 设置新的定时器实现平移效果
    timerRef.current = setInterval(() => {
      if (chartInstanceRef.current) {
        // 更新起始索引，实现平移效果
        startIndexRef.current =
          (startIndexRef.current + 1) % (xData.length - visibleDataPoints + 1);

        // 计算新的可见数据范围
        const endIndex = Math.min(
          startIndexRef.current + visibleDataPoints,
          xData.length
        );
        const visibleXData = xData.slice(startIndexRef.current, endIndex);
        const visiblePredictionData = predictionData.slice(
          startIndexRef.current,
          endIndex
        );

        // 对每个线条做同样的截取处理
        const visibleLineData = lineData.map((line) => ({
          ...line,
          data: line.data.slice(startIndexRef.current, endIndex),
        }));

        // 更新图表数据，应用动画效果
        chartInstanceRef.current.setOption(
          {
            xAxis: {
              data: visibleXData,
              axisLabel: {
                formatter: (value: string, index: number) => {
                  return visiblePredictionData[index]
                    ? `${value}\n(预测)`
                    : value;
                },
              },
            },
            series: visibleLineData.map((item) => ({
              data: item.data,
            })),
          },
          {
            // 指定动画相关配置
            animation: true,
            animationDuration: Math.floor(slideInterval * 0.5),
            animationEasing: "linear",
          } as SetOptionOpts
        );
      }
    }, slideInterval);

    // 组件卸载时清除定时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    enableSlide,
    slideInterval,
    lineData,
    xData,
    predictionData,
    visibleDataPoints,
  ]);

  // 获取图表实例的回调函数
  const handleChartReady = (instance: ECharts) => {
    chartInstanceRef.current = instance;
  };

  return (
    <BaseChart
      option={option}
      style={{ width: "100%", height: "100%", ...style }}
      className={className}
      onChartReady={handleChartReady}
    />
  );
};

export default LineChart;
