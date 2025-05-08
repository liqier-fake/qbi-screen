import React, { useEffect, useState, useRef } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import BaseChart, { BaseChartRef } from "./BaseChart";
import { geojsonMap } from "./geojson";

// 导出枚举以便父组件使用
export enum MapTypeEnum {
  area = "area", // 园区
  jjhstreet = "jjhstreet", // 金鸡湖街道
  wtstreet = "wtstreet", // 唯亭街道
  lfstreet = "lfstreet", // 娄葑街道
  spstreet = "spstreet", // 胜浦街道
  xtstreet = "xtstreet", // 斜塘街道
}

// 定义地图层级路径
interface MapBreadcrumb {
  type: MapTypeEnum;
  name: string;
}

// 导出常量，让父组件可以使用地图类型名称
export const MapTypeNames: Record<MapTypeEnum, string> = {
  [MapTypeEnum.area]: "苏州工业园区",
  [MapTypeEnum.jjhstreet]: "金鸡湖街道",
  [MapTypeEnum.wtstreet]: "唯亭街道",
  [MapTypeEnum.lfstreet]: "娄葑街道",
  [MapTypeEnum.spstreet]: "胜浦街道",
  [MapTypeEnum.xtstreet]: "斜塘街道",
};

// 区域数据，包含名称、值和坐标
interface AreaData {
  name: string;
  value: number;
  coordinate?: [number, number]; // 经纬度坐标
}

// 工单数据接口
export interface TicketCountData {
  name: string;
  count: number;
}

// 模拟数据，为每个区域添加坐标
const mockData: Record<MapTypeEnum, AreaData[]> = {
  [MapTypeEnum.area]: [
    { name: "金鸡湖街道", value: 820, coordinate: [120.7559, 31.3215] },
    { name: "唯亭街道", value: 730, coordinate: [120.6982, 31.3401] },
    { name: "娄葑街道", value: 650, coordinate: [120.7158, 31.2979] },
    { name: "胜浦街道", value: 580, coordinate: [120.7881, 31.3692] },
    { name: "斜塘街道", value: 750, coordinate: [120.7233, 31.3478] },
  ],
  [MapTypeEnum.jjhstreet]: [
    { name: "金鸡湖社区1", value: 300, coordinate: [120.7559, 31.3215] },
    { name: "金鸡湖社区2", value: 220, coordinate: [120.76, 31.325] },
    { name: "金鸡湖社区3", value: 180, coordinate: [120.752, 31.318] },
  ],
  [MapTypeEnum.wtstreet]: [
    { name: "唯亭社区1", value: 250, coordinate: [120.6982, 31.3401] },
    { name: "唯亭社区2", value: 210, coordinate: [120.7, 31.345] },
    { name: "唯亭社区3", value: 190, coordinate: [120.695, 31.338] },
  ],
  [MapTypeEnum.lfstreet]: [
    { name: "娄葑社区1", value: 280, coordinate: [120.7158, 31.2979] },
    { name: "娄葑社区2", value: 230, coordinate: [120.72, 31.3] },
    { name: "娄葑社区3", value: 170, coordinate: [120.71, 31.295] },
  ],
  [MapTypeEnum.spstreet]: [
    { name: "胜浦社区1", value: 260, coordinate: [120.7881, 31.3692] },
    { name: "胜浦社区2", value: 220, coordinate: [120.79, 31.372] },
    { name: "胜浦社区3", value: 180, coordinate: [120.785, 31.365] },
  ],
  [MapTypeEnum.xtstreet]: [
    { name: "斜塘社区1", value: 290, coordinate: [120.7233, 31.3478] },
    { name: "斜塘社区2", value: 240, coordinate: [120.725, 31.35] },
    { name: "斜塘社区3", value: 190, coordinate: [120.72, 31.345] },
  ],
};

// 街道名称到枚举的映射 - 导出给父组件使用
export const streetNameToEnum: Record<string, MapTypeEnum> = {
  金鸡湖街道: MapTypeEnum.jjhstreet,
  唯亭街道: MapTypeEnum.wtstreet,
  娄葑街道: MapTypeEnum.lfstreet,
  胜浦街道: MapTypeEnum.spstreet,
  斜塘街道: MapTypeEnum.xtstreet,
};

