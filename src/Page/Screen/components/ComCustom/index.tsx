import { memo, useMemo } from "react";
import styles from "./index.module.less";
import partOneIcon1 from "./img/part_one_icon_1.png";
import partOneIcon2 from "./img/part_one_icon_2.png";
import partOneIcon3 from "./img/part_one_icon_3.png";
import partOneIcon4 from "./img/part_one_icon_4.png";

import threeIcon from "./img/three_icon.png";

interface ComData {
  type: "cardOne" | "cardTwo" | "cardThree";
  data: ComCustomType;
}
interface ComCustomType {
  list: ComCustomItemType[];
  total?: string;
}
interface ComCustomItemType {
  value: string | number;
  title: string;
  icon?: React.ReactNode;
}

const ComCustom = ({ type, data }: ComData) => {
  const { list = [], total } = data;

  const totalList = useMemo(() => {
    console.log(total, "total");
    return total?.split("");
  }, [total]);

  const icons = useMemo(() => {
    return [partOneIcon1, partOneIcon2, partOneIcon3, partOneIcon4];
  }, []);

  return (
    <div className={styles.comCustom}>
      {(() => {
        switch (type) {
          case "cardOne":
            return (
              <div className={styles.cardOne}>
                <div className={styles.flapItem}>
                  <span>总计</span>
                  <div className={styles.totalList}>
                    {totalList?.map((t) => (
                      <div className={styles.totalItem}>{t}</div>
                    ))}
                  </div>
                  <span>数据</span>
                </div>
                <div className={styles.iconList}>
                  {list.map((item, i) => (
                    <div className={styles.iconItem} key={i}>
                      <img src={icons[i % 4]} alt="图片" />
                      <div className={styles.iconItemContent}>
                        <span className={styles.iconItemTitle}>
                          {item.title}
                        </span>
                        <span className={styles.iconItemValue}>
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          case "cardTwo":
            return (
              <div className={styles.cardTwo}>
                {list.map((item, i) => (
                  <div className={styles.showItemContent} key={i}>
                    <span className={styles.showItemTitle}>{item.value}</span>
                    <span className={styles.showItemValue}>{item.title}</span>
                  </div>
                ))}
              </div>
            );
          case "cardThree":
            return (
              <div className={styles.cardThree}>
                {list.map((item, i) => (
                  <div className={styles.listItem} key={i}>
                    <img src={threeIcon} alt="" />
                    <span className={styles.title}>{item.title}</span>
                    <span className={styles.value}>{item.value}</span>
                  </div>
                ))}
              </div>
            );
          default:
            return null;
        }
      })()}
    </div>
  );
};

export default memo(ComCustom);
