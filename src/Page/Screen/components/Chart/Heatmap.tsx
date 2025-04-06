import React from "react";
import BaseChart from "./BaseChart";
import { EChartsOption } from "echarts";

const Heatmap: React.FC = () => {
  // 数据配置
  const yData = [
    "京沪高速",
    "新市民劳动者",
    "新就业群体",
    "困境群体",
    "退役军人",
    "重点关注人群",
  ];
  const xData = [
    "公共服务",
    "行政执法",
    "创业服务",
    "出租房管理",
    "矛盾纠纷",
    "职业培训",
    "残疾人服务",
    "团购小服务",
    "特殊困难家庭服务",
    "基层治理",
  ];

  // 模拟数据
  const data = yData
    .map((y, yi) => {
      return xData.map((x, xi) => {
        console.log(y, x);
        return [xi, yi, Math.floor(Math.random() * 5000)];
      });
    })
    .flat();

  const option: EChartsOption = {
    // backgroundColor: "",
    tooltip: {
      position: "top",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xData,
      splitArea: {
        show: true,
      },
      axisLabel: {
        color: "#fff",
        interval: 0,
        rotate: 45,
      },
      axisLine: {
        lineStyle: {
          color: "#304766",
        },
      },
    },
    yAxis: {
      type: "category",
      data: yData,
      splitArea: {
        show: true,
      },
      axisLabel: {
        color: "#fff",
      },
      axisLine: {
        lineStyle: {
          color: "#304766",
        },
      },
    },
    visualMap: {
      min: 0,
      max: 5000,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "0%",
      textStyle: {
        color: "#fff",
      },
      inRange: {
        color: [
          "#313695",
          "#4575b4",
          "#74add1",
          "#abd9e9",
          "#fee090",
          "#fdae61",
          "#f46d43",
          "#d73027",
          "#a50026",
          "#a50026",
          "#a50026",
          "#a50026",
          "#a50026",
          "#a50026",
          "#a50026",
          "#a50026",
        ],
      },
    },
    series: [
      {
        name: "服务热力图",
        type: "heatmap",
        data: data,
        label: {
          show: true,
          color: "#fff",
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  return (
    <BaseChart
      option={option}
      style={{ height: "100%", width: "100%" }}
      className="heatmap-example"
    />
  );
};

export default Heatmap;
