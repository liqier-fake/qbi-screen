import { apiGetNewGroupCount } from "../../../api";
import { MapSelectTypeEnum } from "./Map";
import { useState } from "react";

const useMap = () => {
  const [mapTypeData, setMapTypeData] = useState<any[]>([]);

  // 转换经纬度为对应街道映射坐标
  const changeLngLat = (lng: number, lat: number) => {
    return [lng, lat];
  };

  //  按社区映射
  const changeCommunity = (community: string) => {
    return community;
  };

  // 获取地图类型数据
  const getMapTypeData = async (currentMapSelectType: MapSelectTypeEnum) => {
    const isDistribution = [
      MapSelectTypeEnum.dayDistribution,
      MapSelectTypeEnum.nightDistribution,
      MapSelectTypeEnum.workDistribution,
      MapSelectTypeEnum.liveDistribution,
    ].includes(currentMapSelectType)
      ? currentMapSelectType
      : null;

    const { data } = await apiGetNewGroupCount({
      data_type: !isDistribution ? currentMapSelectType : undefined,
      distribution_type: isDistribution ? currentMapSelectType : undefined,
    });

    console.log(data);

    // 分布

    // 画像

    // 新就业群体数量
  };

  return {
    getMapTypeData,
    mapTypeData,
  };
};

export default useMap;
