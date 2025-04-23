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

const mockData: Record<MapTypeEnum, { name: string; value: number }[]> = {
  [MapTypeEnum.area]: [
    { name: "金鸡湖街道", value: 820 },
    { name: "唯亭街道", value: 730 },
    { name: "娄葑街道", value: 650 },
    { name: "胜浦街道", value: 580 },
    { name: "斜塘街道", value: 750 },
  ],
  [MapTypeEnum.jjhstreet]: [
    { name: "金鸡湖社区1", value: 300 },
    { name: "金鸡湖社区2", value: 220 },
    { name: "金鸡湖社区3", value: 180 },
  ],
  [MapTypeEnum.wtstreet]: [
    { name: "唯亭社区1", value: 250 },
    { name: "唯亭社区2", value: 210 },
    { name: "唯亭社区3", value: 190 },
  ],
  [MapTypeEnum.lfstreet]: [
    { name: "娄葑社区1", value: 280 },
    { name: "娄葑社区2", value: 230 },
    { name: "娄葑社区3", value: 170 },
  ],
  [MapTypeEnum.spstreet]: [
    { name: "胜浦社区1", value: 260 },
    { name: "胜浦社区2", value: 220 },
    { name: "胜浦社区3", value: 180 },
  ],
  [MapTypeEnum.xtstreet]: [
    { name: "斜塘社区1", value: 290 },
    { name: "斜塘社区2", value: 240 },
    { name: "斜塘社区3", value: 190 },
  ],
};

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
        // 使用正确的类型
        // @ts-ignore
        echarts.registerMap(key, json);
      });
      setMapLoaded(true);
    } catch (error) {
      console.log(error);
    }
  }, []);

  // 更新图表配置
  useEffect(() => {
    if (!mapLoaded) return;

    try {
      const newOption: EChartsOption = {
        // title: {
        //   text: MapTypeNames[currentMapType],
        //   left: "center",
        //   textStyle: {
        //     color: "#333",
        //     fontSize: 18,
        //     fontWeight: "bold",
        //   },
        // },
        tooltip: {
          trigger: "item", // 或 'axis'（坐标轴触发）
          backgroundColor: "#fff", // 背景色
          borderColor: "#ddd", // 边框颜色
          borderWidth: 1, // 边框宽度
          padding: [10, 15], // 内边距 [垂直, 水平]
          textStyle: {
            color: "#333", // 文字颜色
            fontSize: 12, // 文字大小
          },
        },
        visualMap: {
          min: 0,
          max: 1000,
          left: "left",
          top: "bottom",
          inRange: {
            // color: ["#e0ffff", "#006edd"],
          },
          show: false,
        },
        series: [
          {
            name: "工单量",
            type: "map",
            map: currentMapType,
            roam: true,
            label: {
              show: true,
              fontSize: 12,
              fontWeight: "bold",
              // position: "inside",
              color: "#000",
              backgroundColor: "rgba(255,255,255,0.5)",
              padding: [3, 5],
            },
            itemStyle: {
              areaColor: "transparent",
              borderColor: "#3B82F6",
              borderWidth: 1,
            },
            // 高亮状态下的标签样式
            emphasis: {
              label: {
                color: "#fff",
                fontWeight: "bold",
              },
              itemStyle: {
                areaColor: "#3B82F6",
              },
            },
            data: mockData[currentMapType].map((item) => ({
              ...item,
              label: {
                // show: true,
                // color: "#000",
              },
            })),
            selectedMode: false,
          },
        ],
      };

      setChartOption(newOption);
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

  // 回到上一级地图
  // const handleDrillUp = (targetIndex: number) => {
  //   if (targetIndex >= 0 && targetIndex < breadcrumbs.length) {
  //     // 更新当前地图类型
  //     const targetMapType = breadcrumbs[targetIndex].type;
  //     setCurrentMapType(targetMapType);
  //     // 更新面包屑（截取到目标索引+1）
  //     setBreadcrumbs((prev) => prev.slice(0, targetIndex + 1));
  //   }
  // };

  const handleChartReady = (instance: echarts.ECharts) => {
    instance.on("click", handleDrillDown);
  };

  const handleMapTypeChange = (value: MapTypeEnum) => {
    setCurrentMapType(value);
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
      {/* <div>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.type}>
            {index > 0 && <span style={{ margin: "0 8px" }}>/</span>}
            <span
              style={{
                cursor:
                  index === breadcrumbs.length - 1 ? "default" : "pointer",
                color: index === breadcrumbs.length - 1 ? "#333" : "#1677ff",
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
            height: "600px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            fontSize: "16px",
            color: "#666",
          }}
        >
          地图加载中...
        </div>
      )}
    </div>
  );
};

export default Map;
