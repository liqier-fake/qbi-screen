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

const useMap = () => {
  const [mapTypeData, setMapTypeData] = useState<MapDataItem[]>([]);

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

    // 判断是否为分布类型（这些类型的数据包含经纬度）
    const isDistribution = [
      MapSelectTypeEnum.dayDistribution,
      MapSelectTypeEnum.nightDistribution,
      MapSelectTypeEnum.workDistribution,
      MapSelectTypeEnum.liveDistribution,
    ].includes(currentMapSelectType);

    try {
      const dataList = MapListEnum[currentMapSelectType] || [];

      // 处理分布类型数据（包含经纬度）- 优化版本
      if (isDistribution) {
        console.log(
          `开始处理分布数据，数据量: ${
            (dataList as DistributionItem[]).length
          }, 地图类型: ${currentMapType}`
        );

        // 街道名称映射（用于过滤）
        const streetNameMap = {
          [MapTypeEnum.jjhstreet]: "金鸡湖街道",
          [MapTypeEnum.wtstreet]: "唯亭街道",
          [MapTypeEnum.lfstreet]: "娄葑街道",
          [MapTypeEnum.spstreet]: "胜浦街道",
          [MapTypeEnum.xtstreet]: "斜塘街道",
        };

        const currentStreet =
          streetNameMap[currentMapType as keyof typeof streetNameMap];
        console.log(`当前地图对应街道: ${currentStreet}`);

        const processedData = (dataList as DistributionItem[])
          // .filter((item) => {
          //   // 街道过滤：如果是街道地图，只显示当前街道的数据
          //   if (currentStreet && currentMapType !== MapTypeEnum.area) {
          //     // 通过社区名查找所属街道
          //     const communityInfo = getPointByCommunity(
          //       sip_comm as CommunityItem[],
          //       `${item.region_name}社区`
          //     );

          //     if (communityInfo && communityInfo.street !== currentStreet) {
          //       console.log(
          //         `过滤非当前街道数据: ${item.region_name} (${communityInfo.street} != ${currentStreet})`
          //       );
          //       return false;
          //     }
          //   }
          //   return true;
          // })
          .map((item) => {
            // **优化：获取社区准确坐标信息**
            const communityInfo = getPointByCommunity(
              sip_comm as CommunityItem[],
              `${item.region_name}社区`
            );

            // 构建包含完整坐标信息的点对象
            const pointWithCoords = {
              name: item.region_name,
              street: communityInfo?.street || "", // 传入正确的街道信息
              // **重要：优先使用社区数据中的准确坐标**
              x: communityInfo?.x || 0, // 社区坐标（更准确）
              y: communityInfo?.y || 0, // 社区坐标（更准确）
              lat: item.lat, // 经纬度作为备用
              lng: item.lng, // 经纬度作为备用
            };

            // 使用统一的坐标转换函数
            const [x, y] = getMapDataXY(pointWithCoords, currentMapType);

            console.log(
              `分布数据坐标转换: ${item.region_name} (${communityInfo?.street})`,
              `社区坐标: (${communityInfo?.x}, ${communityInfo?.y})`,
              `经纬度: (${item.lng}, ${item.lat})`,
              `最终坐标: (${x}, ${y})`
            );

            return {
              ...item,
              value: [x, y, item.people_count || 1] as [number, number, number],
            };
          });

        console.log(`分布数据处理完成，有效数据量: ${processedData.length}`);
        setMapTypeData(processedData);
        return;
      }

      // 处理新就业群体数量（需要通过社区名查找坐标）- 优化版本
      if (currentMapSelectType === MapSelectTypeEnum.newGroupCount) {
        console.log("处理新就业群体数量", dataList);

        // 按社区聚合数据（同一社区有多种群体类型）
        const aggregatedData = new Map<string, number>();
        (dataList as NewGroupItem[]).forEach((item) => {
          const currentCount = aggregatedData.get(item.region_name) || 0;
          aggregatedData.set(
            item.region_name,
            currentCount + item.people_count
          );
        });

        console.log("聚合数据:", Array.from(aggregatedData.entries()));

        // 街道名称映射（用于过滤）
        const streetNameMap = {
          [MapTypeEnum.jjhstreet]: "金鸡湖街道",
          [MapTypeEnum.wtstreet]: "唯亭街道",
          [MapTypeEnum.lfstreet]: "娄葑街道",
          [MapTypeEnum.spstreet]: "胜浦街道",
          [MapTypeEnum.xtstreet]: "斜塘街道",
        };

        const data = Array.from(aggregatedData.entries())
          .map(([regionName, totalCount]) => {
            console.log(`处理社区: ${regionName}, 人数: ${totalCount}`);

            // 查找社区坐标 - 先尝试带"社区"后缀，再尝试不带后缀
            let community = (sip_comm as CommunityItem[]).find(
              (item) => item.Community === `${regionName}社区`
            );

            if (!community) {
              community = (sip_comm as CommunityItem[]).find(
                (item) => item.Community === regionName
              );
            }

            if (!community) {
              console.warn(`未找到社区: ${regionName}`);
              return null;
            }

            console.log(
              `找到社区: ${community.Community}, 街道: ${community.street}`
            );

            // 街道过滤：如果是街道地图，只显示当前街道的社区
            const currentStreet =
              streetNameMap[currentMapType as keyof typeof streetNameMap];

            console.log(
              `当前地图类型: ${currentMapType}, 对应街道: ${currentStreet}`
            );

            if (currentStreet && community.street !== currentStreet) {
              console.log(
                `跳过非当前街道社区: ${regionName} (${community.street} != ${currentStreet})`
              );
              return null;
            }

            // 使用统一的坐标转换函数
            const [x, y] = getMapDataXY(
              {
                name: community.Community,
                street: community.street,
                x: community.x,
                y: community.y,
              },
              currentMapType
            );

            console.log(`社区坐标转换: ${regionName} -> (${x}, ${y})`);

            const result = {
              region_name: regionName,
              people_count: totalCount,
              value: [x, y, totalCount] as [number, number, number],
            };

            console.log(`成功处理社区: ${regionName}`, result);
            return result;
          })
          .filter((item): item is MapDataItem => item !== null);

        console.log("最终处理的数据:", data);
        setMapTypeData(data);
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
