import React, { useMemo, useRef, useEffect, useState } from "react";
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
 * 获取随机位置，确保气泡完全在容器内
 */
const getRandomPosition = (
  containerWidth: number,
  containerHeight: number,
  itemSize: number
): { x: number; y: number } => {
  // 考虑气泡尺寸，计算有效区域
  const effectiveWidth = containerWidth - itemSize;
  const effectiveHeight = containerHeight - itemSize;

  // 确保位置在有效区域内
  const x = itemSize / 2 + Math.random() * effectiveWidth;
  const y = itemSize / 2 + Math.random() * effectiveHeight;

  return { x, y };
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
  maxSize = 100,
  minSize = 60,
  moveRange = 10,
  padding = 15,
  fontSizeRatio = 0.16,
  onItemClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 400,
    height: 400,
  });

  // 监听容器尺寸变化
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          setContainerDimensions({ width, height });
        }
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const bubbleStyles = useMemo(() => {
    if (!data?.length) return [];

    const effectiveWidth = Math.max(containerDimensions.width, 100);
    const effectiveHeight = Math.max(containerDimensions.height, 100);

    // 按值排序，确保大的在中间
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const maxValue = Math.max(...data.map((item) => item.value));

    // 创建一个Set来存储已使用的位置
    const usedPositions: Array<{ x: number; y: number; size: number }> = [];

    return sortedData.map((item, index) => {
      // 直接使用相对值计算大小
      const sizeRatio = item.value / maxValue;
      const size = Math.max(minSize, sizeRatio * maxSize);

      let position: { x: number; y: number };
      let attempts = 0;
      const maxAttempts = 50;

      // 尝试找到不重叠的位置
      do {
        position = getRandomPosition(effectiveWidth, effectiveHeight, size);
        attempts++;

        // 检查是否与已有气泡重叠
        const hasOverlap = usedPositions.some((usedPos) => {
          const dx = position.x - usedPos.x;
          const dy = position.y - usedPos.y;
          const minDistance = (size + usedPos.size) * 0.35;
          return Math.sqrt(dx * dx + dy * dy) < minDistance;
        });

        if (!hasOverlap || attempts >= maxAttempts) {
          usedPositions.push({ ...position, size });
          break;
        }
      } while (attempts < maxAttempts);

      // 获取颜色
      const backgroundColor = getColorByValue(item.value, 0, maxValue);

      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        padding: `${padding}px`,
        fontSize: `${size * fontSizeRatio}px`,
        backgroundColor,
        color: "#ffffff",
        "--move-range": `${Math.min(moveRange, size * 0.1)}px`,
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
  }, [
    data,
    maxSize,
    minSize,
    moveRange,
    padding,
    fontSizeRatio,
    containerDimensions,
  ]);

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
