import { useState, useEffect } from "react";

/**
 * 自定义Hook，用于处理数字动效
 * 每隔一定时间自动触发数字变化动画
 *
 * @param realValues 实际数值数组
 * @param interval 动画触发间隔，默认5000毫秒（5秒）
 * @param animationDelay 动画过渡延迟，默认50毫秒
 * @param decreaseFactor 数值暂时减少的比例因子，默认0.9（减少到90%）
 * @returns 当前显示的动画数值数组
 */
export const useNumberAnimation = (
  realValues: number[] | number,
  interval = 6000,
  animationDelay = 50,
  decreaseFactor = 0.9
) => {
  // 确保工作在数组上
  const valuesArray = Array.isArray(realValues) ? realValues : [realValues];

  // 当前显示的值
  const [animatedValues, setAnimatedValues] = useState<number[]>(valuesArray);

  // 初始化和更新值
  useEffect(() => {
    setAnimatedValues(valuesArray);
  }, [valuesArray]);

  // 设置定时器，定期触发动画
  useEffect(() => {
    if (valuesArray.length === 0) return;

    const timer = setInterval(() => {
      // 先设置为临时值（比实际值稍小），然后立即设回实际值，以触发动画
      // 临时值设为实际值的系数倍，这样变化不会太明显但能触发动画
      setAnimatedValues(
        valuesArray.map((val) => Math.max(0, Math.floor(val * decreaseFactor)))
      );

      // 短暂延迟后恢复实际值
      const restoreTimer = setTimeout(() => {
        setAnimatedValues([...valuesArray]);
      }, animationDelay);

      return () => clearTimeout(restoreTimer);
    }, interval);

    return () => clearInterval(timer);
  }, [valuesArray, interval, animationDelay, decreaseFactor]);

  // 如果输入是单个数值，返回单个数值；否则返回数组
  return Array.isArray(realValues) ? animatedValues : animatedValues[0];
};
