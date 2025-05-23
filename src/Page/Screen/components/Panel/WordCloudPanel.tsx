/**
 * 词云面板组件
 */
import React, { memo, useEffect, useMemo, useState } from "react";
import Cloud from "../Cloud";
import WorkListWithDetail from "../WorkListWithDetail";
import styles from "../../index.module.less";
import PanelItem from "../PanelItem";
import { apiGetKeyWords, TimeRange } from "../../api";
import { ScreenDataType } from "../../mock";

const WordCloudPanel: React.FC<{
  timeRange: TimeRange;
}> = ({ timeRange }) => {
  const [data, setData] = useState<ScreenDataType["wordCloudData"]>([]);

  // 工单弹窗状态
  const [workListOpen, setWorkListOpen] = useState<boolean>(false);
  const [fetchParams, setFetchParams] = useState<{
    word?: string;
  }>({});

  const cloudData = useMemo(() => {
    return (
      data
        ?.map(({ category, count }) => {
          return {
            name: category,
            value: count,
          };
        })
        ?.splice(0, 15) || []
    );
  }, [data]);

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

  /**
   * 处理词云点击事件
   */
  const handleWordClick = ({
    word,
    count,
  }: {
    word: string;
    count: number;
  }) => {
    if (count > 0) {
      setFetchParams({ word });
      setWorkListOpen(true);
    }
  };

  /**
   * 关闭工单弹窗
   */
  const handleCloseWorkList = () => {
    setWorkListOpen(false);
    setFetchParams({});
  };

  /**
   * 生成弹窗标题
   */
  const getWorkListTitle = () => {
    return `${fetchParams.word}-相关工单`;
  };

  return (
    <PanelItem
      title="词云"
      render={
        <div className={styles.cloud}>
          <Cloud data={cloudData} onItemClick={handleWordClick}></Cloud>
          <WorkListWithDetail
            title={getWorkListTitle()}
            open={workListOpen}
            onCancel={handleCloseWorkList}
            timeRange={timeRange}
            fetchParams={fetchParams}
          />
        </div>
      }
    />
  );
};

export default memo(WordCloudPanel);
