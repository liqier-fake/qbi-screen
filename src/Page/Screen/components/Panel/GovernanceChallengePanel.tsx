/**
 * 治理挑战指数面板组件
 */
import React, { memo, useEffect, useState } from "react";
import ComSelect from "../ComSelect";
import ComTable from "../ComTable";
import PanelItem from "../PanelItem";
import styles from "../../index.module.less";
import { columns1 } from "../../columns";
import DetailModal from "../DetailModal";
import { areaOption } from "../../mock";
import { TimeRange } from "../../api";
import { useDetailModal } from "../../hooks/useDetailModal";
import { TicketRecord } from "../../types";

const GovernanceChallengePanel: React.FC<{
  timeRange: TimeRange;
  defautValue?: string;
  onChange?: (value: string) => void;
}> = ({ timeRange, defautValue, onChange }) => {
  const [dataSource, setDataSource] = useState<TicketRecord[]>([]);
  const [value, setValue] = useState(defautValue || areaOption[0].value);

  // 使用详情弹窗Hook
  const detailModal = useDetailModal();

  useEffect(() => {
    if (!defautValue) return;
    setValue(defautValue);
  }, [defautValue]);

  /**
   * 获取社会风险数据
   */
  // const getTwoCateGoryData = async (timeRange: TimeRange, street: string) => {
  const getTwoCateGoryData = async () => {
    // const {
    //   data: { data: twoCateGoryData },
    // } = await apiGetSocialRisk({
    //   time_range: timeRange,
    //   street: street,
    // });
    const twoCateGoryData = [
      {
        name: "新加社区",
        challenge_score: 91,
        intro:
          "新加社区管辖3个住宅小区，为苏州工业园区早期开发时建设的第一批住宅小区，常住人口近6000人，为老人、新苏州人、外来人口多元居住形态，租住比例达25%。社区目前有工作人员10名，长期面临物业管理质量差、车位紧张等治理难题，治理挑战指数较高。",
        challenge_score_details: [
          { name: "治理事项", score: 25.0, weight: 0.25 },
          { name: "扬言层次", score: 10.0, weight: 0.1 },
          { name: "情绪感知", score: 13.5, weight: 0.15 },
          { name: "事件影响范围", score: 9.0, weight: 0.1 },
          { name: "人口属性", score: 13.5, weight: 0.15 },
          { name: "社区属性", score: 13.5, weight: 0.15 },
          { name: "来源渠道", score: 6.5, weight: 0.1 },
        ],
      },
      {
        name: "斜塘社区",
        challenge_score: 84,
        intro: "融合历史与现代的居住板块，发展成熟。",
        challenge_score_details: [
          { name: "治理事项", score: 20.0, weight: 0.25 },
          { name: "扬言层次", score: 8.0, weight: 0.1 },
          { name: "情绪感知", score: 14.0, weight: 0.15 },
          { name: "事件影响范围", score: 6.0, weight: 0.1 },
          { name: "人口属性", score: 12.0, weight: 0.15 },
          { name: "社区属性", score: 14.0, weight: 0.15 },
          { name: "来源渠道", score: 10.0, weight: 0.1 },
        ],
      },
      {
        name: "唯亭社区",
        challenge_score: 62,
        intro: "紧邻沪苏通道，园区东部的重要社区。",
        challenge_score_details: [
          { name: "治理事项", score: 12.5, weight: 0.25 },
          { name: "扬言层次", score: 6.2, weight: 0.1 },
          { name: "情绪感知", score: 10.2, weight: 0.15 },
          { name: "事件影响范围", score: 6.0, weight: 0.1 },
          { name: "人口属性", score: 8.5, weight: 0.15 },
          { name: "社区属性", score: 9.0, weight: 0.15 },
          { name: "来源渠道", score: 9.6, weight: 0.1 },
        ],
      },
      {
        name: "胜浦社区",
        challenge_score: 69,
        intro: "园区东南片区，靠近生物纳米园区。",
        challenge_score_details: [
          { name: "治理事项", score: 16.0, weight: 0.25 },
          { name: "扬言层次", score: 8.0, weight: 0.1 },
          { name: "情绪感知", score: 12.0, weight: 0.15 },
          { name: "事件影响范围", score: 6.0, weight: 0.1 },
          { name: "人口属性", score: 9.5, weight: 0.15 },
          { name: "社区属性", score: 10.0, weight: 0.15 },
          { name: "来源渠道", score: 7.5, weight: 0.1 },
        ],
      },
      {
        name: "娄葑社区",
        challenge_score: 58,
        intro: "园区最早开发区域之一，生活氛围浓厚。",
        challenge_score_details: [
          { name: "治理事项", score: 12.0, weight: 0.25 },
          { name: "扬言层次", score: 5.0, weight: 0.1 },
          { name: "情绪感知", score: 8.5, weight: 0.15 },
          { name: "事件影响范围", score: 5.0, weight: 0.1 },
          { name: "人口属性", score: 9.0, weight: 0.15 },
          { name: "社区属性", score: 10.0, weight: 0.15 },
          { name: "来源渠道", score: 8.0, weight: 0.1 },
        ],
      },
    ];

    setDataSource(twoCateGoryData || []);
  };

  useEffect(() => {
    getTwoCateGoryData();
  }, [timeRange]);

  // useEffect(() => {
  //   getTwoCateGoryData(timeRange, value);
  // }, [timeRange, value]);

  return (
    <PanelItem
      title="治理挑战指数"
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
          <ComTable
            className={styles.table}
            columns={columns1}
            dataSource={dataSource}
            onRowClick={(record) => {
              detailModal.openModal(record as unknown as TicketRecord);
            }}
          />
          <DetailModal
            title="社区挑战指数"
            open={detailModal.open}
            onCancel={detailModal.closeModal}
            formData={detailModal.formData}
            showCloseIcon={true}
          />
        </div>
      }
    />
  );
};

export default memo(GovernanceChallengePanel);
