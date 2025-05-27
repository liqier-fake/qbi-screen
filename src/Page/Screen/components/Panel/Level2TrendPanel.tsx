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
  ); // 默认不选择
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
        data: { data: level2TrendData, comparison_ratios },
      } = await apiGetLevel2Trend({
        time_range: timeRange,
        street: value,
        ...(comparisonType ? { comparison_type: comparisonType } : {}),
      } as any);

      const transformedData = transformByField(level2TrendData, "c2", "count");
      const transformedComparisonData = comparisonType
        ? transformByField(comparison_ratios, "c2", "change_ratio", "ratios")
        : transformedData;

      const sortedMonths = Object.keys(level2TrendData).sort();

      // 将转换后的数据处理成折线图所需的格式
      const lineData = {
        xData: sortedMonths,
        lineData: Object.entries(transformedComparisonData).map(
          ([key, values]) => ({
            name: key, // 使用 c2 字段值作为线条名称
            data: sortedMonths.map((month) => values[month] || 0), // 确保每个月都有对应的值，如果没有则为0
          })
        ),
      };

      setLineData(lineData);
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
            isPercentage={!!comparisonType}
          />
        </div>
      }
    />
  );
};

export default memo(Level2TrendPanel);
