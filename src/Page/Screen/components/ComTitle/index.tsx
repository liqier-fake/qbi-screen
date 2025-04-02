import styles from "./index.module.less";
import { memo } from "react";
import classNames from "classnames";
interface ComTitleProps {
  title: string;
  type: "default" | "middle";
}

const ComTitle = ({ title, type = "default" }: ComTitleProps) => {
  return (
    <div className={classNames(styles.comTitle, styles[type], styles.default)}>
      {title}
    </div>
  );
};

export default memo(ComTitle);
