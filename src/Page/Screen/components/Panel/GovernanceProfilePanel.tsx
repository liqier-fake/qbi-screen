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
  const [lineData, setLineData] = useState<ScreenDataType["lineData"]>({
    xData: [],
    lineData: [],
  });
  const [comparisonType, setComparisonType] = useState<"tb" | "hb" | null>(
    null
  );

  // 比较类型配置
  const comparisonConfig = [
    { type: "tb", label: "同比", color: "rgba(20, 94, 85, 1)" },
    { type: "hb", label: "环比", color: "rgba(20, 94, 85, 1)" },
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
      const {
        data: { data: govProfile2Data, comparison_ratios },
      } = await apiGetGovProfile2({
        time_range: timeRange,
        comparison_type: comparisonType,
      });

      const sortedMonths = Object.keys(govProfile2Data).sort();

      if (!comparisonType) {
        // 没有选择同比环比时，使用原来的数据处理方式
        const transformedData = transformByField(
          govProfile2Data,
          "smqt",
          "count"
        );
        const lineData = {
          xData: sortedMonths,
          lineData: Object.entries(transformedData).map(([key, values]) => ({
            name: key,
            type: "line",
            yAxisIndex: 0,
            data: sortedMonths.map((month) => values[month] || 0),
          })),
        };
        setLineData(lineData);
      } else {
        // 选择了同比或环比时，使用柱状图+折线图的组合
        const baseData = transformByField(
          comparison_ratios,
          "c2",
          "current_count",
          "ratios"
        );

        const compareData = transformByField(
          comparison_ratios,
          "c2",
          "compare_count",
          "ratios"
        );

        // 基础数据
        const chartData = {
          xData: sortedMonths,
          lineData: [
            {
              name: "本期",
              type: "bar",
              yAxisIndex: 0,
              data: Object.keys(baseData)?.[0]
                ? sortedMonths.map(
                    (month) => baseData[Object.keys(baseData)[0]]?.[month] || 0
                  )
                : [],
              color: "#00AEFF",
              barGap: "5%",
              barWidth: "12%",
              barCategoryGap: "30%",
            },
            {
              name: "对比",
              type: "bar",
              yAxisIndex: 0,
              data: Object.keys(compareData)?.[0]
                ? sortedMonths.map(
                    (month) =>
                      compareData[Object.keys(compareData)[0]]?.[month] || 0
                  )
                : [],
              color: "#00FFC3",
              barGap: "5%",
              barWidth: "12%",
              barCategoryGap: "30%",
            },
          ],
        };

        // 只有在有环比/同比数据时才添加折线图
        if (comparison_ratios && Object.keys(comparison_ratios).length > 0) {
          const ratioData = transformByField(
            comparison_ratios,
            "smqt",
            "change_ratio",
            "ratios"
          );

          // 确保转换后的数据不为空
          if (Object.keys(ratioData).length > 0) {
            chartData.lineData.push({
              name: comparisonType === "tb" ? "同比" : "环比",
              type: "line",
              yAxisIndex: 1,
              data: sortedMonths.map(
                (month) => ratioData[Object.keys(ratioData)[0]][month] || 0
              ),
              color: comparisonType === "tb" ? "#FF3B3B" : "#5FFF00",
            } as any);
          }
        }

        setLineData(chartData);
      }
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
                color={
                  comparisonType === type ? color : "rgba(20, 94, 85, 0.4)"
                }
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
              {...lineData}
              enableSlide={true}
              slideInterval={2000}
              visibleDataPoints={4}
              chartType={comparisonType ? "thb" : "line"}
              className={styles.manageChartItem}
              yAxis={[
                {
                  type: "value",
                  name: "",
                  position: "left",
                  axisLabel: {
                    color: "#fff",
                    formatter: "{value}",
                  },
                  axisLine: {
                    lineStyle: {
                      color: "#304766",
                    },
                  },
                  splitLine: {
                    lineStyle: {
                      color: "#304766",
                      type: "dashed",
                    },
                  },
                },
                comparisonType
                  ? {
                      type: "value",
                      position: "right",
                      axisLabel: {
                        color: "#fff",
                        formatter: "{value}%",
                        margin: 4,
                      },
                      axisLine: {
                        lineStyle: {
                          color: "#304766",
                        },
                      },
                      splitLine: {
                        show: false,
                        lineStyle: {
                          color: "#304766",
                          type: "dashed",
                        },
                      },
                    }
                  : {
                      show: false,
                      type: "value",
                    },
              ]}
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
