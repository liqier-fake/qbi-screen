import styles from "./index.module.less";
import { memo } from "react";
import classNames from "classnames";
interface ComTitleProps {
  title: string;
  type: "default" | "middle";
  rightIcon?: React.ReactNode; // 新增：右侧icon支持
}

const ComTitle = ({ title, type = "default", rightIcon }: ComTitleProps) => {
  return (
    <div className={classNames(styles.comTitle, styles[type], styles.default)}>
      <span>{title}</span>
      {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
    </div>
  );
};

export default memo(ComTitle);
