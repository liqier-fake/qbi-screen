/**
 * 坐标转换工具函数
 */

import { MapTypeEnum } from "../Map";

interface Point {
  name: string;
  street: string;
  x: number;
  y: number;
  count?: number;
  lat?: number; // 添加可选的经纬度属性
  lng?: number;
}

// 定义椭球参数
const a = 6378245.0;  // 长半轴
const ee = 0.00669342162296594323;  // 偏心率平方

/**
 * 判断坐标是否在中国境内
 * @param lng 经度
 * @param lat 纬度
 * @returns boolean
 */
const isInChina = (lng: number, lat: number): boolean => {
  // 粗略范围判断
  return lng >= 72.004 && lng <= 137.8347 && lat >= 0.8293 && lat <= 55.8271;
};

/**
 * GCJ-02(高德)坐标转WGS84坐标
 * @param lng 经度
 * @param lat 纬度
 * @returns [lng, lat] WGS84坐标
 */
const gcj02ToWGS84 = (lng: number, lat: number): [number, number] => {
  if (!isInChina(lng, lat)) {
    return [lng, lat];
  }

  let dlat = transformLat(lng - 105.0, lat - 35.0);
  let dlng = transformLng(lng - 105.0, lat - 35.0);
  const radlat = lat / 180.0 * Math.PI;
  let magic = Math.sin(radlat);
  magic = 1 - ee * magic * magic;
  const sqrtmagic = Math.sqrt(magic);
  dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * Math.PI);
  dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * Math.PI);
  const mglat = lat + dlat;
  const mglng = lng + dlng;
  return [lng * 2 - mglng, lat * 2 - mglat];
};

/**
 * 转换经度
 */
const transformLng = (lng: number, lat: number): number => {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
  return ret;
};

/**
 * 转换纬度
 */
const transformLat = (lng: number, lat: number): number => {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
  return ret;
};

/**
 * 经纬度转换为园区坐标系函数 (统一的基础转换)
 * 基于三个已知点的对应关系计算转换参数
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @returns {[number, number]} - 返回转换后的[x, y]坐标
 */
