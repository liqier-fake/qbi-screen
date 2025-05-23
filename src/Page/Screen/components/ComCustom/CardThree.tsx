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
import { EnvironmentOutlined } from "@ant-design/icons";

// 导入地图选择类型枚举
import { MapSelectTypeEnum } from "../../components/Chart/Map";

interface CardThreeProps {
  list: ComCustomItemType[];
  onHoverItem?: (content: string) => void;
  onIconClick?: () => void;
  currentSelectType?: MapSelectTypeEnum; // 添加当前选择类型参数
}

/**
 * 卡片三组件
 * @param list 列表数据
 * @param onHoverItem hover回调
 * @param onIconClick 图标点击回调
 */
const CardThree = ({
  list = [],
  onHoverItem,
  onIconClick,
  currentSelectType,
}: CardThreeProps) => {
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
        {list.map((item, i) => {
          const showIcon = item.title === "新就业群体";

          return (
            <div
              className={styles.listItem}
              key={i}
              onMouseEnter={() => onMouseEnter(item)}
              onMouseLeave={onMouseLeave}
              style={{ position: "relative" }}
            >
              {showIcon && (
                <EnvironmentOutlined
                  className={styles.clickableIcon}
                  style={{
                    fontSize: 20,
                    color:
                      currentSelectType === MapSelectTypeEnum.number
                        ? "grey"
                        : "#0cb4f0",
                  }}
                  onClick={onIconClick}
                />
              )}
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
                {/* <span className={styles.value}>人</span> */}
              </Flex>
              <span className={styles.value}>{item.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(CardThree);
