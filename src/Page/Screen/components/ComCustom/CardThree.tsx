import { memo } from "react";
import styles from "./index.module.less";
import threeIcon from "./img/three_icon.png";
import { Flex } from "antd";
import { ComCustomItemType } from "./types";
import { useHoverSummary } from "./useHoverSummary";
import { getPeopleGroupDescription } from "./categoryDescriptions";
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";
interface CardThreeProps {
  list: ComCustomItemType[];
  onHoverItem?: (content: string) => void;
}

/**
 * 卡片三组件
 * @param list 列表数据
 */
const CardThree = ({ list = [], onHoverItem }: CardThreeProps) => {
  // 定义获取项目内容的函数
  const getItemContent = (item: ComCustomItemType): string => {
    return `${item.title}群体有${item.value}人`;
  };

  // 使用自定义Hook处理hover事件
  const { onMouseEnter, onMouseLeave } = useHoverSummary(
    onHoverItem,
    getItemContent,
    getPeopleGroupDescription
  );

  return (
    <div className={styles.comCustom}>
      <div className={styles.cardThree}>
        {list.map((item, i) => (
          <div
            className={styles.listItem}
            key={i}
            onMouseEnter={() => onMouseEnter(item)}
            onMouseLeave={onMouseLeave}
          >
            <img src={threeIcon} alt="" />
            <Flex justify="center" align="center">
              <span className={styles.title}>
                <Odometer
                  value={Number(item.value)}
                  format="(d)"
                  duration={1000}
                />
              </span>
              <span className={styles.value}>人</span>
            </Flex>
            <span className={styles.value}>{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(CardThree);
