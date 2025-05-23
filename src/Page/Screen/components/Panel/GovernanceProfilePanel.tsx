/**
 * 治理画像面板组件
 */
import React, { memo, useEffect, useState } from "react";
import Heatmap from "../Chart/Heatmap";
import LineChart from "../Chart/LineChart";
import PanelItem from "../PanelItem";
import WorkListWithDetail from "../WorkListWithDetail";
import styles from "../../index.module.less";
import { apiGetGovProfile1, apiGetGovProfile2, TimeRange } from "../../api";
import { ScreenDataType } from "../../mock";

const GovernanceProfilePanel: React.FC<{
  timeRange: TimeRange;
}> = ({ timeRange }) => {
  const [heatmapData, setHeatmapData] = useState<ScreenDataType["heatmapData"]>(
    []
  );
  const [lineData, setLineData] = useState<
    ScreenDataType["govProfile2LineData"]
  >({
    xData: [],
    lineData: [],
  });

  // 工单弹窗状态
  const [workListOpen, setWorkListOpen] = useState<boolean>(false);
  const [fetchParams, setFetchParams] = useState<{
    c3?: string;
    smqt?: string;
  }>({});

  useEffect(() => {
    // 治理画像-热力图
    const getGovProfile1Data = async () => {
      const {
        data: { data: govProfile1Data },
      } = await apiGetGovProfile1({
        time_range: timeRange,
      });
      console.log(govProfile1Data, "govProfile1Data");
      setHeatmapData(govProfile1Data);
    };

    // 治理画像-折线图
    const getGovProfile2Data = async () => {
      const {
        data: { data: govProfile2Data },
      } = await apiGetGovProfile2({
        time_range: timeRange,
      });

      // 准备LineChart所需的数据格式
      const smqtGroups = new Set<string>();
      const monthData: { [key: string]: { [key: string]: number } } = {};

      // 遍历所有月份数据并收集所有人群类型
      Object.keys(govProfile2Data).forEach((month) => {
        govProfile2Data[month].forEach(
          ({ group, count }: { group: string; count: number }) => {
            smqtGroups.add(group);
            // 初始化月份数据结构
            if (!monthData[month]) {
              monthData[month] = {};
            }

            // 只按smqt分类，相同smqt的count相加
            monthData[month][group] = (monthData[month][group] || 0) + count;
          }
        );
      });

      // 将所有月份按时间顺序排序
      const sortedMonths = Object.keys(govProfile2Data).sort();

      // 构建lineData数据结构，只按人群类型分组
      const lineData = {
        xData: sortedMonths,
        lineData: Array.from(smqtGroups)
          .map((smqt) => {
            const data = sortedMonths.map(
              (month) => monthData[month]?.[smqt] || 0
            );

            // 只返回有数据的系列（至少有一个非零值）
            if (data.some((val) => val > 0)) {
              return {
                name: smqt,
                data,
              };
            }
            return null;
          })
          .filter(
            (
              item
            ): item is {
              name: string;
              data: number[];
              itemStyle: { color: string };
            } => item !== null
          ), // 使用类型谓词确保过滤掉null值
      };
      setLineData(lineData);
    };

    getGovProfile1Data();
    getGovProfile2Data();
  }, [timeRange]);

  /**
   * 处理热力图点击事件
   */
  const handleHeatmapClick = ({
    c3,
    smqt,
    count,
  }: {
    c3: string;
    smqt: string;
    count: number;
  }) => {
    if (count > 0) {
      setFetchParams({ c3, smqt });
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
    return `${fetchParams.c3}-${fetchParams.smqt}-相关工单`;
  };

  return (
    <PanelItem
      title="治理画像"
      render={
        <div className={styles.manageChart}>
          <Heatmap
            className={styles.manageChartItem}
            enableSlide={false}
            data={heatmapData}
            onItemClick={handleHeatmapClick}
          />
          <LineChart
            xData={lineData?.xData || []}
            lineData={lineData?.lineData || []}
            enableSlide={true}
            slideInterval={2000}
            visibleDataPoints={3}
            className={styles.manageChartItem}
          />
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

export default memo(GovernanceProfilePanel);
