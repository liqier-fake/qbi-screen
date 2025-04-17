import React, { useState, useEffect, useMemo } from "react";
import styles from "./index.module.less";

/**
 * 数字翻牌效果组件属性接口
 */
interface FlipNumberProps {
  /** 要显示的数字 */
  value: number;
  /** 数字长度(位数)，不足将在前面补0 */
  length?: number;
  /** 翻转动画持续时间(毫秒) */
  duration?: number;
  /** 相邻数字翻转的延迟时间(毫秒) */
  delay?: number;
  /** 字体大小 */
  fontSize?: number;
  /** 卡片宽度 */
  width?: number;
  /** 卡片高度 */
  height?: number;
  /** 自定义类名 */
  className?: string;
  /** 字体颜色 */
  color?: string;
  /** 卡片背景色 */
  backgroundColor?: string;
}

/**
 * 单个数字翻牌组件属性接口
 */
interface SingleFlipProps {
  /** 当前数字 */
  currentNum: number;
  /** 上一个数字 */
  prevNum: number | null;
  /** 翻转动画持续时间(毫秒) */
  duration: number;
  /** 延迟时间(毫秒) */
  delay: number;
  /** 是否需要翻转 */
  isFlipping: boolean;
  /** 样式相关参数 */
  style: {
    fontSize: number;
    width: number;
    height: number;
    color: string;
    backgroundColor: string;
  };
}

/**
 * 单个数字翻牌组件
 * 实现单个数字的折叠翻转动画效果
 */
const SingleFlip: React.FC<SingleFlipProps> = ({
  currentNum,
  prevNum,
  duration,
  delay,
  isFlipping,
  style,
}) => {
  // 控制动画状态
  const [isAnimating, setIsAnimating] = useState(false);

  // 当数字变化时触发动画
  useEffect(() => {
    if (isFlipping) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [currentNum, isFlipping, duration]);

  // 上半部分样式
  const topHalfStyle = {
    fontSize: `${style.fontSize}px`,
    width: `${style.width}px`,
    height: `${style.height / 2}px`,
    lineHeight: `${style.height}px`,
    color: style.color,
    backgroundColor: style.backgroundColor,
    transitionDuration: `${duration / 2}ms`,
    transitionDelay: `${delay}ms`,
  };

  // 下半部分样式
  const bottomHalfStyle = {
    ...topHalfStyle,
    transitionDelay: `${delay + duration / 2}ms`,
  };

  // 当前数字和前一个数字
  const current = currentNum;
  const previous = prevNum !== null ? prevNum : 0;

  return (
    <div
      className={styles.flipper}
      style={{ width: style.width, height: style.height }}
    >
      {/* 静态上半部分(当前数字) */}
      <div className={styles.staticTop} style={topHalfStyle}>
        {current}
      </div>

      {/* 静态下半部分(当前数字) */}
      <div className={styles.staticBottom} style={bottomHalfStyle}>
        {current}
      </div>

      {/* 动画上半部分(从前一个数字翻到当前数字) */}
      {isAnimating && (
        <>
          <div
            className={`${styles.flipTop} ${styles.flippingTop}`}
            style={topHalfStyle}
          >
            {previous}
          </div>

          <div
            className={`${styles.flipBottom} ${styles.flippingBottom}`}
            style={bottomHalfStyle}
          >
            {current}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * 数字翻牌组件
 * 将数字拆分为单个数字并应用翻转效果
 */
const FlipNumber: React.FC<FlipNumberProps> = ({
  value,
  length = 1,
  duration = 500,
  delay = 100,
  fontSize = 36,
  width = 40,
  height = 60,
  className = "",
  color = "#fff",
  backgroundColor = "#1a1a1a",
}) => {
  // 存储上一次的数值，用于对比变化
  const [prevValue, setPrevValue] = useState<number | null>(null);

  // 当前数值字符串，补零处理
  const valueStr = useMemo(() => {
    return value.toString().padStart(length, "0");
  }, [value, length]);

  // 上一个数值字符串，补零处理
  const prevValueStr = useMemo(() => {
    return prevValue !== null
      ? prevValue.toString().padStart(length, "0")
      : null;
  }, [prevValue, length]);

  // 数值变化时更新上一个值
  useEffect(() => {
    // 初始化时不触发动画
    if (prevValue !== null) {
      setPrevValue(value);
    } else {
      // 组件首次渲染时设置初始值
      setPrevValue(value);
    }
  }, [value]);

  // 公共样式参数
  const styleParams = {
    fontSize,
    width,
    height,
    color,
    backgroundColor,
  };

  return (
    <div className={`${styles.flipNumberContainer} ${className}`}>
      {valueStr.split("").map((digit, index) => {
        // 判断这个位置的数字是否发生了变化
        const digitChanged = prevValueStr && prevValueStr[index] !== digit;
        const prevDigit = prevValueStr ? parseInt(prevValueStr[index]) : null;

        return (
          <SingleFlip
            key={`digit-${index}`}
            currentNum={parseInt(digit)}
            prevNum={prevDigit}
            duration={duration}
            delay={index * delay}
            isFlipping={!!digitChanged}
            style={styleParams}
          />
        );
      })}
    </div>
  );
};

export default FlipNumber;
