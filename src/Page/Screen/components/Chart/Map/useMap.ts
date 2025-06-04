import { MapSelectTypeEnum, MapTypeEnum } from "./Map";
import { useState } from "react";
import sip_comm from "./geojson/sip_comm.json";
import { getMapDataXY, getPointByCommunity } from "./utils";
import { dayDistribution } from "./geojson/dayDistribution";
import { newGroupCount } from "./geojson/newGroupCount";
import { nightDistribution } from "./geojson/nightDistribution";
import { workDistribution } from "./geojson/workDistribution";
import { liveDistribution } from "./geojson/liveDistribution";
import { images } from "./geojson/image";

// 定义分布数据项的类型（包含经纬度）
interface DistributionItem {
  data_type: string;
  date: string;
  distribution_type: string;
  group_type: string;
  id: number;
  lat: number;
  lng: number;
  people_count: number;
  percentage: null;
  profile_category: null;
  profile_subcategory: null;
  region_id: number;
  region_name: string;
}

// 定义新就业群体数据项的类型（包含社区名）
interface NewGroupItem {
  region_name: string;
  people_count: number;
  [key: string]: any;
}

// 定义画像数据项的类型
interface ImageItem {
  [key: string]: any;
}

interface MapDataItem {
  value: [number, number, number];
  region_name?: string;
  people_count?: number;
  count?: number;
}

// 经纬度转换为自定义坐标系函数
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

const useMap = () => {
  const [mapTypeData, setMapTypeData] = useState<MapDataItem[]>([]);

  // 地图数据映射
  const MapListEnum = {
    [MapSelectTypeEnum.dayDistribution]: dayDistribution,
    [MapSelectTypeEnum.newGroupCount]: newGroupCount,
    [MapSelectTypeEnum.nightDistribution]: nightDistribution,
    [MapSelectTypeEnum.workDistribution]: workDistribution,
    [MapSelectTypeEnum.liveDistribution]: liveDistribution,
    [MapSelectTypeEnum.image]: images,
  };

  // 获取地图类型数据
  const getMapTypeData = async (
    currentMapSelectType: MapSelectTypeEnum,
    currentMapType: MapTypeEnum
  ) => {
    console.log("getMapTypeData", currentMapSelectType);

    // 判断是否为分布类型（这些类型的数据包含经纬度）
    const isDistribution = [
      MapSelectTypeEnum.dayDistribution,
      MapSelectTypeEnum.nightDistribution,
      MapSelectTypeEnum.workDistribution,
      MapSelectTypeEnum.liveDistribution,
    ].includes(currentMapSelectType);

    try {
      const dataList = MapListEnum[currentMapSelectType] || [];

      // 处理分布类型数据（包含经纬度）
      if (isDistribution) {
        console.log("处理分布数据", dataList.length);

        const processedData =
          (dataList as DistributionItem[])?.map((item) => {
            const communityInfo = getPointByCommunity(
              sip_comm as any,
              `${item.region_name}社区`
            );

            console.log(communityInfo, "communityInfocommunityInfo");

            // 直接使用经纬度转换坐标
            const [x, y] = convertLngLatToCoordinates(item.lng, item.lat);

            console.log(
              `${item.region_name}: lat=${item.lat}, lng=${item.lng} -> x=${x}, y=${y}`
            );

            return {
              ...item,
              value: [x, y, item.people_count || 1] as [number, number, number],
            };
          }) || [];

        console.log("处理后的分布数据", processedData.length);
        setMapTypeData(processedData);
        return;
      }

      // 处理新就业群体数量（需要通过社区名查找坐标）
      if (currentMapSelectType === MapSelectTypeEnum.newGroupCount) {
        console.log("处理新就业群体数据");

        const processedData =
          (dataList as NewGroupItem[])
            ?.map((item) => {
              // 通过社区名查找坐标信息
              const communityInfo = getPointByCommunity(
                sip_comm as any,
                `${item.region_name}社区`
              );

              console.log(`查找社区: ${item.region_name}社区`, communityInfo);

              if (!communityInfo) return null;

              // 构造Point对象
              const point = {
                name: communityInfo.Community,
                street: communityInfo.street,
                x: communityInfo.x,
                y: communityInfo.y,
              };

              const [x, y] = getMapDataXY(point, currentMapType);

              console.log(`${item.region_name}: x=${x}, y=${y}`);

              return {
                ...item,
                value: [x, y, item.people_count || 0] as [
                  number,
                  number,
                  number
                ],
              };
            })
            .filter(Boolean) || []; // 过滤掉null值

        console.log("处理后的新就业群体数据", processedData.length);
        setMapTypeData(processedData);
        return;
      }

      // 处理画像数据
      if (currentMapSelectType === MapSelectTypeEnum.image) {
        console.log("处理画像数据");
        setMapTypeData(dataList as MapDataItem[]);
        return;
      }

      // 其他情况
      setMapTypeData([]);
    } catch (error) {
      console.error("获取地图数据失败:", error);
      setMapTypeData([]);
    }
  };

  return {
    getMapTypeData,
    mapTypeData,
  };
};

export default useMap;
