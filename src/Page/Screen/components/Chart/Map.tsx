import React, { useEffect, useState, useRef } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import BaseChart, { BaseChartRef } from "./BaseChart";
import { geojsonMap } from "./geojson";
import { Select } from "antd";

enum MapTypeEnum {
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

const MapTypeNames: Record<MapTypeEnum, string> = {
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

// 街道名称到枚举的映射
const streetNameToEnum: Record<string, MapTypeEnum> = {
  金鸡湖街道: MapTypeEnum.jjhstreet,
  唯亭街道: MapTypeEnum.wtstreet,
  娄葑街道: MapTypeEnum.lfstreet,
  胜浦街道: MapTypeEnum.spstreet,
  斜塘街道: MapTypeEnum.xtstreet,
};

const Map: React.FC = () => {
  const chartRef = useRef<BaseChartRef>(null);
  const [currentMapType, setCurrentMapType] = useState<MapTypeEnum>(
    MapTypeEnum.area
  );
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

    try {
      // 获取当前区域的数据点坐标
      const currentAreaData = mockData[currentMapType];

      // 构建地图配置
      const option: EChartsOption = {
        // 背景色
        backgroundColor: "transparent",

        // 添加工具提示配置
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c}", // 使用简单的字符串模板，{b}表示名称，{c}表示数值
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
          {
            map: currentMapType,
            zlevel: -3,
            aspectScale: 1,
            zoom: 1.0,
            layoutCenter: ["50%", "53%"],
            layoutSize: "100%",
            silent: true,
            itemStyle: {
              borderWidth: 1,
              borderColor: "rgba(58,149,253,0.4)",
              shadowColor: "rgba(29, 111, 165,1)",
              shadowOffsetY: 15,
              shadowBlur: 10,
              areaColor: "rgba(5,21,35,0.1)",
            },
          },
          // 重影4（最底层） - 注意保持roam一致性
          {
            map: currentMapType,
            zlevel: -4,
            aspectScale: 1,
            zoom: 1.0,
            layoutCenter: ["50%", "54%"],
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
        series: [
          // 地图数据层
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
              // 使用渐变色填充
              areaColor: {
                type: "linear",
                x: 1200,
                y: 0,
                x2: 0,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: "rgba(3,27,78,0.75)", // 起始颜色
                  },
                  {
                    offset: 1,
                    color: "rgba(58,149,253,0.75)", // 结束颜色
                  },
                ],
                global: true,
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
                areaColor: "rgba(0,254,233,0.6)",
                shadowColor: "rgba(0,254,233,0.6)",
                shadowBlur: 20,
                borderWidth: 1,
              },
            },
            layoutCenter: ["50%", "50%"],
            layoutSize: "100%",
            data: currentAreaData,
          },

          // 散点动效
          {
            type: "effectScatter",
            coordinateSystem: "geo",
            silent: false, // 启用鼠标交互
            rippleEffect: {
              period: 4, // 动画时间，值越小速度越快
              scale: 5, // 波纹圆环最大限制，值越大波纹越大
              brushType: "stroke", // 波纹绘制方式
            },
            label: {
              show: true,
              position: "right", // 显示位置
              offset: [5, 0], // 偏移设置
              formatter: function (
                params: echarts.DefaultLabelFormatterCallbackParams
              ) {
                // 圆环显示文字
                return `${params.name}: ${
                  params.value instanceof Array ? params.value[2] : params.value
                }`;
              },
              fontSize: 13,
              color: "white",
            },
            emphasis: {
              label: {
                show: true,
              },
            },
            symbol: "circle",
            symbolSize: 10,
            itemStyle: {
              borderWidth: 1,
              color: "rgba(255, 86, 11, 1)",
            },
            // 使用坐标和值构建数据
            data: currentAreaData
              .filter((item) => item.coordinate) // 确保有坐标
              .map((item) => ({
                name: item.name,
                value: [...(item.coordinate || [0, 0]), item.value],
              })),
          },
        ],
      };

      setChartOption(option);
    } catch (err) {
      console.error("更新地图配置失败:", err);
    }
  }, [currentMapType, mapLoaded]);

  // 地图下钻处理函数
  const handleDrillDown = (params: echarts.ECElementEvent) => {
    if (currentMapType === MapTypeEnum.area && streetNameToEnum[params.name]) {
      const nextMapType = streetNameToEnum[params.name];
      setCurrentMapType(nextMapType);
      setBreadcrumbs((prev) => [
        ...prev,
        { type: nextMapType, name: MapTypeNames[nextMapType] },
      ]);
    }
  };

  // // 回到上一级地图
  // const handleDrillUp = (targetIndex: number) => {
  //   if (targetIndex >= 0 && targetIndex < breadcrumbs.length) {
  //     // 更新当前地图类型
  //     const targetMapType = breadcrumbs[targetIndex].type;
  //     setCurrentMapType(targetMapType);
  //     // 更新面包屑（截取到目标索引+1）
  //     setBreadcrumbs((prev) => prev.slice(0, targetIndex + 1));
  //   }
  // };

  // 图表实例准备完成的回调
  const handleChartReady = (instance: echarts.ECharts) => {
    instance.on("click", handleDrillDown);
  };

  // 下拉选择地图类型改变的处理函数
  const handleMapTypeChange = (value: MapTypeEnum) => {
    setCurrentMapType(value);
    // 更新面包屑导航
    // setBreadcrumbs([{ type: value, name: MapTypeNames[value] }]);
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
      {/* 地图类型选择器 */}
      <div>
        <Select
          value={currentMapType}
          onChange={handleMapTypeChange}
          options={Object.values(MapTypeEnum).map((type) => ({
            label: MapTypeNames[type as MapTypeEnum],
            value: type,
          }))}
        />
      </div>

      {/* 面包屑导航 */}
      {/* <div
        style={{
          position: "absolute",
          top: "20px",
          left: "180px",
          zIndex: 10,
          background: "rgba(0,0,0,0.6)",
          padding: "4px 10px",
          borderRadius: "4px",
          color: "#fff",
        }}
      >
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.type}>
            {index > 0 && (
              <span style={{ margin: "0 8px", color: "#999" }}>/</span>
            )}
            <span
              style={{
                cursor:
                  index === breadcrumbs.length - 1 ? "default" : "pointer",
                color: index === breadcrumbs.length - 1 ? "#fff" : "#3B82F6",
                fontWeight:
                  index === breadcrumbs.length - 1 ? "bold" : "normal",
              }}
              onClick={() =>
                index < breadcrumbs.length - 1 && handleDrillUp(index)
              }
            >
              {item.name}
            </span>
          </React.Fragment>
        ))}
      </div> */}

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
