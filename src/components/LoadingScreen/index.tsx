import React from "react";
import "./index.less";

/**
 * 加载屏幕组件
 * 显示带有科技感的加载动画和文字
 * @param props 组件属性
 * @param props.text 显示的加载文本，默认为"加载中..."
 */
const LoadingScreen: React.FC<{ text?: string }> = ({ text = "加载中..." }) => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        {/* 加载动画 */}
        <div className="loading-spinner">
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
        </div>

        {/* 加载文字 */}
        <div className="loading-text">{text}</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
