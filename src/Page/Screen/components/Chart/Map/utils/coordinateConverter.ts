/**
 * 坐标转换工具函数
 */

interface Point {
  name: string;
  street: string;
  x: number;
  y: number;
  count?: number;
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

/**
 * 测试坐标转换
 */
export function testCoordinateConversion(): Point[] {
  // 测试数据
  const testPoints: Point[] = [
    {
      name: "澄湾社区",
      street: "唯亭街道",
      x: 65559.0186,
      y: 50696.4677,
      count: 100,
    },
    {
      name: "滨江苑社区",
      street: "胜浦街道",
      x: 74810.7738,
      y: 42262.8901,
      count: 150,
    },
    {
      name: "星湖社区",
      street: "金鸡湖街道",
      x: 62986.667,
      y: 46313.292,
      count: 200,
    },
  ];

  // 转换并验证结果
  const convertedPoints = testPoints.map((point) => {
    const converted = convertCoordinates(point);
    console.log(`转换结果 - ${point.name}:`);
    console.log("原始坐标:", { x: point.x, y: point.y });
    console.log("转换后坐标:", { x: converted.x, y: converted.y });
    console.log("------------------------");
    return converted;
  });

  return convertedPoints;
}
