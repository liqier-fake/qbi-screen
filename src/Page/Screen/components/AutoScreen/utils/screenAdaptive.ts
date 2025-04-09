/**
 * 大屏自适应工具函数
 * 提供直接使用的计算缩放比例和位置的方法
 */
import React from "react";

/**
 * 计算大屏缩放比例和位置
 * @param designWidth 设计稿宽度，默认6144px
 * @param designHeight 设计稿高度，默认2292px
 * @param keepRatio 是否保持宽高比，默认true
 * @returns 包含缩放和位置信息的样式对象
 */
export function calculateScreenScale(
  designWidth: number = 6144,
  designHeight: number = 2292,
  keepRatio: boolean = false,
  autoCenter: boolean = false
): React.CSSProperties {
  // 获取当前视口宽高
  const clientWidth = document.documentElement.clientWidth;
  const clientHeight = document.documentElement.clientHeight;

  // 计算水平和垂直方向的缩放比例
  const scaleX = clientWidth / designWidth;
  const scaleY = clientHeight / designHeight;

  // 根据是否保持比例决定最终缩放值
  const finalScale = keepRatio ? Math.min(scaleX, scaleY) : scaleX;

  // 计算居中定位
  // 当保持比例时，需要计算缩放后内容的实际宽高，并居中定位
  if (keepRatio) {
    const scaledWidth = designWidth * finalScale;
    const scaledHeight = designHeight * finalScale;

    // 计算水平和垂直方向的偏移量，使内容居中
    const left = (clientWidth - scaledWidth) / 2;
    const top = autoCenter ? (clientHeight - scaledHeight) / 2 : 0;

    return {
      transform: `scale(${finalScale})`,
      transformOrigin: "left top",
      left: `${left}px`,
      top: `${top}px`,
      width: designWidth,
      height: designHeight,
    };
  } else {
    // 不保持比例时，使用不同的水平垂直缩放
    return {
      transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
      transformOrigin: "left top",
      width: designWidth,
      height: designHeight,
    };
  }
}

/**
 * 创建resize监听器，自动更新指定元素的缩放比例
 * @param element 要应用缩放的DOM元素
 * @param designWidth 设计稿宽度
 * @param designHeight 设计稿高度
 * @param keepRatio 是否保持宽高比
 * @returns 清理函数，用于移除监听器
 */
export function createResizeListener(
  element: HTMLElement,
  designWidth: number = 6144,
  designHeight: number = 2292,
  keepRatio: boolean = true,
  autoCenter: boolean = false
): () => void {
  // 更新元素样式的函数
  const updateElementStyle = () => {
    const style = calculateScreenScale(
      designWidth,
      designHeight,
      keepRatio,
      autoCenter
    );

    // 应用样式到元素
    Object.assign(element.style, {
      position: "absolute",
      transform: style.transform,
      transformOrigin: style.transformOrigin,
      left: style.left,
      top: style.top,
      width: `${style.width}px`,
      height: `${style.height}px`,
    });
  };

  // 初始更新
  updateElementStyle();

  // 添加窗口大小变化的监听器
  window.addEventListener("resize", updateElementStyle);

  // 返回清理函数
  return () => {
    window.removeEventListener("resize", updateElementStyle);
  };
}

export default {
  calculateScreenScale,
  createResizeListener,
};
