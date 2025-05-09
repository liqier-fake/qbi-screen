// @ts-nocheck

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
// interface AreaData {
//   name: string;
//   value: number;
//   coordinate?: [number, number]; // 经纬度坐标
// }

// 工单数据接口
export interface TicketCountData {
  name: string;
  count: number;
}

// 街道名称到枚举的映射 - 导出给父组件使用
export const streetNameToEnum: Record<string, MapTypeEnum> = {
  金鸡湖街道: MapTypeEnum.jjhstreet,
  唯亭街道: MapTypeEnum.wtstreet,
  娄葑街道: MapTypeEnum.lfstreet,
  胜浦街道: MapTypeEnum.spstreet,
  斜塘街道: MapTypeEnum.xtstreet,
  苏州工业园区: MapTypeEnum.area,
};

// 定义Map组件的props接口
interface MapProps {
  currentMapType: MapTypeEnum; // 当前地图类型
  ticketData?: TicketCountData[]; // 工单数据
  onDrillDown?: (nextMapType: MapTypeEnum) => void; // 添加下钻回调函数
}

// 根据数据值大小返回不同的颜色
const getColorByValue = (value: number, maxValue: number): string => {
  // 设置不同的颜色等级，从低到高
  if (value <= 0) return "rgba(0,30,60,0.3)"; // 无数据或值为0

  // 计算相对值的百分比
  const ratio = value / maxValue;

  if (ratio < 0.2) return "rgba(0,102,204,0.5)"; // 非常低
  if (ratio < 0.4) return "rgba(0,153,255,0.6)"; // 低
  if (ratio < 0.6) return "rgba(0,204,255,0.7)"; // 中
  if (ratio < 0.8) return "rgba(0,255,255,0.8)"; // 高
  return "rgba(0,255,204,0.9)"; // 非常高
};

// 根据数据值获取散点图的颜色
const getScatterColorByValue = (value: number, maxValue: number): string => {
  // 计算相对值的百分比
  const ratio = value / maxValue;

  // 散点图使用红色系，透明度随值增加而增加
  if (ratio < 0.2) return "rgba(244,28,25,0.5)"; // 非常低
  if (ratio < 0.4) return "rgba(244,28,25,0.6)"; // 低
  if (ratio < 0.6) return "rgba(244,28,25,0.7)"; // 中
  if (ratio < 0.8) return "rgba(244,28,25,0.8)"; // 高
  return "rgba(244,28,25,0.9)"; // 非常高
};

// 根据社区名称获取坐标
const getCommunityCoordinates = (name: string): [number, number] => {
  // 从sip_comm数据中查找对应社区的中心点坐标
  try {
    // 优先查找社区地图数据
    const obj = geojsonMap["sip_comm"]?.find((f) => f?.street === name);

    if (obj) {
      return [obj.x, obj.y];
    }

    // 如果找不到社区数据，回退到默认点
    return [0, 0];
  } catch (error) {
    console.error(`获取社区 ${name} 的坐标失败:`, error);
    return [0, 0];
  }
};

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

  // 更新图表配置
  useEffect(() => {
    if (!mapLoaded) return;

    // 计算最大值用于颜色映射
    const maxValue = Math.max(...ticketData.map((item) => item.count), 1); // 至少为1，防止除0错误

    const seriesData = ticketData.map((item) => {
      return {
        name: item.name,
        value: item.count,
        // 非园区视图时，为不同区域设置不同的自定义样式
        itemStyle:
          currentMapType !== MapTypeEnum.area
            ? {
                areaColor: getColorByValue(item.count, maxValue),
              }
            : undefined,
      };
    });

    // 生成散点数据，使用社区地图数据
    const scatterData =
      currentMapType === MapTypeEnum.area
        ? ticketData
            .map((item) => {
              // 根据社区名称获取坐标
              const [centerX, centerY] = getCommunityCoordinates(item.name);

              // 如果找不到坐标，则跳过该点
              if (!centerX || !centerY) return null;

              return {
                name: item.name,
                value: [centerX, centerY, item.count], // [x, y, 值]
                // 根据数值大小设置自定义颜色
                itemStyle: {
                  color: getScatterColorByValue(item.count, maxValue),
                },
              };
            })
            .filter(Boolean) // 过滤掉无效数据
        : [];

    console.log(scatterData, "scatterData");

    try {
      const option: EChartsOption = {
        // 背景色
        backgroundColor: "transparent",
        tooltip: {
          trigger: "item",
          formatter: function (params: {
            name: string;
            value: number | Array<number>;
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
        series: [
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
              areaColor: "transparent",
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
            layoutCenter: ["50%", "50%"],
            layoutSize: "100%",
            data: seriesData,
          },
          // {
          //   name: "工单数量",
          //   type: "effectScatter",
          //   coordinateSystem: "geo",
          //   geoIndex: 0,
          //   data: scatterData,
          //   id: "mainMap",
          //   symbolSize: function (val) {
          //     return val[2] / 3;
          //   },
          //   showEffectOn: "render",
          //   rippleEffect: {
          //     brushType: "stroke",
          //   },
          //   hoverAnimation: true,
          //   label: {
          //     normal: {
          //       formatter: "{b}",
          //       position: "right",
          //       show: true,
          //     },
          //   },
          //   itemStyle: {
          //     normal: {
          //       color: "rgba(0,254,233,0.3)",
          //       shadowBlur: 10,
          //       shadowColor: "#333",
          //     },
          //   },
          //   zlevel: 1,
          //   data: scatterData,
          // },
          currentMapType === MapTypeEnum.area && {
            geoIndex: 0,
            type: "effectScatter",
            coordinateSystem: "geo",
            zlevel: 0,
            rippleEffect: {
              //涟漪特效
              period: 4, //动画时间，值越小速度越快
              brushType: "fill", //波纹绘制方式 stroke, fill
              scale: 5, //波纹圆环最大限制，值越大波纹越大
            },
            symbol: "circle",
            // symbolSize: function (val) {
            //   return (5 + val[2] * 5) / 150; //圆环大小
            // },

            symbolSize: (val) => Math.sqrt(val[2]) * 2,
            // label: {
            //   show: true,
            //   formatter: (params) => `${params.name}\n${params.value[2]}`,
            // },

            // itemStyle: {
            //   normal: {
            //     show: true,
            //     color: "#F41C19",
            //   },
            // },
            data: scatterData,
          },
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
