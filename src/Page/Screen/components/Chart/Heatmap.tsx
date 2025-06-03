import React, { useState, useEffect, useRef } from "react";
import BaseChart from "./BaseChart";
import { EChartsOption, SetOptionOpts, ECharts } from "echarts";

// API返回的数据结构接口定义
interface CategoryItem {
  c3: string; // 服务类别
  count: number; // 数量
}

interface HeatmapDataItem {
  categories: CategoryItem[]; // 服务类别列表
  group: string; // 人群类别
  total: number; // 总数
}

// 组件Props类型定义
interface HeatmapProps {
  // 是否启用平移动画效果
  enableSlide?: boolean;
  // 平移速度（毫秒）
  slideInterval?: number;
  // 可视区域宽度（显示多少个数据点）
  visibleDataPoints?: number;
  // 组件样式
  style?: React.CSSProperties;
  // CSS类名
  className?: string;
  // API数据
  data?: HeatmapDataItem[];
  // 点击事件回调
  onItemClick?: (params: { c3: string; smqt: string; count: number }) => void;
}

interface EChartsGraphicItem {
  type: string;
  left?: string | number;
  top?: string | number;
  style?: {
    text?: string;
    textAlign?: string;
    fill?: string;
    fontSize?: number;
    backgroundColor?: string;
    padding?: number[];
    borderRadius?: number;
    [key: string]: unknown; // 修复any类型
  };
  [key: string]: unknown; // 修复any类型
}