// 定义Map组件的props接口
interface MapProps {
  currentMapType: MapTypeEnum; // 当前地图类型
  ticketData?: TicketCountData[]; // 工单数据
  onDrillDown?: (nextMapType: MapTypeEnum) => void; // 添加下钻回调函数
}

const Map: React.FC<MapProps> = ({
  currentMapType,
  ticketData = [],
  onDrillDown,
}) => {
  const chartRef = useRef<BaseChartRef>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [chartOption, setChartOption] = useState<EChartsOption>({});
  const [, setBreadcrumbs] = useState<MapBreadcrumb[]>([
    { type: MapTypeEnum.area, name: MapTypeNames[MapTypeEnum.area] },
  ]);

  // 注册地图数据
  useEffect(() => {
    try {
      Object.entries(geojsonMap).forEach(([key, json]) => {
        // 使用正确的类型断言
        // @ts-expect-error json类型可能不匹配echarts.registerMap的参数类型
        echarts.registerMap(key, json);
      });
      setMapLoaded(true);
    } catch (error) {
      console.log("地图注册失败:", error);
    }
  }, []);

  // 根据工单数量获取颜色
  const getColorByCount = (name: string): echarts.LinearGradientObject => {
    console.log(ticketData, name, "ticketData,name");

    // 查找对应名称的工单数据
    const ticketItem = ticketData.find((item) => item.name === name);

    if (!ticketItem) {
      // 没有找到对应工单数据，使用默认颜色
      return {
        type: "linear",
        x: 1200,
        y: 0,
        x2: 0,
        y2: 0,
        colorStops: [
          {
            offset: 0,
            color: "rgba(3,27,78,0.75)", // 默认起始颜色
          },
          {
            offset: 1,
            color: "rgba(58,149,253,0.75)", // 默认结束颜色
          },
        ],
        global: true,
      };
    }

    // 根据工单数量级别设置不同的颜色
    if (ticketItem.count > 10) {
      // 高工单数量 - 红色系
      return {
        type: "linear",
        x: 1200,
        y: 0,
        x2: 0,
        y2: 0,
        colorStops: [
          {
            offset: 0,
            color: "rgba(255,0,0,0.75)", // 高数量红色
          },
          {
            offset: 1,
            color: "rgba(255,80,80,0.75)",
          },
        ],
        global: true,
      };
    } else if (ticketItem.count > 5) {
      // 中等工单数量 - 橙色系
      return {
        type: "linear",
        x: 1200,
        y: 0,
        x2: 0,
        y2: 0,
        colorStops: [
          {
            offset: 0,
            color: "rgba(255,165,0,0.75)", // 中数量橙色
          },
          {
            offset: 1,
            color: "rgba(255,200,0,0.75)",
          },
        ],
        global: true,
      };
    } else {
      // 低工单数量 - 绿色系
      return {
        type: "linear",
        x: 1200,
        y: 0,
        x2: 0,
        y2: 0,
        colorStops: [
          {
            offset: 0,
            color: "rgba(0,128,0,0.75)", // 低数量绿色
          },
          {
            offset: 1,
            color: "rgba(144,238,144,0.75)",
          },
        ],
        global: true,
      };
    }
  };

  // 更新图表配置
  useEffect(() => {
    if (!mapLoaded) return;

    try {
      // 获取当前区域的数据点坐标
      const currentAreaData = mockData[currentMapType];

      // 构建地图配置
      // @ts-ignore 忽略类型错误，ECharts可以接受函数返回颜色类型，但TypeScript定义可能不完整
      const option: EChartsOption = {
        // 背景色
        backgroundColor: "transparent",

        // 添加工具提示配置
        // @ts-ignore
        tooltip: {
          trigger: "item",
          formatter: function (params: {
            name: string;
            value: number | Array<any>;
          }) {
            // 对于散点图，value是数组，对于地图，value是数字
            let value = params.value;
            if (Array.isArray(value)) {
              value = value[2]; // 从坐标数组中提取值 [lng, lat, value]
            }

            // 确保显示数字而不是NaN
            const displayValue = isNaN(Number(value)) ? 0 : value;
            return `${params.name}: ${displayValue}条工单`;
          },
          backgroundColor: "rgba(0,30,60,0.85)",
          borderColor: "#0095ff",
          borderWidth: 1,
          textStyle: {
            color: "#fff",
            fontSize: 13,
          },
          extraCssText: "box-shadow: 0 0 15px rgba(0,149,255,0.5);",
        },

        // 地图配置（多层叠加，创造立体效果）
        geo: [
          // 主地图层
          {
            map: currentMapType,
            aspectScale: 1,
            zoom: 1.0,
            layoutCenter: ["50%", "50%"],
            layoutSize: "100%",
            show: true,
            label: {
              show: false,
            },
            itemStyle: {
              borderColor: "#c0f3fb",
              borderWidth: 1,
              shadowColor: "#8cd3ef",
              shadowOffsetY: 10,
              shadowBlur: 120,
              areaColor: "transparent",
            },
            emphasis: {
              label: {
                show: true,
                color: "#fff",
                fontSize: 14,
                fontWeight: "bold",
              },
              itemStyle: {
                areaColor: "rgba(0,202,255,0.8)", // 高亮时的区域颜色
                borderColor: "#fff",
                borderWidth: 1.5,
                shadowColor: "rgba(0,202,255,0.8)",
                shadowBlur: 25,
              },
            },
          },
          // 重影1 - 注意保持roam一致性
          {
            map: currentMapType,
            zlevel: -1,
            aspectScale: 1,
            zoom: 1.0,
            layoutCenter: ["50%", "51%"],
            layoutSize: "100%",
            silent: true,
            itemStyle: {
              borderWidth: 1,
              borderColor: "rgba(58,149,253,0.8)",
              shadowColor: "rgba(172, 122, 255,0.5)",
              shadowOffsetY: 5,
              shadowBlur: 15,
              areaColor: "rgba(5,21,35,0.1)",
            },
          },
          // 重影2 - 注意保持roam一致性
          {
            map: currentMapType,
            zlevel: -2,
            aspectScale: 1,
            zoom: 1.0,
            layoutCenter: ["50%", "52%"],
            layoutSize: "100%",
            silent: true,
            itemStyle: {
              borderWidth: 1,
              borderColor: "rgba(58,149,253,0.6)",
              shadowColor: "rgba(65, 214, 255,0.6)",
              shadowOffsetY: 5,
              shadowBlur: 15,
              areaColor: "rgba(5,21,35,0.1)",
            },
          },
          // 重影3 - 注意保持roam一致性
          // {
          //   map: currentMapType,
          //   zlevel: -3,
          //   aspectScale: 1,
          //   zoom: 1.0,
          //   layoutCenter: ["50%", "53%"],
          //   layoutSize: "100%",
          //   silent: true,
          //   itemStyle: {
          //     borderWidth: 1,
          //     borderColor: "rgba(58,149,253,0.4)",
          //     shadowColor: "rgba(29, 111, 165,1)",
          //     shadowOffsetY: 15,
          //     shadowBlur: 10,
          //     areaColor: "rgba(5,21,35,0.1)",
          //   },
          // },
          // 重影4（最底层） - 注意保持roam一致性
          {
            map: currentMapType,
            zlevel: -3,
            aspectScale: 1,
            zoom: 1.0,
            layoutCenter: ["50%", "53%"],
            layoutSize: "100%",
            silent: true,
            itemStyle: {
              borderWidth: 5,
              borderColor: "rgba(5,9,57,0.8)",
              shadowColor: "rgba(29, 111, 165,0.8)",
              shadowOffsetY: 15,
              shadowBlur: 10,
              areaColor: "rgba(5,21,35,0.1)",
            },
          },
        ],

        // 地图数据系列
        // @ts-ignore
        series: [
          // 地图数据层 - 根据工单数量显示不同颜色
          {
            name: "区域数据",
            type: "map",
            map: currentMapType,
            aspectScale: 1,
            zoom: 1.0,
            showLegendSymbol: true,
            label: {
              show: true,
              fontSize: "120%",
              color: "#fff",
            },
            itemStyle: {
              //@ts-ignore
              areaColor: function (params: { name: string }) {
                // 根据区域名称获取颜色
                return getColorByCount(params.name);
              },
              borderColor: "#fff",
              borderWidth: 0.2,
            },
            emphasis: {
              label: {
                show: true,
                color: "#fff", // 高亮时标签颜色
                fontSize: 15,
                fontWeight: "bold",
              },
              itemStyle: {
                areaColor: "rgba(0,254,233,0.3)", // 调整高亮颜色，更加柔和
                shadowColor: "rgba(0,254,233,0.3)",
                shadowBlur: 10,
                borderWidth: 1,
                borderColor: "#fff",
              },
            },
            select: {
              label: {
                show: true,
                color: "#fff",
              },
              itemStyle: {
                // 确保选中状态的样式与普通状态一致
                areaColor: function (params: { name: string }) {
                  return getColorByCount(params.name);
                },
                borderColor: "#fff",
                borderWidth: 0.2,
              },
            },
            layoutCenter: ["50%", "50%"],
            layoutSize: "100%",
            // 结合工单数据，优先使用工单数量作为值
            data: currentAreaData.map((item) => {
              // 查找对应的工单数据
              const ticketItem = ticketData.find((t) => t.name === item.name);

              // 如果有工单数据，使用工单数量作为值
              if (ticketItem) {
                return {
                  ...item,
                  value: Number(ticketItem.count) || 0, // 确保是数字，避免NaN
                };
              }

              return item;
            }),
          },

          // 散点动效 - 在地图上显示数据点标记
          // {
          //   type: "effectScatter",
          //   coordinateSystem: "geo",
          //   silent: false, // 启用鼠标交互
          //   rippleEffect: {
          //     period: 4, // 动画时间，值越小速度越快
          //     scale: 5, // 波纹圆环最大限制，值越大波纹越大
          //     brushType: "stroke", // 波纹绘制方式
          //   },
          //   label: {
          //     show: true,
          //     position: "right", // 显示位置
          //     offset: [5, 0], // 偏移设置
          //     formatter: function (
          //       params: echarts.DefaultLabelFormatterCallbackParams
          //     ) {
          //       // 圆环显示文字
          //       let value =
          //         params.value instanceof Array
          //           ? params.value[2]
          //           : params.value;
          //       // 确保值是数字，避免NaN
          //       value = isNaN(Number(value)) ? 0 : value;
          //       return `${params.name}: ${value}条`;
          //     },
          //     fontSize: 13,
          //     color: "white",
          //   },
          //   emphasis: {
          //     label: {
          //       show: true,
          //     },
          //   },
          //   symbol: "circle",
          //   symbolSize: 10,
          //   itemStyle: {
          //     borderWidth: 1,
          //     color: "rgba(255, 86, 11, 1)",
          //   },
          //   // 使用坐标和值构建数据，优先使用工单数量
          //   data: currentAreaData
          //     .filter((item) => item.coordinate) // 确保有坐标
          //     .map((item) => {
          //       // 查找对应的工单数据
          //       const ticketItem = ticketData.find((t) => t.name === item.name);
          //       const value = ticketItem
          //         ? Number(ticketItem.count) || 0
          //         : item.value;

          //       return {
          //         name: item.name,
          //         value: [...(item.coordinate || [0, 0]), value],
          //       };
          //     }),
          // },
        ],
      };

      setChartOption(option);
    } catch (err) {
      console.error("更新地图配置失败:", err);
    }
  }, [currentMapType, mapLoaded, ticketData]);

  // 地图下钻处理函数 - 点击园区地图时下钻到街道级别
  const handleDrillDown = (params: echarts.ECElementEvent) => {
    if (currentMapType === MapTypeEnum.area && streetNameToEnum[params.name]) {
      const nextMapType = streetNameToEnum[params.name];

      // 更新面包屑
      setBreadcrumbs((prev) => [
        ...prev,
        { type: nextMapType, name: MapTypeNames[nextMapType] },
      ]);

      // 调用父组件的下钻回调
      onDrillDown?.(nextMapType);
    }
  };

  // 图表实例准备完成的回调
  const handleChartReady = (instance: echarts.ECharts) => {
    instance.on("click", handleDrillDown);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* 地图组件 */}
      {mapLoaded ? (
        <BaseChart
          ref={chartRef}
          option={chartOption}
          style={{ height: "100vh", width: "100vw" }}
          loading={!mapLoaded}
          onChartReady={handleChartReady}
        />
      ) : (
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#030528",
            fontSize: "16px",
            color: "#fff",
          }}
        >
          地图加载中...
        </div>
      )}
    </div>
  );
};

export default Map;
