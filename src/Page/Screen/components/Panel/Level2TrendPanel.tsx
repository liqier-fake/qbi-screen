/**
 * 二级趋势预测面板组件
 */
import React, { memo, useEffect, useState } from "react";
import ComSelect from "../ComSelect";
import LineChart from "../Chart/LineChart";
import PanelItem from "../PanelItem";
import styles from "../../index.module.less";
import { apiGetLevel2Trend, TimeRange } from "../../api";
import { areaOption, ScreenDataType } from "../../mock";
import { transformByField } from "./util";
import { Flex, Tag } from "antd";

// 数据项类型定义
interface DataItem {
  c2: string;
  count: string | number;
  is_prediction?: boolean;
}

// 区间类型定义
interface DataRange {
  start: number;
  end: number;
  isPrediction: boolean;
}

// 数据结构类型定义
interface Level2TrendData {
  [key: string]: DataItem[];
}

const Level2TrendPanel: React.FC<{
  timeRange: TimeRange;
  defautValue?: string;
  onChange?: (value: string) => void;
}> = ({ timeRange, defautValue, onChange }) => {
  const [value, setValue] = useState(defautValue || areaOption[0].value);
  const [comparisonType, setComparisonType] = useState<"tb" | "hb" | null>(
    null
  );
  const [lineData, setLineData] = useState<ScreenDataType["lineData"]>({
    xData: [],
    lineData: [],
  });
  const [predictionData, setPredictionData] = useState<boolean[]>([]);

  // 比较类型配置
  const comparisonConfig = [
    { type: "tb", label: "同比", color: "rgba(64, 169, 255, 1)" },
    { type: "hb", label: "环比", color: "rgba(135, 208, 104, 1)" },
  ] as const;

  // 处理标签点击
  const handleTagClick = (type: "tb" | "hb") => {
    setComparisonType(comparisonType === type ? null : type);
  };

  useEffect(() => {
    // 二级趋势预测
    const getLevel2TrendData = async () => {
      const {
        data: { data: level2TrendData, comparison_ratios },
      } = await apiGetLevel2Trend({
        time_range: timeRange,
        street: value,
        comparison_type: comparisonType,
      });

      const sortedMonths = Object.keys(level2TrendData).sort();

      // 数组，月是否预测数据
      const predictionData = Object.entries(level2TrendData).map(
        ([, values]) => {
          const isPrediction =
            (values as { is_prediction: boolean }[])?.[0]?.is_prediction ||
            false;
          return isPrediction;
        }
      );

      // 分割数据

      console.log(predictionData, "predictionData");

      if (!comparisonType) {
        // 获取连续区间，预测线从最后一个实际数据点开始
        const getRanges = (predictionData: boolean[]): DataRange[] => {
          // 找到第一个预测点的位置
          const firstPredictionIndex = predictionData.findIndex(
            (isPred) => isPred
          );

          if (firstPredictionIndex === -1) {
            // 没有预测数据，返回单个实线区间
            return [
              {
                start: 0,
                end: predictionData.length - 1,
                isPrediction: false,
              },
            ];
          }

          // 返回两个区间：实线区间和虚线区间（从实线最后一个点开始）
          return [
            {
              start: 0,
              end: firstPredictionIndex - 1,
              isPrediction: false,
            },
            {
              start: firstPredictionIndex - 1, // 从最后一个实际数据点开始
              end: predictionData.length - 1,
              isPrediction: true,
            },
          ];
        };

        const transformedData = transformByField(
          level2TrendData as Level2TrendData,
          "c2",
          "count"
        );

        const lineData = {
          xData: sortedMonths,
          lineData: Object.entries(transformedData).flatMap(
            ([key, values], index) => {
              // 使用统一的颜色列表
              const colorList = [
                "#00FFC3",
                "#7D00FF",
                "#00AEFF",
                "#FF3B3B",
                "#FF7B00",
              ];
              const color = colorList[index % colorList.length];

              // 获取数据值数组
              const dataValues = sortedMonths.map((month) =>
                Number(values[month] || 0)
              );

              // 获取区间
              const ranges = getRanges(predictionData);

              // 为每个区间创建一个系列
              return ranges.map((range) => {
                // 创建数据数组
                const seriesData = dataValues.map((value, idx) => {
                  if (idx >= range.start && idx <= range.end) {
                    return value;
                  }
                  return "-";
                });

                return {
                  name: key,
                  type: "line",
                  yAxisIndex: 0,
                  data: seriesData,
                  smooth: true,
                  showSymbol: false,
                  itemStyle: { color },
                  lineStyle: {
                    width: 2,
                    type: range.isPrediction ? "dashed" : "solid",
                  },
                };
              });
            }
          ),
        };

        setLineData(lineData as any);
        setPredictionData(predictionData);
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
                    (month) =>
                      baseData[Object.keys(baseData)?.[0]]?.[month] || 0
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
                      compareData[Object.keys(compareData)?.[0]]?.[month] || 0
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
            "c2",
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
        setPredictionData(predictionData);
      }
    };
    getLevel2TrendData();
  }, [timeRange, value, comparisonType]);

  // 当默认值变化时，更新当前选中的值
  useEffect(() => {
    if (!defautValue) return;
    setValue(defautValue);
  }, [defautValue]);

  return (
    <PanelItem
      title="二级趋势预测"
      render={
        <div className={styles.warp}>
          <ComSelect
            className={styles.select}
            options={areaOption}
            onChange={(value) => {
              setValue(value);
              onChange?.(value);
            }}
            value={value}
          />
          <Flex>
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

          <LineChart
            {...lineData}
            enableSlide={true}
            slideInterval={2000}
            visibleDataPoints={4}
            chartType={comparisonType ? "thb" : "line"}
            predictionData={predictionData}
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
      }
    />
  );
};

export default memo(Level2TrendPanel);
