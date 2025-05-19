/**
 * 攻坚重点面板组件
 */
import React, { memo, useEffect, useMemo, useState } from "react";
import ComSelect from "../ComSelect";
import ComTable from "../ComTable";
import BaseChart from "../Chart/BaseChart";
import PanelItem from "../PanelItem";
import styles from "../../index.module.less";
import { apiGetKeyFocus, apiGetWorkDetail, TimeRange } from "../../api";
import { areaOption } from "../../mock";
import { WorkListModal } from "../WorkMoal";
import { EChartsOption } from "echarts";
import { worckColumns } from "../../columns";
import { columns3 } from "../../columns";

/**
 * 攻坚重点面板组件
 */
const KeyFocusPanel: React.FC<{
  timeRange: TimeRange;
  defautValue?: string;
  onChange?: (value: string) => void;
}> = ({ timeRange, defautValue, onChange }) => {
  const [value, setValue] = useState(defautValue || areaOption[2].value);
  const [dataSource, setDataSource] = useState<any[]>([]);
  // 攻坚项目弹窗
  const [workOpen, setWorkOpen] = useState(false);
  // 记录当前选中的行数据
  const [workRecord, setWorkRecord] = useState<any>(null);

  // 当默认值变化时，更新当前选中的值
  useEffect(() => {
    if (!defautValue) return;
    setValue(defautValue);
  }, [defautValue]);

  // 当值发生变化时，触发回调
  const handleChange = (value: string) => {
    setValue(value);
    onChange?.(value);
  };

  // 构建饼图配置
  const pieOption: EChartsOption = useMemo(() => {
    // 统计不同等级的数量
    const levelCounts = {
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
    };

    // 遍历keyFocusData统计各等级数量
    (dataSource || []).forEach(
      (item: { count: number; category: string; level: string }) => {
        // 记录总数
        levelCounts.total++;

        // 根据数值范围判断等级
        if (item.count > 50) {
          levelCounts.high++;
        } else if (item.count > 10) {
          levelCounts.medium++;
        } else if (item.count >= 1) {
          levelCounts.low++;
        }
      }
    );

    // 打印统计结果
    console.log("攻坚重点统计:", {
      数据总量: levelCounts.total,
      高危: levelCounts.high,
      中危: levelCounts.medium,
      低危: levelCounts.low,
      原始数据: dataSource,
    });

    // 定义显示文本
    const highText = `高 ${levelCounts.high}个`;
    const mediumText = `中 ${levelCounts.medium}个`;
    const lowText = `低 ${levelCounts.low}个`;

    return {
      backgroundColor: "#0b1e3a",
      tooltip: {
        show: false,
        trigger: "item",
        formatter: "{b}: {c}个 ({d}%)",
      },
      grid: {
        top: 0,
        left: 0,
      },
      legend: {
        orient: "vertical",
        left: "center",
        bottom: "10",
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          color: "#fff",
          fontSize: 10,
        },
        data: [
          { name: highText, icon: "circle" },
          { name: mediumText, icon: "circle" },
          { name: lowText, icon: "circle" },
        ],
      },
      color: ["#e74c3c", "#2ecc71", "#3498db"], // 高:红, 中:绿, 低:蓝
      series: [
        {
          name: "等级分布",
          type: "pie",
          center: ["50%", "20%"],
          radius: ["50%", "20%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: levelCounts.high, name: highText },
            { value: levelCounts.medium, name: mediumText },
            { value: levelCounts.low, name: lowText },
          ],
        },
      ],
    };
  }, [dataSource]);

  // 获取攻坚重点数据
  useEffect(() => {
    // 攻坚重点
    const getKeyFocusData = async () => {
      const {
        data: { data: keyFocusData },
      } = await apiGetKeyFocus({
        time_range: timeRange,
        street: value,
      });
      setDataSource(keyFocusData);
    };
    getKeyFocusData();
  }, [timeRange, value]);

  // 行点击事件处理
  const handleRowClick = (record: any) => {
    setWorkOpen(true);
    setWorkRecord(record);
  };

  // 关闭弹窗事件处理
  const handleClose = () => {
    setWorkOpen(false);
    setWorkRecord(null);
  };

  return (
    <PanelItem
      title="攻坚重点"
      render={
        <div className={styles.warp}>
          <ComSelect
            className={styles.select}
            options={areaOption}
            onChange={handleChange}
            value={value}
          />
          <div className={styles.twoTrend}>
            <div className={styles.pieWrap}>
              <BaseChart option={pieOption}></BaseChart>
            </div>
            <ComTable
              columns={columns3}
              dataSource={dataSource}
              onRowClick={handleRowClick}
            ></ComTable>
          </div>

          <WorkListModal
            open={workOpen}
            onCancel={handleClose}
            columns={worckColumns}
            fetchDataApi={apiGetWorkDetail}
            fetchParams={{
              category: workRecord?.category,
              community: workRecord?.community,
            }}
            title={`${workRecord?.community}${workRecord?.category}事项`}
            pagination={{
              defaultCurrent: 1,
              defaultPageSize: 10,
            }}
          />
        </div>
      }
    />
  );
};

export default memo(KeyFocusPanel);
