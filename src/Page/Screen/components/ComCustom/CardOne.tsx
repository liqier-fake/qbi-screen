import { memo, useMemo } from "react";
import styles from "./index.module.less";
import partOneIcon1 from "./img/part_one_icon_1.png";
import partOneIcon2 from "./img/part_one_icon_2.png";
import partOneIcon3 from "./img/part_one_icon_3.png";
import partOneIcon4 from "./img/part_one_icon_4.png";
import { ComCustomItemType } from "./types";

interface CardOneProps {
  list: ComCustomItemType[];
  total?: string;
}

/**
 * 卡片一组件
 * @param list 列表数据
 * @param total 总计数据
 */
const CardOne = ({ list = [], total }: CardOneProps) => {
  // 将总计数字拆分成单个字符
  const totalList = useMemo(() => {
    return total?.split("");
  }, [total]);

  // 图标列表
  const icons = useMemo(() => {
    return [partOneIcon1, partOneIcon2, partOneIcon3, partOneIcon4];
  }, []);

  return (
    <div className={styles.comCustom}>
      <div className={styles.cardOne}>
        <div className={styles.flapItem}>
          <span>总计</span>
          <div className={styles.totalList}>
            {totalList?.map((t, index) => (
              <div className={styles.totalItem} key={index}>
                {t}
              </div>
            ))}
          </div>
          <span>数据</span>
        </div>
        <div className={styles.iconList}>
          {list.map((item, i) => (
            <div className={styles.iconItem} key={i}>
              <img src={icons[i % 4]} alt="图片" />
              <div className={styles.iconItemContent}>
                <span className={styles.iconItemTitle}>{item.title}</span>
                <span className={styles.iconItemValue}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(CardOne);
