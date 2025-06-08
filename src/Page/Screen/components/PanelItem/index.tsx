import ComTitle from "../ComTitle";
import styles from "./index.module.less";

interface PanelItemProps {
  title: string;
  render: React.ReactNode;
  rightIcon?: React.ReactNode; // 新增：右侧icon支持
}
const PanelItem = ({ title, render, rightIcon }: PanelItemProps) => {
  return (
    <div className={styles.panelItem}>
      <ComTitle
        key={title}
        title={title}
        type={"default"}
        rightIcon={rightIcon}
      />
      <div className={styles.panelItemContent}>{render}</div>
    </div>
  );
};

export default PanelItem;