const Heatmap: React.FC<HeatmapProps> = ({
  enableSlide = false,
  slideInterval = 2000,
  visibleDataPoints = 20,
  style = { height: "100%", width: "100%" },
  className = "heatmap-example",
  data = [],
  onItemClick,
}) => {
  // 图表实例引用
  const chartInstanceRef = useRef<ECharts | null>(null);
  // 定时器引用
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // 当前视图起始索引
  const startIndexRef = useRef<number>(0);
  // 数据缓存状态
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  // 上一次的数据集合
  const previousDataRef = useRef<number[][]>([]);
  // 存储所有服务类别(x轴)和人群类别(y轴)
  const [xData, setXData] = useState<string[]>([]);
  const [yData, setYData] = useState<string[]>([]);

  // 处理API数据转换为热力图数据
  useEffect(() => {
    if (data && data.length > 0) {
      // 收集所有唯一的服务类别(c3)
      const allCategories = new Set<string>();
      data.forEach((item) => {
        item.categories.forEach((category) => {
          allCategories.add(category.c3);
        });
      });

      // 收集所有唯一的人群类别(group)
      const allGroups = data.map((item) => item.group);

      // 更新x轴和y轴数据
      const newXData = Array.from(allCategories);
      const newYData = allGroups;

      setXData(newXData);
      setYData(newYData);

      // 转换为热力图所需的数据格式 [x坐标, y坐标, 值]
      const heatmapDataArray: number[][] = [];

      data.forEach((item, yIndex) => {
        item.categories.forEach((category) => {
          const xIndex = newXData.indexOf(category.c3);
          if (xIndex !== -1) {
            heatmapDataArray.push([xIndex, yIndex, category.count]);
          }
        });
      });

      setHeatmapData(heatmapDataArray);
      previousDataRef.current = heatmapDataArray;
    }

    // else {
    //   // 如果没有API数据，使用默认数据
    //   const defaultYData = [
    //     "新市民劳动者",
    //     "新就业群体",
    //     "困境群体",
    //     "退役军人",
    //     "重点关注人群",
    //   ];

    //   const defaultXData = [
    //     "公共服务",
    //     "行政执法",
    //     "创业服务",
    //     "出租房管理",
    //     "矛盾纠纷",
    //     "职业培训",
    //     "残疾人服务",
    //     "团购小服务",
    //     "特殊困难家庭服务",
    //     "基层治理",
    //     "社会保障",
    //     "劳动权益",
    //     "文化服务",
    //     "医疗保健",
    //     "教育辅导",
    //     "环境治理",
    //     "住房问题",
    //     "交通出行",
    //     "政策咨询",
    //     "民族宗教",
    //   ];

    //   setYData(defaultYData);
    //   setXData(defaultXData);

    //   // 生成模拟数据
    //   const mockData = defaultYData
    //     .map((_, yi) => {
    //       return defaultXData.map((_, xi) => {
    //         // 生成更有区分度的数据
    //         const baseValue = Math.floor(Math.random() * 3000);
    //         const bonus = Math.floor(Math.random() * 2000);
    //         // 为相邻的单元格创建明显的数值差异，使平移效果更明显
    //         const value = xi % 2 === 0 ? baseValue + bonus : baseValue;
    //         return [xi, yi, value];
    //       });
    //     })
    //     .flat();

    //   setHeatmapData(mockData);
    //   previousDataRef.current = mockData;
    // }
  }, [data]);

  // 获取当前视图对应的数据和x轴标签
  const getVisibleData = () => {
    const endIndex = Math.min(
      startIndexRef.current + visibleDataPoints,
      xData.length
    );
    const visibleXData = xData.slice(startIndexRef.current, endIndex);

    // 从总数据中筛选当前视图范围内的数据点
    const visibleData = heatmapData
      .filter((item) => {
        const xIndex = item[0];
        return xIndex >= startIndexRef.current && xIndex < endIndex;
      })
      .map((item) => {
        // 调整x坐标以适应当前视图
        return [item[0] - startIndexRef.current, item[1], item[2]];
      });

    return { visibleXData, visibleData };
  };

  // 定义图表配置
  const getOption = (): EChartsOption => {
    const { visibleXData, visibleData } = getVisibleData();

    // 不再需要箭头指示器
    const graphic: EChartsGraphicItem[] = [];

    // 计算最大值用于visualMap配置
    const maxValue = Math.max(...heatmapData.map((item) => item[2]), 1000);

    return {
      // backgroundColor: "rgba(11, 30, 58, 0.8)",
      backgroundColor: "transparent",
      tooltip: {
        position: "top",
        appendToBody: true,
        formatter: (params: unknown) => {
          // 安全地类型转换
          const typedParams = params as { name: string; data: number[] };
          const value = typedParams.data[2];
          return `${typedParams.name}<br/>
                  ${yData[typedParams.data[1]]}<br/>
                  数量: <b>${value}</b>`;
        },
        backgroundColor: "rgba(50, 50, 50, 0.9)",
        // backgroundColor: "transparent",
        borderColor: "#777",
        borderWidth: 1,
        padding: 10,
        textStyle: {
          color: "#fff",
          fontSize: 10,
        },
      },
      graphic: graphic,
      grid: {
        left: "0",
        right: "0",
        bottom: "0",
        top: "0",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: visibleXData,
        splitArea: {
          show: true,
        },
        axisLabel: {
          color: "#fff",
          interval: 0,
          rotate: 45,
          fontSize: 10,
          margin: 8,
          // fontWeight: "bold",
        },
        axisLine: {
          lineStyle: {
            color: "#304766",
            width: 2,
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: "#304766",
            width: 2,
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
          fontSize: 10,
          // fontWeight: "bold",
        },
        axisLine: {
          lineStyle: {
            color: "#304766",
            width: 2,
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: "#304766",
          },
        },
      },
      visualMap: {
        min: 0,
        max: maxValue,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "2%",
        show: false,
        textStyle: {
          color: "#fff",
          fontSize: 10,
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
          ],
        },
        textGap: 10,
      },
      series: [
        {
          name: "服务热力图",
          type: "heatmap",
          data: visibleData,
          label: {
            show: true,
            color: "#fff",
            formatter: (params: unknown) => {
              const typedParams = params as { data: number[] };
              return typedParams.data[2].toString();
            },
            // fontWeight: "bold",
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowColor: "rgba(255, 255, 255, 0.8)",
            },
            label: {
              color: "#ffcc00",
              // fontWeight: "bold",
              fontSize: 14,
            },
          },
          // 增加单元格之间的间隙，使平移效果更明显
          itemStyle: {
            borderWidth: 2,
            borderColor: "rgba(11, 30, 58, 0.9)",
          },
        },
      ],
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
      ],
    };
  };

  // 处理图表平移效果
  useEffect(() => {
    if (
      !enableSlide ||
      xData.length <= visibleDataPoints ||
      heatmapData.length === 0
    )
      return;

    // 清除之前的定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 设置新的定时器实现平移效果
    timerRef.current = setInterval(() => {
      if (chartInstanceRef.current) {
        // 保存当前数据以便比较
        previousDataRef.current = [...heatmapData];

        // 更新起始索引，实现平移效果
        startIndexRef.current =
          (startIndexRef.current + 1) % (xData.length - visibleDataPoints + 1);

        // 获取新的可见数据
        const { visibleXData, visibleData } = getVisibleData();

        // 更新图表数据，应用动画效果
        chartInstanceRef.current.setOption(
          {
            xAxis: {
              data: visibleXData,
            },
            series: [
              {
                data: visibleData,
              },
            ],
          },
          {
            // 指定动画相关配置
            animation: true,
            animationDuration: Math.floor(slideInterval * 0.6), // 调整动画时长
            animationEasing: "cubicInOut", // 使用更明显的缓动函数
            animationDelay: (idx: number) => {
              // 通过错开动画时间，增加连续感
              return idx * 30;
            },
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
    visibleDataPoints,
    heatmapData,
    xData.length,
  ]);

  // 获取图表实例的回调函数
  const handleChartReady = (instance: ECharts) => {
    chartInstanceRef.current = instance;

    // 添加点击事件监听
    if (onItemClick) {
      instance.on("click", (params: any) => {
        // 确保是点击的热力图数据点
        if (
          params.componentType === "series" &&
          params.seriesType === "heatmap"
        ) {
          const { data: clickedData } = params;

          // 获取点击位置对应的数据
          const adjustedXIndex = clickedData[0] + startIndexRef.current;
          const yIndex = clickedData[1];
          const count = clickedData[2];

          // 获取对应的c3和smqt值
          const c3 = xData[adjustedXIndex];
          const smqt = yData[yIndex];

          if (c3 && smqt && count > 0) {
            onItemClick({
              c3,
              smqt,
              count,
            });
          }
        }
      });
    }
  };

  return (
    <BaseChart
      option={getOption()}
      style={style}
      className={className}
      onChartReady={handleChartReady}
    />
  );
};

export default Heatmap;
