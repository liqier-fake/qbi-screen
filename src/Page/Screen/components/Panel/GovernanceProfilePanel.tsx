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
import { Flex, Tag } from "antd";
import { transformByField } from "./util";

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
  const [comparisonType, setComparisonType] = useState<"tb" | "hb" | null>(
    null
  );

  // 比较类型配置
  const comparisonConfig = [
    { type: "tb", label: "同比", color: "#145E55" },
    { type: "hb", label: "环比", color: "#145E55" },
  ] as const;

  // 处理标签点击
  const handleTagClick = (type: "tb" | "hb") => {
    setComparisonType(comparisonType === type ? null : type);
  };

  // 获取热力图数据
  useEffect(() => {
    const getGovProfile1Data = async () => {
      const {
        data: { data: govProfile1Data },
      } = await apiGetGovProfile1({
        time_range: timeRange,
      });
      setHeatmapData(govProfile1Data);
    };

    getGovProfile1Data();
  }, [timeRange]);

  // 获取折线图数据
  useEffect(() => {
    const getGovProfile2Data = async () => {
      interface ApiParams {
        time_range: TimeRange;
        comparison_type?: "tb" | "hb";
      }

      const {
        data: { data: govProfile2Data, comparison_ratios },
      } = await apiGetGovProfile2({
        time_range: timeRange,
        ...(comparisonType ? { comparison_type: comparisonType } : {}),
      } as ApiParams);

      const transformedData = transformByField(
        govProfile2Data,
        "smqt",
        "count"
      );

      console.log(comparison_ratios, "comparison_ratios");

      const transformedComparisonData = comparisonType
        ? transformByField(comparison_ratios, "smqt", "change_ratio", "ratios")
        : transformedData;

      console.log(transformedComparisonData, "transformedComparisonData");

      const sortedMonths = Object.keys(govProfile2Data).sort();

      // 构建折线图数据
      const lineData = {
        xData: sortedMonths,
        lineData: Object.entries(transformedComparisonData).map(
          ([key, values]) => ({
            name: key, // 使用 smqt 字段值作为线条名称
            data: sortedMonths.map((month) => values[month] || 0), // 确保每个月都有对应的值，如果没有则为0
          })
        ),
      };

      setLineData(lineData);
    };

    getGovProfile2Data();
  }, [timeRange, comparisonType]);

  // 工单弹窗状态
  const [workListOpen, setWorkListOpen] = useState<boolean>(false);
  const [fetchParams, setFetchParams] = useState<{
    c3?: string;
    smqt?: string;
  }>({});

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
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Flex justify="end">
            {comparisonConfig.map(({ type, label, color }) => (
              <Tag
                key={type}
                color={comparisonType === type ? color : "#054b4b"}
                onClick={() => handleTagClick(type)}
                style={{
                  cursor: "pointer",
                  fontSize: 10,
                }}
              >
                {label}
              </Tag>
            ))}
          </Flex>
          <div className={styles.manageChart} style={{ flex: 1, minHeight: 0 }}>
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
              visibleDataPoints={4}
              isPercentage={!!comparisonType}
              className={styles.manageChartItem}
            />
          </div>
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
