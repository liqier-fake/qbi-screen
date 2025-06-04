import React, { useMemo, useRef } from "react";
import styles from "./index.module.less";

// 定义词云项的数据结构
interface CloudItem {
  name: string;
  value: number;
}

/**
 * 获取基于数值的颜色
 * @param value - 当前值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 颜色值
 */
const getColorByValue = (value: number, min: number, max: number): string => {
  const colors = [
    // { threshold: 0.2, color: "#8EC5FC" }, // 最小值区间
    // { threshold: 0.4, color: "#6284FF" }, // 较小值区间
    // { threshold: 0.6, color: "#4158D0" }, // 中等值区间
    // { threshold: 0.8, color: "#3B4FD8" }, // 较大值区间
    // { threshold: 1, color: "#0093E9" }, // 最大值区间
    { threshold: 0.2, color: "#3ad4fc" }, // 最小值区间
    { threshold: 0.4, color: "#003065" }, // 较小值区间
    { threshold: 0.6, color: "#195d7e" }, // 中等值区间
    { threshold: 0.8, color: "#3B4FD8" }, // 较大值区间
    { threshold: 1, color: "#0093E9" }, // 最大值区间
  ];

  const normalizedValue = (value - min) / (max - min);

  for (const { threshold, color } of colors) {
    if (normalizedValue <= threshold) return color;
  }
  return colors[colors.length - 1].color;
};

/**
 * 获取随机位置（百分比），确保气泡完全在容器内，更均匀分布
 */
const getRandomPosition = (
  itemSizePercent: number,
  sizeRatio: number,
  usedPositions: Array<{ x: number; y: number; size: number }>,
  attempts: number
): { x: number; y: number } => {
  // 减小边距，使用气泡尺寸的70%作为边距
  const safeMargin = itemSizePercent * 0.7;
  const minPos = safeMargin;
  const maxPos = 100 - safeMargin;
  const centerX = 50;
  const centerY = 50;

  // 初始化最佳位置
  let bestPosition: { x: number; y: number } | null = null;
  let maxMinDistance = -1;

  // 尝试多个位置，选择最优的（离其他气泡最远的位置）
  for (let i = 0; i < 8; i++) {
    let candidateX = 0;
    let candidateY = 0;

    if (sizeRatio > 0.7 && attempts < 20) {
      // 最大气泡优先尝试中心位置，减小中心区域范围
      const range = Math.min(15, maxPos - minPos);
      candidateX = centerX + (Math.random() - 0.5) * range;
      candidateY = centerY + (Math.random() - 0.5) * range;
    } else {
      // 其他气泡在整个区域尝试，包括边缘
      // 使用象限划分，确保均匀分布
      const quadrant = Math.floor(Math.random() * 4); // 0-3表示四个象限
      const rangeX = maxPos - minPos;
      const rangeY = maxPos - minPos;

      // 增加边缘位置的权重
      const edgeWeight = Math.random() < 0.6; // 60%的概率选择靠近边缘的位置

      switch (quadrant) {
        case 0: // 左上
          candidateX =
            minPos + (edgeWeight ? rangeX * 0.3 : rangeX * 0.5) * Math.random();
          candidateY =
            minPos + (edgeWeight ? rangeY * 0.3 : rangeY * 0.5) * Math.random();
          break;
        case 1: // 右上
          candidateX =
            centerX +
            (edgeWeight ? rangeX * 0.7 : rangeX * 0.5) * Math.random();
          candidateY =
            minPos + (edgeWeight ? rangeY * 0.3 : rangeY * 0.5) * Math.random();
          break;
        case 2: // 左下
          candidateX =
            minPos + (edgeWeight ? rangeX * 0.3 : rangeX * 0.5) * Math.random();
          candidateY =
            centerY +
            (edgeWeight ? rangeY * 0.7 : rangeY * 0.5) * Math.random();
          break;
        default: // 右下
          candidateX =
            centerX +
            (edgeWeight ? rangeX * 0.7 : rangeX * 0.5) * Math.random();
          candidateY =
            centerY +
            (edgeWeight ? rangeY * 0.7 : rangeY * 0.5) * Math.random();
          break;
      }
    }

    // 确保在安全范围内
    candidateX = Math.max(minPos, Math.min(maxPos, candidateX));
    candidateY = Math.max(minPos, Math.min(maxPos, candidateY));

    // 计算与其他气泡的最小距离
    let minDistance = Number.MAX_VALUE;
    for (const pos of usedPositions) {
      const dx = candidateX - pos.x;
      const dy = candidateY - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      minDistance = Math.min(minDistance, distance);
    }

    // 如果这是最好的位置（离其他气泡最远），就保存下来
    if (minDistance > maxMinDistance) {
      maxMinDistance = minDistance;
      bestPosition = { x: candidateX, y: candidateY };
    }
  }

  // 如果找到了合适的位置，使用它；否则使用安全的默认位置
  return bestPosition || { x: centerX, y: centerY };
};

