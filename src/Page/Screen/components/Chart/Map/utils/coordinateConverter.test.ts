import {
  convertCoordinates,
  testCoordinateConversion,
} from "./coordinateConverter";

describe("坐标转换测试", () => {
  test("唯亭街道坐标转换", () => {
    const point = {
      name: "澄湾社区",
      street: "唯亭街道",
      x: 65559.0186,
      y: 50696.4677,
      count: 100,
    };

    const converted = convertCoordinates(point);

    // 验证转换结果
    expect(converted.x).toBeCloseTo(607795.093, 2); // x * 5 + 280000
    expect(converted.y).toBeCloseTo(1279054.08, 2); // y * 13 + 620000
  });

  test("胜浦街道坐标转换", () => {
    const point = {
      name: "滨江苑社区",
      street: "胜浦街道",
      x: 74810.7738,
      y: 42262.8901,
      count: 150,
    };

    const converted = convertCoordinates(point);

    // 验证转换结果
    expect(converted.x).toBeCloseTo(631610.637, 2); // x * 4.7 + 280000
    expect(converted.y).toBeCloseTo(1285526.375, 2); // y * 15.7 + 622000
  });

  test("金鸡湖街道坐标转换", () => {
    const point = {
      name: "星湖社区",
      street: "金鸡湖街道",
      x: 62986.667,
      y: 46313.292,
      count: 200,
    };

    const converted = convertCoordinates(point);

    // 验证转换结果
    expect(converted.x).toBeCloseTo(582336.002, 2); // x * 4.8 + 280000
    expect(converted.y).toBeCloseTo(1292542.734, 2); // y * 14.5 + 621000
  });

  test("批量测试转换", () => {
    const results = testCoordinateConversion();
    expect(results.length).toBe(3);
    expect(results.every((point) => point.x > 280000)).toBe(true);
    expect(results.every((point) => point.y > 620000)).toBe(true);
  });
});