export const convertLngLatToCoordinates = (
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

/**
 * 基于投影坐标系统进行经纬度到投影坐标的精确转换
 * 使用2000SZ投影坐标系参数
 * @param lng 经度
 * @param lat 纬度
 * @returns 投影坐标 [x, y]
 */
export const convertLngLatToProjection = (
  lng: number,
  lat: number
): [number, number] => {
  // 投影参数 (基于2000SZ坐标系)
  const centralMeridian = 120.7833333333333; // 中央子午线
  const falseEasting = 350000.0; // 东偏移
  const falseNorthing = -2800000.0; // 北偏移
  const scaleFactor = 1.0; // 比例因子

  // 椭球参数 (CGCS2000)
  const a = 6378137.0; // 长半轴
  const f = 1 / 298.257222101; // 扁率
  const e2 = 2 * f - f * f; // 第一偏心率的平方

  // 度转弧度
  const toRad = Math.PI / 180;
  const latRad = lat * toRad;
  const lngRad = lng * toRad;
  const cmRad = centralMeridian * toRad;

  // 经度差
  const deltaLng = lngRad - cmRad;

  // 高斯-克吕格投影计算
  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const tanLat = Math.tan(latRad);

  const nu = a / Math.sqrt(1 - e2 * sinLat * sinLat);
  const rho = (a * (1 - e2)) / Math.pow(1 - e2 * sinLat * sinLat, 1.5);
  const eta2 = nu / rho - 1;

  const l = deltaLng;
  const l2 = l * l;
  const l3 = l2 * l;
  const l4 = l3 * l;

  // X坐标 (北向)
  const M =
    a *
    ((1 - e2 / 4 - (3 * e2 * e2) / 64) * latRad -
      ((3 * e2) / 8 + (3 * e2 * e2) / 32) * Math.sin(2 * latRad) +
      ((15 * e2 * e2) / 256) * Math.sin(4 * latRad));

  const x =
    scaleFactor *
      (M +
        nu *
          sinLat *
          cosLat *
          (l2 / 2 +
            ((5 - tanLat * tanLat + 9 * eta2 + 4 * eta2 * eta2) * l4) / 24)) +
    falseNorthing;

  // Y坐标 (东向)
  const y =
    scaleFactor *
      (nu * cosLat * (l + ((1 - tanLat * tanLat + eta2) * l3) / 6)) +
    falseEasting;

  return [y, x]; // 注意：返回[东向, 北向]对应[x, y]
};

/**
 * 将社区坐标转换为对应街道地图的坐标
 * @param point 需要转换的点
 * @returns 转换后的点
 */
export function convertCoordinates(point: Point): Point {
  const { street, x, y } = point;

  switch (street) {
    case "唯亭街道":
      return {
        ...point,
        x: x * 5 + 280000,
        y: y * 13 + 620000,
      };

    case "胜浦街道":
      return {
        ...point,
        x: x * 4.7 + 280000,
        y: y * 15.7 + 622000,
      };

    case "金鸡湖街道":
      // 恢复原始转换参数，保持稳定显示效果
      return {
        ...point,
        x: x * 5.3 + 15000, // 恢复原始参数
        y: y * 9.8 + 620000, // 恢复原始参数
      };

    case "斜塘街道":
      return {
        ...point,
        x: x * 4.9 + 280000,
        y: y * 14.8 + 621500,
      };

    case "娄葑街道":
      return {
        ...point,
        x: x * 4.85 + 280000,
        y: y * 14.2 + 621200,
      };

    default:
      return point;
  }
}

// 根据社区获取坐标 (改进版本，支持更灵活的匹配)
export function getPointByCommunity(
  list: {
    Community: string;
    street: string;
    x: number;
    y: number;
  }[],
  community: string
) {
  // 首先尝试精确匹配
  let result = list.find((l) => l?.Community === community);

  if (result) {
    return result;
  }

  // 如果精确匹配失败，尝试其他匹配策略
  const normalizedCommunity = community.trim();

  // 尝试去掉"社区"后缀再匹配
  if (normalizedCommunity.endsWith("社区")) {
    const withoutSuffix = normalizedCommunity.slice(0, -2);
    result = list.find((l) => l?.Community === withoutSuffix);
    if (result) {
      console.log(
        `社区匹配成功（去除后缀）: ${community} -> ${result.Community}`
      );
      return result;
    }
  }

  // 尝试添加"社区"后缀再匹配
  if (!normalizedCommunity.endsWith("社区")) {
    const withSuffix = normalizedCommunity + "社区";
    result = list.find((l) => l?.Community === withSuffix);
    if (result) {
      console.log(
        `社区匹配成功（添加后缀）: ${community} -> ${result.Community}`
      );
      return result;
    }
  }

  // 尝试部分匹配（包含关系）
  result = list.find(
    (l) =>
      l?.Community.includes(normalizedCommunity) ||
      normalizedCommunity.includes(l?.Community)
  );

  if (result) {
    console.log(
      `社区匹配成功（部分匹配）: ${community} -> ${result.Community}`
    );
    return result;
  }

  console.warn(`未找到匹配的社区: ${community}`);
  return undefined;
}

/**
 * 获取地图数据点坐标 (统一坐标转换方法)
 * @param point 包含坐标信息的点
 * @param mapType 地图类型
 * @returns 返回转换后的坐标 [x, y]
 */
export const getMapDataXY = (
  point: Point,
  mapType: MapTypeEnum
): [number, number] => {
  const { lat, lng, x, y, street, name } = point;

  console.log(
    `处理坐标转换: ${name || "未知"}, 地图类型: ${mapType}, 街道: ${street}`,
    point
  );

  // **优化：根据地图类型选择不同的坐标优先级**
  if (mapType === MapTypeEnum.area) {
    // area地图：优先使用经纬度转换（保持原有效果）
    if (lat && lng) {
      console.log(`area地图使用经纬度转换: lng=${lng}, lat=${lat}`);
      // 先将高德坐标转换为WGS84坐标
      const [wgs84Lng, wgs84Lat] = gcj02ToWGS84(lng, lat);
      console.log(`转换为WGS84坐标: lng=${wgs84Lng}, lat=${wgs84Lat}`);
      const [areaX, areaY] = convertLngLatToCoordinates(wgs84Lng, wgs84Lat);
      console.log(`area地图最终坐标: x=${areaX}, y=${areaY}`);
      return [areaX, areaY];
    }

    // 备用：使用社区坐标
    if (x !== undefined && y !== undefined && x > 0 && y > 0) {
      console.log(`area地图备用社区坐标: x=${x}, y=${y}`);
      return [x, y];
    }
  } else {
    // 街道地图：优先使用经纬度进行投影坐标转换
    if (lat && lng) {
      console.log(`街道地图使用投影坐标转换: lng=${lng}, lat=${lat}`);
      // 先将高德坐标转换为WGS84坐标
      const [wgs84Lng, wgs84Lat] = gcj02ToWGS84(lng, lat);
      console.log(`转换为WGS84坐标: lng=${wgs84Lng}, lat=${wgs84Lat}`);
      const [projX, projY] = convertLngLatToProjection(wgs84Lng, wgs84Lat);
      console.log(`街道地图投影坐标: x=${projX}, y=${projY}`);
      return [projX, projY];
    }

    // 备用：使用社区数据中的准确坐标
    if (x !== undefined && y !== undefined && x > 0 && y > 0) {
      console.log(`街道地图使用社区坐标: x=${x}, y=${y}`);

      // 街道地图需要坐标转换
      const convertedPoint = convertCoordinates({
        ...point,
        x: x,
        y: y,
        street: street,
      });
      console.log(
        `街道坐标转换: 社区坐标(${x}, ${y}) -> 街道坐标(${convertedPoint.x}, ${convertedPoint.y})`
      );
      return [convertedPoint.x, convertedPoint.y];
    }
  }

  // 默认返回原始坐标
  console.warn(`坐标转换失败，使用默认值:`, point);
  return [x || 0, y || 0];
};