// 组件Props类型定义
interface CloudProps {
  data: CloudItem[];
  maxSize?: number;
  minSize?: number;
  moveRange?: number;
  padding?: number;
  fontSizeRatio?: number;
  // 点击事件回调
  onItemClick?: (params: { word: string; count: number }) => void;
}

/**
 * 云泡泡组件
 * @param props - 组件属性
 */
const Cloud: React.FC<CloudProps> = ({
  data,
  maxSize = 90,
  minSize = 50,
  moveRange = 10,
  padding = 0,
  fontSizeRatio = 0.16,
  onItemClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const bubbleStyles = useMemo(() => {
    if (!data?.length) return [];

    // 按值排序，确保大的在中间
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const maxValue = Math.max(...data.map((item) => item.value));

    // 创建一个数组来存储已使用的位置（百分比）
    const usedPositions: Array<{ x: number; y: number; size: number }> = [];

    return sortedData.map((item, index) => {
      // 直接使用相对值计算大小（像素值）
      const sizeRatio = item.value / maxValue;
      const size = Math.max(minSize, sizeRatio * maxSize);

      // 计算气泡相对于容器的百分比大小
      const sizePercent = (size / 400) * 100; // 假设容器大概400px作为基准

      let position: { x: number; y: number };
      let attempts = 0;
      const maxAttempts = 50;

      // 尝试找到不重叠的位置
      do {
        position = getRandomPosition(
          sizePercent,
          sizeRatio,
          usedPositions,
          attempts
        );
        attempts++;

        // 检查是否与已有气泡重叠
        const hasOverlap = usedPositions.some((usedPos) => {
          const dx = position.x - usedPos.x;
          const dy = position.y - usedPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          // 减小间距，让气泡可以更靠近
          const minDistance = (sizePercent + usedPos.size) * 0.35;
          return distance < minDistance;
        });

        if (!hasOverlap || attempts >= maxAttempts) {
          usedPositions.push({ ...position, size: sizePercent });
          break;
        }
      } while (attempts < maxAttempts);

      // 获取颜色
      const backgroundColor = getColorByValue(item.value, 0, maxValue);

      return {
        width: `${size}px`, // 改回像素值
        height: `${size}px`, // 改回像素值
        left: `${position.x}%`,
        top: `${position.y}%`,
        padding: `${padding}px`,
        fontSize: `${size * fontSizeRatio}px`, // 改回像素值
        backgroundColor,
        color: "#ffffff",
        "--move-range": `${Math.min(moveRange, size * 0.1)}px`, // 改回像素值
        "--animation-delay": `${-(Math.random() * 15)}s`,
        zIndex: sortedData.length - index,
        opacity: 0.9,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column" as const,
        textAlign: "center" as const,
        transition: "all 0.3s ease-in-out",
        wordBreak: "keep-all" as const,
        whiteSpace: "nowrap" as const,
        overflow: "visible",
        pointerEvents: "auto",
        userSelect: "none" as const,
      } as React.CSSProperties;
    });
  }, [data, maxSize, minSize, moveRange, padding, fontSizeRatio]);

  if (!data?.length) return null;

  return (
    <div ref={containerRef} className={styles.cloudContainer}>
      {bubbleStyles.map((style, index) => (
        <div
          key={data[index].name}
          className={styles.cloudItem}
          style={style}
          title={`${data[index].name}: ${data[index].value}`}
          onClick={() => {
            if (onItemClick && data[index].value > 0) {
              onItemClick({
                word: data[index].name,
                count: data[index].value,
              });
            }
          }}
        >
          <div style={{ fontSize: "inherit" }}>{data[index].name}</div>
          <div
            style={{
              fontSize: "0.85em",
              opacity: 0.85,
              marginTop: "0.2em",
            }}
          >
            {data[index].value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Cloud;
