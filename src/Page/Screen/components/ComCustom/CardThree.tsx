import { memo, useEffect, useState } from "react";
import styles from "./index.module.less";
import threeIcon from "./img/three_icon.png";
import { Flex } from "antd";
import { ComCustomItemType } from "./types";
import { useHoverSummary } from "./useHoverSummary";
import { getPeopleGroupDescription } from "./categoryDescriptions";
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";
import { useNumberAnimation } from "./useNumberAnimation";

interface CardThreeProps {
  list: ComCustomItemType[];
  onHoverItem?: (content: string) => void;
}

/**
 * 卡片三组件
 * @param list 列表数据
 */
const CardThree = ({ list = [], onHoverItem }: CardThreeProps) => {
  // 存储实际值（不变）
  const [realValues, setRealValues] = useState<number[]>([]);

  // 初始化实际数据
  useEffect(() => {
    // 计算实际值
    const actualValues = list.map((item) => Number(item.value) || 0);
    // 保存实际值
    setRealValues(actualValues);
  }, [list]);

  // 使用自定义Hook处理数字动效
  const animatedValues = useNumberAnimation(realValues);

  // 定义获取项目内容的函数
  const getItemContent = (): string => {
    return list.map((l) => `${l.title}:${l.value}`)?.toString();
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
                  value={
                    Array.isArray(animatedValues) ? animatedValues[i] || 0 : 0
                  }
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
