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

  // 比较类型配置
  const comparisonConfig = [
    { type: "tb", label: "同比", color: "rgba(20, 94, 85, 1)" },
    { type: "hb", label: "环比", color: "rgba(20, 94, 85, 1)" },
  ] as const;

  // 处理标签点击
  const handleTagClick = (type: "tb" | "hb") => {
    setComparisonType(comparisonType === type ? null : type);
  };

  useEffect(() => {
    // 二级趋势预测
    const getLevel2TrendData = async () => {
      const {
        data: { data: level2TrendData, comparison_ratios, comparison_data },
      } = await apiGetLevel2Trend({
        time_range: timeRange,
        street: value,
        comparison_type: comparisonType,
      });

      const sortedMonths = Object.keys(level2TrendData).sort();

      if (!comparisonType) {
        // 没有选择同比环比时，使用原来的数据处理方式
        const transformedData = transformByField(
          level2TrendData,
          "c2",
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
        const baseData = transformByField(level2TrendData, "c2", "count");
        const compareData = transformByField(comparison_data, "c2", "count");

        // 基础数据
        const chartData = {
          xData: sortedMonths,
          lineData: [
            {
              name: "本期",
              type: "bar",
              yAxisIndex: 0,
              data: sortedMonths.map(
                (month) => baseData[Object.keys(baseData)[0]][month] || 0
              ),
              color: "#00AEFF",
              barGap: "5%",
              barWidth: "12%",
              barCategoryGap: "30%",
            },
            {
              name: "对比",
              type: "bar",
              yAxisIndex: 0,
              data: sortedMonths.map(
                (month) => compareData[Object.keys(compareData)[0]][month] || 0
              ),
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
                    // name: comparisonType === "tb" ? "同比" : "环比",
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
