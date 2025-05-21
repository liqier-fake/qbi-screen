import { memo, useEffect, useMemo, useState } from "react";
import styles from "./index.module.less";
import partOneIcon1 from "./img/part_one_icon_1.png";
import partOneIcon2 from "./img/part_one_icon_2.png";
import partOneIcon3 from "./img/part_one_icon_3.png";
import partOneIcon4 from "./img/part_one_icon_4.png";
import { ComCustomItemType } from "./types";
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";
import { useNumberAnimation } from "./useNumberAnimation";

/**
 * 卡片一组件
 * 水平布局，CSS动画实现自动滚动，支持悬停暂停
 */
const CardOne = memo(
  ({
    list = [],
    total = "0",
  }: {
    list: ComCustomItemType[];
    total?: string;
  }) => {
    // 将任意值转为数字
    const getNumericValue = (value: string | number): number => {
      return typeof value === "number"
        ? value
        : parseInt(String(value), 10) || 0;
    };

    // 计算实际值
    const [realTotalDigits, setRealTotalDigits] = useState<number[]>([0]);
    const [realItemValues, setRealItemValues] = useState<number[]>([]);

    // 动画暂停状态
    const [isPaused, setIsPaused] = useState(false);

    // 初始化实际数据
    useEffect(() => {
      // 计算实际值
      const value = getNumericValue(total);
      const digits = value
        .toString()
        .split("")
        .map((d) => parseInt(d, 10));

      const actualItemValues = list.map((item) => getNumericValue(item.value));

      // 保存实际值
      setRealTotalDigits(digits);
      setRealItemValues(actualItemValues);
    }, [total, list]);

    // 使用自定义Hook处理数字动效
    const totalDigits = useNumberAnimation(realTotalDigits);
    const itemValues = useNumberAnimation(realItemValues);

    // 图标列表
    const icons = useMemo(
      () => [partOneIcon1, partOneIcon2, partOneIcon3, partOneIcon4],
      []
    );

    // 计算是否需要滚动动画
    const needScroll = list.length > 6; // 一行3个，超过2行才需要滚动

    // 鼠标事件处理函数
    const handleMouseEnter = () => {
      if (needScroll) {
        setIsPaused(true);
      }
    };

    const handleMouseLeave = () => {
      if (needScroll) {
        setIsPaused(false);
      }
    };

    return (
      <div className={styles.comCustom}>
        <div className={styles.cardOne}>
          {/* 总计部分 */}
          <div className={styles.flapItem}>
            <span>总计</span>
            <div className={styles.totalList}>
              {totalDigits && Array.isArray(totalDigits)
                ? totalDigits.map((digit, idx) => (
                    <div className={styles.totalItem} key={idx}>
                      <Odometer value={digit} format="d" duration={1000} />
                    </div>
                  ))
                : null}
            </div>
            <span>数据</span>
          </div>

          {/* 图标列表容器 */}
          <div
            className={`${styles.iconListContainer} ${
              needScroll ? styles.needScroll : ""
            } ${isPaused ? styles.paused : ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* 为了实现无限滚动效果，创建两个相同的列表 */}
            <div className={styles.scrollContent}>
              {/* 原始列表 */}
              <div className={styles.iconList}>
                {list.map((item, i) => (
                  <div className={styles.iconItem} key={i}>
                    <img src={icons[i % 4]} alt="图标" />
                    <div className={styles.iconItemContent}>
                      <span className={styles.iconItemTitle}>{item.title}</span>
                      <span className={styles.iconItemValue}>
                        <Odometer
                          value={
                            itemValues && Array.isArray(itemValues)
                              ? itemValues[i] || 0
                              : 0
                          }
                          format="(d)"
                          duration={1000}
                        />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 仅当需要滚动时，复制一份列表用于实现无缝循环效果 */}
              {needScroll && (
                <div className={styles.iconList}>
                  {list.map((item, i) => (
                    <div className={styles.iconItem} key={i + "clone"}>
                      <img src={icons[i % 4]} alt="图标" />
                      <div className={styles.iconItemContent}>
                        <span className={styles.iconItemTitle}>
                          {item.title}
                        </span>
                        <span className={styles.iconItemValue}>
                          <Odometer
                            value={
                              itemValues && Array.isArray(itemValues)
                                ? itemValues[i] || 0
                                : 0
                            }
                            format="(d)"
                            duration={1000}
                          />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default CardOne;
