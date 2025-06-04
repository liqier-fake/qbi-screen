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
      return {
        ...point,
        x: x * 4.8 + 280000,
        y: y * 14.5 + 621000,
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

// 根据社区获取坐标
export function getPointByCommunity(
  list: {
    Community: string;
    street: string;
  }[],
  community: string
) {
  return list.find((l) => l?.Community === community);
}

/**
 * 经纬度转换为自定义坐标系函数
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
 * 获取地图数据点坐标
 * @param point 包含坐标信息的点
 * @param mapType 地图类型
 * @returns 返回转换后的坐标 [x, y]
 */
export const getMapDataXY = (
  point: Point,
  mapType: MapTypeEnum
): [number, number] => {
  const { lat, lng, x, y } = point;

  console.log(point, "point555555555555555");

  // 如果有经纬度信息
  if (lat && lng) {
    if (mapType === MapTypeEnum.area) {
      // area类型直接使用经纬度转换
      return convertLngLatToCoordinates(lng, lat);
    } else {
      // 非area类型，先经纬度转换，再进行区域转换
      const [convertedX, convertedY] = convertLngLatToCoordinates(lng, lat);
      const convertedPoint = convertCoordinates({
        ...point,
        x: convertedX,
        y: convertedY,
      });
      return [convertedPoint.x, convertedPoint.y];
    }
  }

  // 如果只有x,y坐标且是区域地图
  if (mapType === MapTypeEnum.area && x !== undefined && y !== undefined) {
    const convertedPoint = convertCoordinates(point);
    return [convertedPoint.x, convertedPoint.y];
  }

  // 默认返回原始x,y坐标
  return [x, y];
};
