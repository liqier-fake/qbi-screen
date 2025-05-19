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

const Level2TrendPanel: React.FC<{
  timeRange: TimeRange;
  defautValue?: string;
  onChange?: (value: string) => void;
}> = ({ timeRange, defautValue, onChange }) => {
  const [value, setValue] = useState(defautValue || areaOption[0].value);
  const [lineData, setLineData] = useState<ScreenDataType["lineData"]>({
    xData: [],
    lineData: [],
  });
  useEffect(() => {
    // 二级趋势预测
    const getLevel2TrendData = async () => {
      const {
        data: { data: level2TrendData },
      } = await apiGetLevel2Trend({
        time_range: timeRange,
        street: value,
      });

      console.log(level2TrendData, "level2TrendData");

      const smqtGroups = new Set<string>();
      const monthData: { [key: string]: { [key: string]: number } } = {};

      Object.keys(level2TrendData).forEach((month) => {
        level2TrendData[month].forEach(
          ({ c2, count }: { c2: string; count: number }) => {
            smqtGroups.add(c2);
            if (!monthData[month]) {
              monthData[month] = {};
            }
            monthData[month][c2] = (monthData[month][c2] || 0) + count;
          }
        );
      });

      const sortedMonths = Object.keys(level2TrendData).sort();

      const lineData = {
        xData: sortedMonths,
        lineData: Array.from(smqtGroups)
          .map((c2) => {
            const data = sortedMonths.map(
              (month) => monthData[month]?.[c2] || 0
            );

            if (data.some((val) => val > 0)) {
              return {
                name: c2,
                data,
              };
            }
            return null;
          })
          .filter(
            (item): item is { name: string; data: number[] } => item !== null
          ), // 使用类型谓词确保过滤掉null值
      };

      setLineData(lineData);

      console.log(lineData, "level2TrendLineDatalevel2TrendLineData");
    };
    getLevel2TrendData();
  }, [timeRange, value]);

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
          <LineChart
            {...lineData}
            enableSlide={true}
            slideInterval={2000}
            visibleDataPoints={3}
          />
        </div>
      }
    />
  );
};

export default memo(Level2TrendPanel);
