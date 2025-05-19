import { memo, useEffect, useMemo, useState } from "react";
import styles from "./index.module.less";
import partOneIcon1 from "./img/part_one_icon_1.png";
import partOneIcon2 from "./img/part_one_icon_2.png";
import partOneIcon3 from "./img/part_one_icon_3.png";
import partOneIcon4 from "./img/part_one_icon_4.png";
import { ComCustomItemType } from "./types";
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";

/**
 * 卡片一组件
 */
const CardOne = memo(
  ({
    list = [],
    total = "0",
  }: {
    list: ComCustomItemType[];
    total?: string;
  }) => {
    // 存储拆分后的总计数字
    const [totalDigits, setTotalDigits] = useState<number[]>([0]);

    // 图标列表
    const icons = useMemo(
      () => [partOneIcon1, partOneIcon2, partOneIcon3, partOneIcon4],
      []
    );

    // 将任意值转为数字
    const getNumericValue = (value: string | number): number => {
      return typeof value === "number"
        ? value
        : parseInt(String(value), 10) || 0;
    };

    // 初始化总计数据
    useEffect(() => {
      const value = getNumericValue(total);
      setTotalDigits(
        value
          .toString()
          .split("")
          .map((d) => parseInt(d, 10))
      );
    }, [total]);

    return (
      <div className={styles.comCustom}>
        <div className={styles.cardOne}>
          {/* 总计部分 */}
          <div className={styles.flapItem}>
            <span>总计</span>
            <div className={styles.totalList}>
              {totalDigits.map((digit, index) => (
                <div className={styles.totalItem} key={index}>
                  <Odometer value={digit} format="d" duration={1000} />
                </div>
              ))}
            </div>
            <span>数据</span>
          </div>

          {/* 图标列表部分 */}
          <div className={styles.iconList}>
            {list.map((item, i) => (
              <div className={styles.iconItem} key={i}>
                <img src={icons[i % 4]} alt="图标" />
                <div className={styles.iconItemContent}>
                  <span className={styles.iconItemTitle}>{item.title}</span>
                  <span className={styles.iconItemValue}>
                    <Odometer
                      value={getNumericValue(item.value)}
                      format="(d)"
                      duration={1000}
                    />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

export default CardOne;
