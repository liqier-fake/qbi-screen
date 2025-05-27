import React, { useMemo, useEffect, useRef } from "react";
import BaseChart from "./BaseChart";
import type { EChartsOption, SetOptionOpts, ECharts } from "echarts";

// 折线数据类型定义
interface LineData {
  name: string;
  data: number[];
  color?: string;
  type?: string;
}

// 组件 Props 类型定义
interface LineChartProps {
  lineData: LineData[];
  xData: string[] | number[];
  className?: string;
  style?: React.CSSProperties;
  // 是否启用平移动画效果
  enableSlide?: boolean;
  // 平移速度（毫秒）
  slideInterval?: number;
  // 可视区域宽度（显示多少个数据点）
  visibleDataPoints?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  lineData = [],
  xData = [],
  className,
  style,
  enableSlide = false,
  slideInterval = 2000,
  visibleDataPoints = 10,
}) => {
  // 图表实例引用
  const chartInstanceRef = useRef<ECharts | null>(null);
  // 定时器引用
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // 当前视图起始索引
  const startIndexRef = useRef<number>(0);

  const option = useMemo(() => {
    const colorList = ["#00FFC3", "#7D00FF", "#00AEFF", "#FF3B3B", "#5FFF00"];

    // 计算当前视图的数据范围
    const endIndex = Math.min(
      startIndexRef.current + visibleDataPoints,
      xData.length
    );
    const visibleXData = xData.slice(startIndexRef.current, endIndex);

    // 对每个线条做同样的截取处理
    const visibleLineData = lineData.map((line) => ({
      ...line,
      data: line.data.slice(startIndexRef.current, endIndex),
    }));

    return {
      // backgroundColor: "#001529",
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
        axisPointer: {
          type: "cross",
        },
        textStyle: {
          fontSize: 10,
        },
      },
      xAxis: {
        type: "category" as const,
        data: visibleXData,
        boundaryGap: false,
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
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#304766",
            type: "dashed",
          },
        },
      },
      yAxis: {
        type: "value",
        // min: 0,
        // max: 500,
        // interval: 100,
        axisLabel: {
          color: "#fff",
        },
        axisLine: {
          lineStyle: {
            color: "#304766",
          },
        },
        splitLine: {
          lineStyle: {
            color: "#304766",
            type: "dashed",
          },
        },
      },
      series: visibleLineData.map((item, index) => ({
        name: item.name,
        type: "line",
        data: item.data,
        smooth: true,
        symbol: "none",
        lineStyle: {
          width: 2,
          type: item.type || "solid",
        },
        itemStyle: {
          color: item.color || colorList[index],
        },
        areaStyle: {
          opacity: 0.1,
        },
      })),
      // 添加 dataZoom 组件以支持区间滑动
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
      ],
    } as EChartsOption;
  }, [lineData, xData, visibleDataPoints, startIndexRef.current]);

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
  }, [enableSlide, slideInterval, lineData, xData, visibleDataPoints]);

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
