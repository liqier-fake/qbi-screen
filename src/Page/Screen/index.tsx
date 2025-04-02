import { useMemo } from "react";
import ComTitle from "./components/ComTitle";
import styles from "./index.module.less";
import { LeftRenderListType } from "./common.ts";
import classNames from "classnames";
const Screen = () => {
  const leftRenderList: LeftRenderListType[] = useMemo(
    () => [
      {
        title: "数据来源",
        type: "default",
        render: `11`,
      },
      {
        title: "民有所呼 我有所为",
        type: "default",
        render: "default",
      },
      {
        title: "二级趋势预测",
        type: "default",
        render: "default",
      },
      {
        title: "攻坚重点",
        type: "default",
        render: "default",
      },
      {
        title: "二级分类",
        type: "default",
        render: "default",
      },
      {
        title: "三级趋势与预测",
        type: "default",
        render: "default",
      },
    ],
    []
  );

  const rightRenderList: LeftRenderListType[] = useMemo(
    () => [
      {
        title: "人群画像",
        type: "default",
        render: `11`,
      },
      {
        title: "治理画像",
        type: "default",
        render: `11`,
      },
    ],
    []
  );
  return (
    <div className={styles.screen}>
      {/* 标题 */}
      <div className={styles.header}>
        <span className={styles.title}>苏州工业园区“智汇民意”民情分析平台</span>
      </div>
      {/* 内容 */}
      <div className={styles.contentWrap}>
        {/* 左侧 */}
        <div className={styles.left}>
          {
            <div className={styles.left}>
              {leftRenderList.map((item) => (
                <div className={styles.leftItem} key={item.title}>
                  <ComTitle
                    key={item.title}
                    title={item.title}
                    type={"default"}
                  />
                  <div className={styles.leftItemContent}>{item.render}</div>
                </div>
              ))}
            </div>
          }
        </div>
        {/* 中间 */}
        <div className={styles.center}>{/* 内容 */}</div>
        {/* 右侧 */}
        <div className={styles.right}>
          {rightRenderList.map((item) => (
            <div className={styles.rightItem} key={item.title}>
              <ComTitle key={item.title} title={item.title} type={"middle"} />
              <div className={styles.rightItemContent}>{item.render}</div>
            </div>
          ))}
          <div
            className={classNames(styles.rightItem, styles.rightItemSpecial)}
          >
            <div className={styles.rightItemLeft}>
              <ComTitle title="关注人群重点诉求" type={"default"} />
              <div className={styles.rightItemLeftItem}></div>
            </div>

            <div className={styles.rightItemRight}>
              <ComTitle title="词云" type={"default"} />
              <div className={styles.rightItemRightItem}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Screen;
