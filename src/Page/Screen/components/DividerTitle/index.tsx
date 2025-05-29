/**
 * 带装饰的分隔标题组件
 */
import React from "react";
import styles from "./index.module.less";

interface DividerTitleProps {
  /**
   * 标题文本
   */
  title: string;
  /**
   * 自定义类名
   */
  className?: string;
}

const DividerTitle: React.FC<DividerTitleProps> = ({ title, className }) => {
  return <div className={`${styles.divider} ${className || ""}`}>{title}</div>;
};

export default DividerTitle;
