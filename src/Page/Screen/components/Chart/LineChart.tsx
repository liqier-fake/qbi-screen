import React, { useMemo } from "react";
import BaseChart from "./BaseChart";
import type { EChartsOption } from "echarts";

// 折线数据类型定义
interface LineData {
  name: string;
  data: number[];
  color?: string;
}

// 组件 Props 类型定义
interface LineChartProps {
  lineData: LineData[];
  xData: string[] | number[];
  className?: string;
  style?: React.CSSProperties;
}

const LineChart: React.FC<LineChartProps> = ({
  lineData = [],
  xData = [],
  className,
  style,
}) => {
  const option = useMemo(() => {
    const colorList = ["#00FFC3", "#7D00FF", "#00AEFF", "#FF3B3B", "#5FFF00"];

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
        },
        icon: "circle",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
      },
      xAxis: {
        type: "category" as const,
        data: xData,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: "#304766",
          },
        },
        axisLabel: {
          color: "#fff",
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
      series: lineData.map((item, i) => ({
        name: item.name,
        type: "line",
        data: item.data,
        smooth: true,
        symbol: "none",
        lineStyle: {
          width: 2,
        },
        itemStyle: {
          color: item.color || colorList[i],
        },
        areaStyle: {
          opacity: 0.1,
        },
      })),
    } as EChartsOption;
  }, [lineData, xData]);

  return (
    <BaseChart
      option={option}
      style={{ width: "100%", height: "100%", ...style }}
      className={className}
    />
  );
};

export default LineChart;
