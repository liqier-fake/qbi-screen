import { memo } from "react";
import styles from "./index.module.less";
import threeIcon from "./img/three_icon.png";
import { Flex } from "antd";
import { ComCustomItemType } from "./types";

interface CardThreeProps {
  list: ComCustomItemType[];
  onHoverItem?: (content: string) => void;
}

/**
 * 卡片三组件
 * @param list 列表数据
 */
const CardThree = ({ list = [], onHoverItem }: CardThreeProps) => {
  return (
    <div className={styles.comCustom}>
      <div className={styles.cardThree}>
        {list.map((item, i) => (
          <div
            className={styles.listItem}
            key={i}
            onMouseEnter={() => onHoverItem?.(item.title)}
            onMouseLeave={() => {
              // onHoverItem?.("");
            }}
          >
            <img src={threeIcon} alt="" />
            <Flex justify="center" align="center">
              <span className={styles.title}>{item.value}</span>
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
