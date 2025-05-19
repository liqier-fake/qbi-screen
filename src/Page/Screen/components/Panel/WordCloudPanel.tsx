/**
 * 词云面板组件
 */
import React, { memo, useEffect, useState } from "react";
import Cloud from "../Cloud";
import styles from "../../index.module.less";
import PanelItem from "../PanelItem";
import { apiGetKeyWords, TimeRange } from "../../api";
import { ScreenDataType } from "../../mock";
const WordCloudPanel: React.FC<{
  timeRange: TimeRange;
}> = ({ timeRange }) => {
  const [data, setData] = useState<ScreenDataType["wordCloudData"]>([]);

  useEffect(() => {
    // 词云数据
    const getKeyWordsData = async () => {
      const {
        data: { data: keyWordsData },
      } = await apiGetKeyWords({
        time_range: timeRange,
      });
      console.log(keyWordsData, "keyWordsData");
      setData(keyWordsData || []);
    };
    getKeyWordsData();
  }, [timeRange]);

  return (
    <PanelItem
      title="词云"
      render={
        <div className={styles.cloud}>
          <Cloud
            data={
              data
                ?.map(({ category, count }) => {
                  return {
                    name: category,
                    value: count,
                  };
                })
                ?.splice(0, 15) || []
            }
          ></Cloud>
        </div>
      }
    />
  );
};

export default memo(WordCloudPanel);
