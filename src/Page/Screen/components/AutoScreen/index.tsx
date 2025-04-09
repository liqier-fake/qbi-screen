import React, { useEffect, useState, ReactNode } from "react";
import styles from "./index.module.less";
import { calculateScreenScale } from "./utils/screenAdaptive";

interface ScreenWrapperProps {
  /**
   * 子组件，通常是大屏内容
   */
  children: ReactNode;
  /**
   * 设计稿宽度，默认为6144px
   */
  designWidth?: number;
  /**
   * 设计稿高度，默认为2292px (包含头部112px和内容2180px)
   */
  designHeight?: number;
  /**
   * 是否保持宽高比，默认为true
   */
  keepRatio?: boolean;
  /**
   * 是否自动居中，默认为true
   */
  autoCenter?: boolean;
}

/**
 * 大屏自适应包装组件
 * 使用transform scale实现自适应，保持原始比例
 */
const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  designWidth = 6144,
  designHeight = 2292,
  keepRatio = true,
  autoCenter = true,
}) => {
  // 计算后的宽高和位置
  const [screenStyle, setScreenStyle] = useState<React.CSSProperties>({});

  // 计算缩放比例和位置
  const updateScreenStyle = () => {
    // 直接使用utils中的方法计算样式
    const style = calculateScreenScale(
      designWidth,
      designHeight,
      keepRatio,
      autoCenter
    );
    setScreenStyle(style);
  };

  // 组件挂载和窗口大小变化时重新计算缩放
  useEffect(() => {
    updateScreenStyle();

    // 监听窗口大小变化
    window.addEventListener("resize", updateScreenStyle);

    // 清理函数
    return () => {
      window.removeEventListener("resize", updateScreenStyle);
    };
  }, [designWidth, designHeight, keepRatio, autoCenter]);

  return (
    <div className={styles.screenWrapper}>
      {/* 原始尺寸的内容容器，通过transform缩放 */}
      <div className={styles.screenContent} style={screenStyle}>
        {children}
      </div>
    </div>
  );
};

export default ScreenWrapper;
