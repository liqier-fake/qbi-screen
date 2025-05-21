// @ts-nocheck

import React, { useEffect, useState, useRef } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import BaseChart, { BaseChartRef } from "./BaseChart";
import { geojsonMap } from "./geojson";
import { flatten } from "lodash";
import icon from "./icon.png";
import styles from "./map.module.less";

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
}

// 定义Map组件的props接口
interface MapProps {
  currentMapType: MapTypeEnum; // 当前地图类型
  ticketData?: TicketCountData[][]; // 工单数据
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

  // 驿站数据
  const stationList: StationInfo[] = [
    {
      siteName: "工会驿站（苏州工业园区娄葑街道饿了么站点）",
      address: "苏州工业园区娄葑街道北摆宴街怡葑庭一栋商铺108",
      services: "苏州工业园区娄葑街道饿了么站点",
      district: "娄葑区域",
      name: "工会驿站（苏州工业园区娄葑街道饿了么站点）",
      position: [64885.6826, 50343.5419],
    },
  ];

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
  };

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

  // 恢复stationData定义到组件内部
  const stationData = geojsonMap["station"]?.map((item) => {
    return {
      name: item.siteName,
      value: [item.x, item.y, 888],
      // 保留item的其他属性以确保数据完整
      ...item,
    };
  });

  console.log(stationData, "stationData");

  // 更新图表配置
  useEffect(() => {
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
    console.log(scatterData, "scatterData");

    try {
      const option: EChartsOption = {
        // backgroundColor: "#030528",
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
          currentMapType === MapTypeEnum.area && {
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
          {
            name: "驿站",
            type: "scatter",
            coordinateSystem: "geo",
            geoIndex: 0,
            zlevel: 2,
            symbol: `image://${icon}`,
            symbolSize: (value: Array<number>, params: object) => {
              console.log(value, params, "value, params");
              return [70, 20];
            },
            // 为驿站添加特殊的点击事件类型标记
            seriesId: "station", // 添加唯一标识符，用于区分点击事件
            // 添加emphasis配置，修改hover效果
            emphasis: {
              disabled: false, // 启用强调状态
              scale: 1.2, // 稍微放大
              itemStyle: {
                opacity: 1, // 保持原有透明度
              },
            },
            label: {
              show: true,
              formatter: (params) => {
                return `${params.name}`;
              },
              symbolOffset: 1000,
              position: "inside", // 或者 'top', 'bottom', 'right', 'left'
              color: "#fff",
              offset: [6, 0],
              fontSize: 8,
            },
            tooltip: {
              show: true,
              trigger: "item",
              formatter: (params) => {
                return `${params.name}：驿站`;
              },
            },

            data: stationList.map((station) => ({
              name: station.name,
              value: [...station.position, 1],
              // 存储完整的驿站信息以便点击时使用
              stationInfo: station,
            })),
          },
        ],
      };

      setChartOption(option);
    } catch (err) {
      console.error("更新地图配置失败:", err);
    }
  }, [currentMapType, mapLoaded, ticketData]);

  // 地图点击事件处理函数
  const handleMapClick = (params: echarts.ECElementEvent) => {
    const chart = chartRef.current?.getChartInstance();
    if (!chart) return;

    // 获取点击位置相对于容器的坐标
    const pointInPixel = chart.convertToPixel("geo", params.value);

    // 判断点击的是否为驿站
    if (params.seriesId === "station" || params.seriesName === "驿站") {
      // 获取驿站信息
      const stationInfo = params.data.stationInfo;

      if (stationInfo) {
        // 设置选中的驿站
        setSelectedStation(stationInfo);

        // 计算弹窗位置 - 这里可以根据需要调整
        setPopupPosition({
          x: params.event.offsetX,
          y: params.event.offsetY,
        });

        // 显示弹窗
        setShowStationPopup(true);

        // 阻止事件冒泡，不触发区域下钻
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

  return (
    <div className={styles.mapChart}>
      <div className={styles.mapWrapper}>
        <BaseChart
          ref={chartRef}
          option={chartOption}
          loading={!mapLoaded}
          onChartReady={handleChartReady}
        />

        {/* 驿站弹窗 */}
        {showStationPopup && selectedStation && (
          <div
            className={styles.stationPopup}
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
            }}
          >
            <div className={styles.stationPopupHeader}>
              <h3>{selectedStation.name}</h3>
              <span className={styles.closeBtn} onClick={handleClosePopup}>
                ×
              </span>
            </div>
            <div className={styles.stationPopupContent}>
              {selectedStation.address && (
                <p>
                  <strong>地址：</strong>
                  {selectedStation.address}
                </p>
              )}
              {selectedStation.contact && (
                <p>
                  <strong>联系方式：</strong>
                  {selectedStation.contact}
                </p>
              )}
              {selectedStation.services &&
                selectedStation.services.length > 0 && (
                  <div>
                    <p>
                      <strong>服务项目：</strong>
                      {selectedStation.services}
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
