// @ts-nocheck
import React, { useEffect, useState, useRef, useMemo } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import BaseChart, { BaseChartRef } from "./BaseChart";
import { geojsonMap } from "./geojson";
import station from "./geojson/station";
import { flatten } from "lodash";
import icon from "./icon.svg";
import styles from "./map.module.less";
import ReactDOM from "react-dom"; // 导入ReactDOM用于创建Portal
import { ArrowRightOutlined } from "@ant-design/icons";

// 导出枚举以便父组件使用
export enum MapTypeEnum {
  area = "area", // 园区
  jjhstreet = "jjhstreet", // 金鸡湖街道
  wtstreet = "wtstreet", // 唯亭街道
  lfstreet = "lfstreet", // 娄葑街道
  spstreet = "spstreet", // 胜浦街道
  xtstreet = "xtstreet", // 斜塘街道
}

export enum MapSelectTypeEnum {
  "site" = "site",
  "number" = "number",
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

// 定义驿站信息接口
interface StationInfo {
  name: string;
  position: [number, number];
  // 可以添加更多驿站相关信息字段
  address?: string;
  contact?: string;
  services?: string[];
  siteName?: string; // 添加siteName字段
  district?: string; // 添加区域字段
}

// 定义聚合点接口
interface ClusterInfo {
  position: [number, number];
  count: number;
  stations: StationInfo[];
}

// 定义Map组件的props接口
interface MapProps {
  currentMapType: MapTypeEnum; // 当前地图类型
  ticketData?: TicketCountData[][]; // 工单数据
  onDrillDown?: (nextMapType: MapTypeEnum) => void; // 添加下钻回调函数
  selectKey?: MapSelectTypeEnum;
  onAskQuestion?: (question: string) => void; // 添加提问回调函数
}

/**
 * 经纬度转换为自定义坐标系函数
 * 基于三个已知点的对应关系计算转换参数
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @returns {[number, number]} - 返回转换后的[x, y]坐标
 */
const convertLngLatToCoordinates = (
  lng: number,
  lat: number
): [number, number] => {
  // 已知的三个参考点 - 经纬度和对应的坐标系坐标
  const referencePoints = [
    {
      lng: 120.754171,
      lat: 31.328124, // 海悦社区经纬度
      x: 66170.3954,
      y: 46101.189, // 海悦社区坐标系坐标
    },
    {
      lng: 120.716164,
      lat: 31.335602, // 新未来社区经纬度
      x: 62108.0323,
      y: 47115.5392, // 新未来社区坐标系坐标
    },
    {
      lng: 120.85971,
      lat: 31.464399, // 阳澄湖社区经纬度
      x: 69255.0191,
      y: 54557.6382, // 阳澄湖社区坐标系坐标
    },
  ];

  // 使用第一个点作为参考原点
  const origin = referencePoints[0];

  // 计算经纬度变化和坐标系变化的比例
  // 使用两个其他点的平均值来获得更准确的转换系数
  const xFactor1 =
    (referencePoints[1].x - origin.x) / (referencePoints[1].lng - origin.lng);
  const xFactor2 =
    (referencePoints[2].x - origin.x) / (referencePoints[2].lng - origin.lng);
  const yFactor1 =
    (referencePoints[1].y - origin.y) / (referencePoints[1].lat - origin.lat);
  const yFactor2 =
    (referencePoints[2].y - origin.y) / (referencePoints[2].lat - origin.lat);

  // 取平均值减少误差
  const xFactor = (xFactor1 + xFactor2) / 2;
  const yFactor = (yFactor1 + yFactor2) / 2;

  // 应用线性变换
  const x = origin.x + (lng - origin.lng) * xFactor;
  const y = origin.y + (lat - origin.lat) * yFactor;

  return [x, y];
};

// 超过5个字符的社区名称进行截断
const truncateCommunityName = (name: string): string => {
  if (name.length <= 5) return name;
  return name.slice(0, 5) + "...";
};

/**
 * 对驿站点进行聚合的函数
 * @param stations 驿站点数据数组
 * @param distance 聚合距离阈值
 * @returns 聚合后的数据
 */
function processStationClusters(
  stations: StationInfo[],
  distance: number
): (StationInfo | ClusterInfo)[] {
  if (!stations || stations.length === 0) return [];

  // 深拷贝站点数据，避免修改原始数据
  const points = [...stations];
  const clusters: (StationInfo | ClusterInfo)[] = [];

  // 按区域分组，相同区域的驿站更容易形成聚合
  const stationsByDistrict: Record<string, StationInfo[]> = {};

  points.forEach((station) => {
    const district = station.district || "未知区域";
    if (!stationsByDistrict[district]) {
      stationsByDistrict[district] = [];
    }
    stationsByDistrict[district].push(station);
  });

  // 对每个区域内的站点进行聚合
  Object.values(stationsByDistrict).forEach((districtStations) => {
    // 如果区域内站点数量少，直接添加
    if (districtStations.length <= 3) {
      clusters.push(...districtStations);
      return;
    }

    // 标记已处理的站点
    const processed = new Set<number>();

    // 对每个未处理的站点寻找邻近点
    for (let i = 0; i < districtStations.length; i++) {
      if (processed.has(i)) continue;

      const current = districtStations[i];
      const neighbors: StationInfo[] = [current];
      processed.add(i);

      // 查找距离当前点小于阈值的所有点
      for (let j = 0; j < districtStations.length; j++) {
        if (i === j || processed.has(j)) continue;

        const other = districtStations[j];
        const [x1, y1] = current.position;
        const [x2, y2] = other.position;

        // 计算欧几里得距离
        const dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

        if (dist < distance) {
          neighbors.push(other);
          processed.add(j);
        }
      }

      // 如果找到多个邻近点，创建聚合点
      if (neighbors.length > 1) {
        // 计算聚合点的中心位置
        const sumX = neighbors.reduce((sum, p) => sum + p.position[0], 0);
        const sumY = neighbors.reduce((sum, p) => sum + p.position[1], 0);

        const cluster: ClusterInfo = {
          position: [sumX / neighbors.length, sumY / neighbors.length],
          count: neighbors.length,
          stations: neighbors,
        };

        clusters.push(cluster);
      } else {
        // 单个点直接添加
        clusters.push(current);
      }
    }
  });

  return clusters;
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
  if (ratio < 0.2) return "rgba(0,255,204, 0.5)"; // 非常低
  if (ratio < 0.4) return "rgba(0,255,204, 0.6)"; // 低
  if (ratio < 0.6) return "rgba(0,255,204, 0.7)"; // 中
  if (ratio < 0.8) return "rgba(0,255,204, 0.8)"; // 高
  return "rgba(0,255,204, 1)"; // 非常高
};

// 根据社区名称获取坐标
const getCommunityCoordinates = (name: string): [number, number] => {
  // 从sip_comm数据中查找对应社区的中心点坐标
  try {
    // 优先查找社区地图数据
    const obj = geojsonMap["sip_comm"]?.find((f) => f?.Community === name);

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
  selectKey,
  onAskQuestion,
}) => {
  const chartRef = useRef<BaseChartRef>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [chartOption, setChartOption] = useState<EChartsOption>({});
  const [, setBreadcrumbs] = useState<MapBreadcrumb[]>([
    { type: MapTypeEnum.area, name: MapTypeNames[MapTypeEnum.area] },
  ]);

  // 添加驿站弹窗相关状态
  const [showStationPopup, setShowStationPopup] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<StationInfo | null>(
    null
  );
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // 添加弹出多个驿站选择的状态
  const [showClusterPopup, setShowClusterPopup] = useState<boolean>(false);
  const [clusterStations, setClusterStations] = useState<StationInfo[]>([]);

  // 将驿站数据的经纬度转换为坐标系坐标
  const transformedStationList = useMemo(() => {
    return station
      .map((item) => {
        // 过滤掉没有经纬度数据的驿站
        if (!item.x || !item.y) return null;

        // 转换经纬度到坐标系
        const [x, y] = convertLngLatToCoordinates(item.x, item.y);

        return {
          ...item,
          position: [x, y] as [number, number],
          name: truncateCommunityName(item.siteName),
        };
      })
      .filter(Boolean); // 过滤掉null值
  }, []);

  // 根据当前地图类型和转换后的驿站数据计算聚合点
  const clusteredStations = useMemo(() => {
    // 对驿站点进行聚合处理，不同地图类型使用不同的聚合距离
    // 进一步扩大聚合范围，解决驿站重叠问题
    const clusterDistance = currentMapType === MapTypeEnum.area ? 4000 : 2000;
    return processStationClusters(transformedStationList, clusterDistance);
  }, [currentMapType, transformedStationList]);

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

  // 关闭弹窗
  const handleClosePopup = () => {
    setShowStationPopup(false);
    setShowClusterPopup(false);
  };

  // 处理选择聚合点中的某个驿站
  const handleSelectStationFromCluster = (station: StationInfo) => {
    setSelectedStation(station);
    setShowClusterPopup(false);
    setShowStationPopup(true);
  };

  // 更新图表配置
  useEffect(() => {
    const seriesItemAreaColor = {
      type: "linear",
      x: 0,
      y: 0,
      x2: 1,
      y2: 0,
      colorStops: [
        {
          offset: 0,
          color: "rgba(3,27,78,0.75)", // 0% 处的颜色
        },
        {
          offset: 1,
          color: "rgba(58,149,253,0.75)", // 80% 处的颜色
        },
      ],
      global: true, // 全局坐标系
    };

    if (!mapLoaded) return;

    const curentIndex = Object.keys(MapTypeNames).findIndex(
      (item) => item === currentMapType
    );

    const currentTicketData = ticketData?.[curentIndex] || [];

    // 计算最大值用于颜色映射
    const maxValue = Math.max(
      ...currentTicketData.map((item) => item.count),
      1
    ); // 至少为1，防止除0错误

    const seriesData = currentTicketData?.map((item) => {
      return {
        name: item.name,
        value: item.count,
        // 非园区视图时，为不同区域设置不同的自定义样式
        itemStyle:
          currentMapType !== MapTypeEnum.area
            ? {
                areaColor: getColorByValue(item.count, maxValue),
              }
            : {
                areaColor: seriesItemAreaColor,
              },
      };
    });

    // 生成散点数据，使用社区地图数据
    const scatterData =
      currentMapType === MapTypeEnum.area
        ? flatten(ticketData)
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

    try {
      const option: EChartsOption = {
        // backgroundColor: "#030528",
        backgroundColor: "transparent",
        tooltip: {
          trigger: "item",
          formatter: function (params: {
            name: string;
            value: number | Array<number>;
            componentSubType?: string;
            data?: any;
          }) {
            // 对于聚合点，显示特殊的提示
            if (
              params.componentSubType === "scatter" &&
              params.data?.isCluster
            ) {
              return `<div style="font-size: 12px;color: #fff;">该区域有${params.data.count}个驿站</div><div style="font-size: 12px;color: #fff;">点击查看详情</div>`;
            }

            // 对于散点图，value是数组，对于地图，value是数字
            let value = params.value;
            if (Array.isArray(value)) {
              value = value[2]; // 从坐标数组中提取值 [lng, lat, value]
            }

            // 确保显示数字而不是NaN
            const displayValue = isNaN(Number(value)) ? 0 : value;
            return `${params.name}: ${displayValue}条工单`;
          },
          fontSize: 12,
          backgroundColor: "rgba(0,30,60,0.85)",
          borderColor: "#0095ff",
          borderWidth: 1,
          textStyle: {
            color: "#fff",
            fontSize: 12,
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
            layoutSize: "80%",
            show: true,
            label: {
              show: false,
              emphasis: {
                show: false,
              },
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
                show: false,
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
            layoutSize: "80%",
            silent: true,
            roam: false,
            itemStyle: {
              borderWidth: 1,
              // borderColor:"rgba(17, 149, 216,0.6)",
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
            layoutSize: "80%",
            silent: true,
            roam: false,
            itemStyle: {
              borderWidth: 1,
              // borderColor: "rgba(57, 132, 188,0.4)",
              borderColor: "rgba(58,149,253,0.6)",
              shadowColor: "rgba(65, 214, 255,1)",
              shadowOffsetY: 5,
              shadowBlur: 15,
              areaColor: "transpercent",
            },
          },
          // 重影3 - 注意保持roam一致性
          {
            map: currentMapType,
            zlevel: -3,
            aspectScale: 1,
            zoom: 1.0,
            layoutCenter: ["50%", "53%"],
            layoutSize: "80%",
            silent: true,
            roam: false,
            itemStyle: {
              borderWidth: 1,
              borderColor: "rgba(58,149,253,0.4)",
              shadowColor: "rgba(58,149,253,1)",
              shadowOffsetY: 15,
              shadowBlur: 10,
              areaColor: "transpercent",
            },
          },
          // 重影4（最底层） - 注意保持roam一致性
          {
            map: currentMapType,
            zlevel: -3,
            aspectScale: 1,
            zoom: 1.0,
            layoutCenter: ["50%", "53%"],
            layoutSize: "80%",
            silent: true,
            roam: false,
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
              show: false,
              textStyle: { color: "#fff", fontSize: "120%" },
              emphasis: {
                show: false,
              },
            },
            itemStyle: {
              areaColor: seriesItemAreaColor,
              borderColor: "#fff",
              borderWidth: 0.2,
            },
            emphasis: {
              label: {
                show: false,
              },
              itemStyle: {
                show: false,
                borderColor: "#fff",
                areaColor: "rgba(0,254,233,0.6)",
              },
            },
            select: {
              disabled: true,
            },
            layoutCenter: ["50%", "50%"],
            layoutSize: "80%",
            data: seriesData,
          },
          currentMapType === MapTypeEnum.area &&
            selectKey === MapSelectTypeEnum.number && {
              geoIndex: 0,
              type: "effectScatter",
              coordinateSystem: "geo",
              zlevel: 1,
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
              tooltip: {
                show: true,
                formatter: (params) => {
                  return `${params.name}: ${params.value[2]}条`;
                },
              },
              data: scatterData,
            },
          // 普通驿站点
          selectKey === MapSelectTypeEnum.site && {
            name: "驿站",
            type: "scatter",
            coordinateSystem: "geo",
            geoIndex: 0,
            zlevel: 2,
            symbol: `image://${icon}`,
            symbolSize: [87, 20], // 使用固定数组值而不是函数
            animation: false, // 禁用动画，防止闪烁
            // 为驿站添加特殊的点击事件类型标记
            seriesId: "station", // 添加唯一标识符，用于区分点击事件
            // 添加emphasis配置，修改hover效果
            emphasis: {
              disabled: false,
              scale: 1, // 不放大
              itemStyle: {
                opacity: 1, // 保持原有透明度
              },
            },
            label: {
              show: true,
              formatter: (params) => {
                return params.name;
              },
              position: "inside", // 确保文字在图标内部
              color: "#fff",
              backgroundColor: "rgba(0,0,0,0)", // 透明背景
              fontSize: 9, // 减小字体，确保能放在图标内
              // align: "center",
              padding: [0, 0, 0, 5],
              verticalAlign: "middle", // 确保垂直居中
              textShadowColor: "#000", // 保留文字阴影增强可读性
              textShadowBlur: 2,
              textShadowOffsetX: 0,
              textShadowOffsetY: 0,
            },
            tooltip: {
              show: false,
              trigger: "item",
              formatter: (params) => {
                return `${params.name}：驿站`;
              },
            },

            // 处理单个驿站点数据
            data: clusteredStations
              .filter(
                (item): item is StationInfo => !("count" in item) // 过滤出单个驿站点
              )
              .map((station) => ({
                name: station.name,
                value: [...station.position, 1],
                stationInfo: station,
              })),
          },
          // 聚合驿站点
          selectKey === MapSelectTypeEnum.site && {
            name: "驿站聚合",
            type: "scatter",
            coordinateSystem: "geo",
            geoIndex: 0,
            zlevel: 3,
            symbol: "circle",
            symbolSize: (val, params) => {
              // 根据聚合的驿站数量动态调整大小
              // 优化聚合点尺寸计算，适应更多聚合的驿站
              const count = params.data.count || 0;
              // 采用更平缓的增长曲线，防止大小增长过快
              return Math.max(40, Math.min(70, 40 + count * 1.8));
            },
            animation: false,
            seriesId: "stationCluster",
            itemStyle: {
              color: "rgba(0,202,255,0.8)",
              borderColor: "#fff",
              borderWidth: 1,
              shadowColor: "rgba(0,202,255,0.5)",
              shadowBlur: 10,
            },
            emphasis: {
              scale: 1.1,
              itemStyle: {
                color: "rgba(0,255,204,0.9)",
              },
            },
            label: {
              show: true,
              position: "inside",
              formatter: (params) => `${params.data.count}`,
              fontSize: 12,
              fontWeight: "bold",
              color: "#fff",
              textShadowColor: "#000",
              textShadowBlur: 2,
            },
            // 处理聚合点数据
            data: clusteredStations
              .filter(
                (item): item is ClusterInfo => "count" in item && item.count > 1 // 过滤出聚合点
              )
              .map((cluster) => ({
                name: `${cluster.count}个驿站`,
                value: [...cluster.position, cluster.count],
                isCluster: true,
                count: cluster.count,
                stations: cluster.stations,
              })),
          },
        ],
      };

      setChartOption(option);
    } catch (err) {
      console.error("更新地图配置失败:", err);
    }
  }, [
    currentMapType,
    mapLoaded,
    ticketData,
    transformedStationList,
    clusteredStations,
    selectKey,
  ]);

  // 地图点击事件处理函数
  const handleMapClick = (params: echarts.ECElementEvent) => {
    const chart = chartRef.current?.getChartInstance();
    if (!chart) return;

    // 判断点击的是否为驿站
    if (params.seriesId === "station" || params.seriesName === "驿站") {
      // 获取驿站信息
      const stationInfo = params.data.stationInfo;

      if (stationInfo) {
        // 设置选中的驿站
        setSelectedStation(stationInfo);

        // 计算弹窗位置 - 使用clientX/clientY替代offsetX/offsetY
        setPopupPosition({
          x: params.event.event.clientX,
          y: params.event.event.clientY,
        });

        // 显示弹窗
        setShowStationPopup(true);
        setShowClusterPopup(false);

        // 阻止事件冒泡，不触发区域下钻
        params.event.stop();
        return;
      }
    }

    // 判断点击的是否为聚合点
    if (
      params.seriesId === "stationCluster" ||
      params.seriesName === "驿站聚合"
    ) {
      if (params.data.isCluster && params.data.stations) {
        // 设置聚合点中的驿站列表
        setClusterStations(params.data.stations);

        // 计算弹窗位置 - 使用clientX/clientY替代offsetX/offsetY
        setPopupPosition({
          x: params.event.event.clientX,
          y: params.event.event.clientY,
        });

        // 显示聚合点弹窗
        setShowClusterPopup(true);
        setShowStationPopup(false);

        // 阻止事件冒泡
        params.event.stop();
        return;
      }
    }

    // 如果不是点击驿站，则处理区域下钻逻辑
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
    instance.on("click", handleMapClick);
  };

  // 创建Portal容器，确保弹窗渲染在body层级
  const renderPortal = () => {
    // 只有在需要显示弹窗时才创建Portal
    if (!showStationPopup && !showClusterPopup) return null;

    // 创建弹窗Portal
    return ReactDOM.createPortal(
      <>
        {/* 驿站弹窗 */}
        {showStationPopup && selectedStation && (
          <div
            className={styles.stationPopup}
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
            }}
          >
            <span className={styles.closeBtn} onClick={handleClosePopup}>
              ×
            </span>

            <div className={styles.stationPopupContent}>
              {selectedStation.address && (
                <p>
                  <strong>名称：</strong>
                  {selectedStation.siteName}
                </p>
              )}
              {selectedStation.address && (
                <p>
                  <strong>地址：</strong>
                  {selectedStation.address}
                </p>
              )}
              {selectedStation.services &&
                selectedStation.services.length > 0 && (
                  <div>
                    <p>
                      <strong>服务内容：</strong>
                      {selectedStation.services}
                    </p>
                  </div>
                )}
            </div>

            <div>
              <div className={styles.tip}>试着问问</div>
              <div
                className={styles.list}
                onClick={() => {
                  // 调用提问回调函数，传递问题内容
                  onAskQuestion?.(`针对${selectedStation.siteName}的投诉信息`);
                  // 关闭当前弹窗
                  handleClosePopup();
                }}
                style={{ cursor: "pointer" }} // 添加手型光标样式，提示可点击
              >
                <span> 【针对{selectedStation.siteName}的投诉信息】</span>
                <ArrowRightOutlined
                  style={{
                    fontWeight: 600,
                    color: "#00ABFF",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 聚合点弹窗 */}
        {showClusterPopup && clusterStations.length > 0 && (
          <div
            className={styles.stationPopup}
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              maxWidth: "300px",
              maxHeight: "400px",
              overflow: "auto",
            }}
          >
            <div className={styles.stationPopupHeader}>
              <h3>此区域驿站列表</h3>
              <span className={styles.closeBtn} onClick={handleClosePopup}>
                ×
              </span>
            </div>
            <div className={styles.stationPopupContent}>
              <ul className={styles.stationList}>
                {clusterStations.map((station, index) => (
                  <li
                    key={index}
                    className={styles.stationListItem}
                    onClick={() => handleSelectStationFromCluster(station)}
                  >
                    {station.siteName}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </>,
      document.body // 将弹窗渲染到body中，确保最高层级
    );
  };

  return (
    <div className={styles.mapChart}>
      <div className={styles.mapWrapper}>
        <BaseChart
          ref={chartRef}
          option={chartOption}
          loading={!mapLoaded}
          onChartReady={handleChartReady}
        />
      </div>

      {/* 使用Portal渲染弹窗 */}
      {renderPortal()}
    </div>
  );
};

export default Map;
