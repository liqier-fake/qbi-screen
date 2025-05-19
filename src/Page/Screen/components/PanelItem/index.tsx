import ComTitle from "../ComTitle";
import styles from "./index.module.less";

interface PanelItemProps {
  title: string;
  render: React.ReactNode;
}
const PanelItem = ({ title, render }: PanelItemProps) => {
  return (
    <div className={styles.panelItem}>
      <ComTitle key={title} title={title} type={"default"} />
      <div className={styles.panelItemContent}>{render}</div>
    </div>
  );
};

export default PanelItem;
