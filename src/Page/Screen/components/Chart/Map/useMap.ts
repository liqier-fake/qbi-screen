import { MapSelectTypeEnum, MapTypeEnum } from "./Map";
import { useState } from "react";
import sip_comm from "./geojson/sip_comm.json";
import { getPointByCommunity, getMapDataXY } from "./utils";
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
  data_type: string;
  date: string;
  distribution_type: null;
  group_type: string;
  id: number;
  lat: null;
  lng: null;
  percentage: null;
  profile_category: null;
  profile_subcategory: null;
  region_id: number;
}

// 定义社区数据项类型
interface CommunityItem {
  Community: string;
  street: string;
  x: number;
  y: number;
}

interface MapDataItem {
  value: [number, number, number];
  region_name: string;
  people_count: number;
  count?: number;
}

// 定义通用数据项类型
interface BaseDataItem {
  [key: string]: unknown;
}

// 扩展类型定义，包含更多字段
interface ExtendedDistributionItem extends DistributionItem {
  [key: string]: unknown;
}

interface ExtendedNewGroupItem extends NewGroupItem {
  [key: string]: unknown;
}

type DataItem = ExtendedDistributionItem | ExtendedNewGroupItem | BaseDataItem;

const useMap = () => {
  const [mapTypeData, setMapTypeData] = useState<MapDataItem[]>([]);

  // 街道名称映射
  const streetNameMap = {
    [MapTypeEnum.jjhstreet]: "金鸡湖街道",
    [MapTypeEnum.wtstreet]: "唯亭街道",
    [MapTypeEnum.lfstreet]: "娄葑街道",
    [MapTypeEnum.spstreet]: "胜浦街道",
    [MapTypeEnum.xtstreet]: "斜塘街道",
  };

  // 通用数据处理函数
  const processMapData = (
    dataList: DataItem[],
    currentMapType: MapTypeEnum,
    options: {
      needAggregation?: boolean; // 是否需要聚合数据
      countField?: string; // 计数字段名
      regionField?: string; // 区域名称字段
    } = {}
  ) => {
    const {
      needAggregation = false,
      countField = "people_count",
      regionField = "region_name",
    } = options;

    // 如果需要聚合数据
    let processedList = dataList;
    if (needAggregation) {
      const aggregatedData = new Map<string, number>();
      dataList.forEach((item) => {
        const regionName = item[regionField] as string;
        const currentCount = aggregatedData.get(regionName) || 0;
        aggregatedData.set(
          regionName,
          currentCount + ((item[countField] as number) || 0)
        );
      });
      processedList = Array.from(aggregatedData.entries()).map(
        ([regionName, count]) =>
          ({
            [regionField]: regionName,
            [countField]: count,
          } as DataItem)
      );
    }

    // 获取当前街道
    const currentStreet =
      streetNameMap[currentMapType as keyof typeof streetNameMap];
    console.log(`当前地图对应街道: ${currentStreet}`);

    // 处理每个数据点
    return processedList
      .map((item) => {
        const regionName = item[regionField] as string;
        // 查找社区坐标 - 增加容错性处理
        let communityInfo = getPointByCommunity(
          sip_comm as CommunityItem[],
          `${regionName}社区`
        );

        // 如果没找到，尝试直接匹配
        if (!communityInfo) {
          communityInfo = getPointByCommunity(
            sip_comm as CommunityItem[],
            regionName
          );
        }

        if (!communityInfo) {
          console.warn(`未找到社区: ${regionName}`);
          return null;
        }

        // 街道过滤
        if (currentStreet && communityInfo.street !== currentStreet) {
          console.log(
            `跳过非当前街道社区: ${regionName} (${communityInfo.street} != ${currentStreet})`
          );
          return null;
        }

        // 构建点对象
        const pointWithCoords = {
          name: regionName,
          street: communityInfo.street,
          x: communityInfo.x,
          y: communityInfo.y,
          lat: (item as ExtendedDistributionItem | ExtendedNewGroupItem).lat as
            | number
            | undefined,
          lng: (item as ExtendedDistributionItem | ExtendedNewGroupItem).lng as
            | number
            | undefined,
        };

        // 坐标转换
        const [x, y] = getMapDataXY(pointWithCoords, currentMapType);

        console.log(
          `处理社区数据: ${regionName}, 街道: ${communityInfo.street}, 坐标: (${x}, ${y})`
        );

        return {
          region_name: regionName,
          people_count: (item[countField] as number) || 0,
          value: [x, y, (item[countField] as number) || 1] as [
            number,
            number,
            number
          ],
        };
      })
      .filter((item): item is MapDataItem => item !== null);
  };

  // 地图数据映射
  const MapListEnum: Record<MapSelectTypeEnum, unknown[]> = {
    [MapSelectTypeEnum.dayDistribution]: dayDistribution,
    [MapSelectTypeEnum.newGroupCount]: newGroupCount,
    [MapSelectTypeEnum.nightDistribution]: nightDistribution,
    [MapSelectTypeEnum.workDistribution]: workDistribution,
    [MapSelectTypeEnum.liveDistribution]: liveDistribution,
    [MapSelectTypeEnum.image]: images,
    [MapSelectTypeEnum.site]: [],
    [MapSelectTypeEnum.number]: [],
  };

  // 获取地图类型数据
  const getMapTypeData = async (
    currentMapSelectType: MapSelectTypeEnum,
    currentMapType: MapTypeEnum
  ) => {
    console.log(
      "getMapTypeData",
      currentMapSelectType,
      "地图类型:",
      currentMapType
    );

    try {
      const dataList = MapListEnum[currentMapSelectType] || [];

      // 处理分布类型数据
      if (
        [
          MapSelectTypeEnum.dayDistribution,
          MapSelectTypeEnum.nightDistribution,
          MapSelectTypeEnum.workDistribution,
          MapSelectTypeEnum.liveDistribution,
        ].includes(currentMapSelectType)
      ) {
        const processedData = processMapData(
          dataList as ExtendedDistributionItem[],
          currentMapType
        );
        setMapTypeData(processedData);
        return;
      }

      // 处理新就业群体数量
      if (currentMapSelectType === MapSelectTypeEnum.newGroupCount) {
        const processedData = processMapData(
          dataList as ExtendedNewGroupItem[],
          currentMapType,
          {
            needAggregation: true,
            countField: "people_count",
            regionField: "region_name",
          }
        );
        setMapTypeData(processedData);
        return;
      }

      // 处理画像数据
      if (currentMapSelectType === MapSelectTypeEnum.image) {
        setMapTypeData(dataList as MapDataItem[]);
        return;
      }
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
