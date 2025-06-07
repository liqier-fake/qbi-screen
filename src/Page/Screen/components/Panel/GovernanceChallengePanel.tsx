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
  const [value, setValue] = useState(areaOption[1].value);

  // 使用详情弹窗Hook
  const detailModal = useDetailModal();

  useEffect(() => {
    if (!defautValue) return;
    if (defautValue === "all") return;
    setValue(defautValue);
  }, [defautValue]);

  /**
   * 获取社会风险数据
   */
  // const getTwoCateGoryData = async (timeRange: TimeRange, street: string) => {
  const getTwoCateGoryData = async (street: string) => {
    // const {
    //   data: { data: twoCateGoryData },
    // } = await apiGetSocialRisk({
    //   time_range: timeRange,
    //   street: street,
    // });
    console.log(timeRange);

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
        name: "时代上城北社区",
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
        name: "海悦社区",
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
        name: "新未来社区",
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
        name: "海尚社区",
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

    const dataList = {
      娄葑街道: [
        {
          name: "葑谊社区",
          challenge_score: 63,
          intro: "位于娄葑街道西南部，老小区与新建住宅混合分布。",
          challenge_score_details: [
            { name: "治理事项", score: 16.0, weight: 0.25 },
            { name: "扬言层次", score: 5.0, weight: 0.1 },
            { name: "情绪感知", score: 9.5, weight: 0.15 },
            { name: "事件影响范围", score: 4.0, weight: 0.1 },
            { name: "人口属性", score: 8.0, weight: 0.15 },
            { name: "社区属性", score: 12.0, weight: 0.15 },
            { name: "来源渠道", score: 8.5, weight: 0.1 },
          ],
        },
        {
          name: "通园社区",
          challenge_score: 71,
          intro: "交通便利，靠近地铁通园路站，青年人口占比较高。",
          challenge_score_details: [
            { name: "治理事项", score: 20.0, weight: 0.25 },
            { name: "扬言层次", score: 6.0, weight: 0.1 },
            { name: "情绪感知", score: 11.0, weight: 0.15 },
            { name: "事件影响范围", score: 7.0, weight: 0.1 },
            { name: "人口属性", score: 11.0, weight: 0.15 },
            { name: "社区属性", score: 10.0, weight: 0.15 },
            { name: "来源渠道", score: 6.0, weight: 0.1 },
          ],
        },
        {
          name: "新星社区",
          challenge_score: 68,
          intro: "新建住宅为主，外来人口比例较高，发展中社区。",
          challenge_score_details: [
            { name: "治理事项", score: 18.0, weight: 0.25 },
            { name: "扬言层次", score: 4.0, weight: 0.1 },
            { name: "情绪感知", score: 10.5, weight: 0.15 },
            { name: "事件影响范围", score: 5.5, weight: 0.1 },
            { name: "人口属性", score: 10.0, weight: 0.15 },
            { name: "社区属性", score: 10.0, weight: 0.15 },
            { name: "来源渠道", score: 10.0, weight: 0.1 },
          ],
        },
        {
          name: "金益社区",
          challenge_score: 59,
          intro: "临近娄葑街道办，区域老龄化明显，配套成熟。",
          challenge_score_details: [
            { name: "治理事项", score: 15.0, weight: 0.25 },
            { name: "扬言层次", score: 5.5, weight: 0.1 },
            { name: "情绪感知", score: 8.0, weight: 0.15 },
            { name: "事件影响范围", score: 4.5, weight: 0.1 },
            { name: "人口属性", score: 7.0, weight: 0.15 },
            { name: "社区属性", score: 10.0, weight: 0.15 },
            { name: "来源渠道", score: 9.0, weight: 0.1 },
          ],
        },
        {
          name: "明海社区",
          challenge_score: 75,
          intro: "紧邻工业园区主干道，常住人口密集，治理压力较大。",
          challenge_score_details: [
            { name: "治理事项", score: 21.0, weight: 0.25 },
            { name: "扬言层次", score: 7.5, weight: 0.1 },
            { name: "情绪感知", score: 12.0, weight: 0.15 },
            { name: "事件影响范围", score: 6.5, weight: 0.1 },
            { name: "人口属性", score: 10.5, weight: 0.15 },
            { name: "社区属性", score: 11.0, weight: 0.15 },
            { name: "来源渠道", score: 6.5, weight: 0.1 },
          ],
        },
      ],
      斜塘街道: [
        {
          name: "东兴社区",
          challenge_score: 67,
          intro: "位于斜塘街道东侧，居住人口密度适中，配套完善。",
          challenge_score_details: [
            { name: "治理事项", score: 18.0, weight: 0.25 },
            { name: "扬言层次", score: 7.0, weight: 0.1 },
            { name: "情绪感知", score: 8.5, weight: 0.15 },
            { name: "事件影响范围", score: 5.5, weight: 0.1 },
            { name: "人口属性", score: 9.5, weight: 0.15 },
            { name: "社区属性", score: 12.0, weight: 0.15 },
            { name: "来源渠道", score: 6.0, weight: 0.1 },
          ],
        },
        {
          name: "江南社区",
          challenge_score: 72,
          intro: "位于金鸡湖东南，交通便利，人口结构年轻化。",
          challenge_score_details: [
            { name: "治理事项", score: 20.0, weight: 0.25 },
            { name: "扬言层次", score: 6.5, weight: 0.1 },
            { name: "情绪感知", score: 11.0, weight: 0.15 },
            { name: "事件影响范围", score: 6.5, weight: 0.1 },
            { name: "人口属性", score: 10.0, weight: 0.15 },
            { name: "社区属性", score: 10.0, weight: 0.15 },
            { name: "来源渠道", score: 8.0, weight: 0.1 },
          ],
        },
        {
          name: "星汉社区",
          challenge_score: 61,
          intro: "新建社区，以商品房为主，尚在成长阶段。",
          challenge_score_details: [
            { name: "治理事项", score: 15.0, weight: 0.25 },
            { name: "扬言层次", score: 4.5, weight: 0.1 },
            { name: "情绪感知", score: 9.0, weight: 0.15 },
            { name: "事件影响范围", score: 3.0, weight: 0.1 },
            { name: "人口属性", score: 8.5, weight: 0.15 },
            { name: "社区属性", score: 10.0, weight: 0.15 },
            { name: "来源渠道", score: 7.5, weight: 0.1 },
          ],
        },
        {
          name: "清塘社区",
          challenge_score: 78,
          intro: "发展成熟的老社区，周边教育资源丰富，治理基础好。",
          challenge_score_details: [
            { name: "治理事项", score: 22.0, weight: 0.25 },
            { name: "扬言层次", score: 8.5, weight: 0.1 },
            { name: "情绪感知", score: 12.0, weight: 0.15 },
            { name: "事件影响范围", score: 7.5, weight: 0.1 },
            { name: "人口属性", score: 11.0, weight: 0.15 },
            { name: "社区属性", score: 12.0, weight: 0.15 },
            { name: "来源渠道", score: 8.0, weight: 0.1 },
          ],
        },
        {
          name: "水巷社区",
          challenge_score: 69,
          intro: "邻近斜塘老街，有丰富的文化底蕴与商旅资源。",
          challenge_score_details: [
            { name: "治理事项", score: 19.0, weight: 0.25 },
            { name: "扬言层次", score: 7.0, weight: 0.1 },
            { name: "情绪感知", score: 9.0, weight: 0.15 },
            { name: "事件影响范围", score: 5.5, weight: 0.1 },
            { name: "人口属性", score: 10.0, weight: 0.15 },
            { name: "社区属性", score: 11.0, weight: 0.15 },
            { name: "来源渠道", score: 8.0, weight: 0.1 },
          ],
        },
      ],
      唯亭街道: [
        {
          name: "唯康社区",
          challenge_score: 65,
          intro: "位于唯亭街道北部，新老住户混合，治理结构稳定。",
          challenge_score_details: [
            { name: "治理事项", score: 17.0, weight: 0.25 },
            { name: "扬言层次", score: 6.0, weight: 0.1 },
            { name: "情绪感知", score: 9.0, weight: 0.15 },
            { name: "事件影响范围", score: 4.5, weight: 0.1 },
            { name: "人口属性", score: 9.5, weight: 0.15 },
            { name: "社区属性", score: 11.0, weight: 0.15 },
            { name: "来源渠道", score: 8.0, weight: 0.1 },
          ],
        },
        {
          name: "阳澄社区",
          challenge_score: 74,
          intro: "邻近阳澄湖，居民参与度较高，环境优美。",
          challenge_score_details: [
            { name: "治理事项", score: 20.0, weight: 0.25 },
            { name: "扬言层次", score: 7.0, weight: 0.1 },
            { name: "情绪感知", score: 11.0, weight: 0.15 },
            { name: "事件影响范围", score: 7.0, weight: 0.1 },
            { name: "人口属性", score: 10.5, weight: 0.15 },
            { name: "社区属性", score: 12.0, weight: 0.15 },
            { name: "来源渠道", score: 6.5, weight: 0.1 },
          ],
        },
        {
          name: "南施社区",
          challenge_score: 60,
          intro: "城郊结合区域，常住人口不密集，治理任务适中。",
          challenge_score_details: [
            { name: "治理事项", score: 15.0, weight: 0.25 },
            { name: "扬言层次", score: 5.0, weight: 0.1 },
            { name: "情绪感知", score: 8.0, weight: 0.15 },
            { name: "事件影响范围", score: 4.0, weight: 0.1 },
            { name: "人口属性", score: 8.0, weight: 0.15 },
            { name: "社区属性", score: 10.0, weight: 0.15 },
            { name: "来源渠道", score: 6.5, weight: 0.1 },
          ],
        },
        {
          name: "唯亭花园社区",
          challenge_score: 69,
          intro: "成熟社区，配套设施完善，居民投诉率中等。",
          challenge_score_details: [
            { name: "治理事项", score: 18.0, weight: 0.25 },
            { name: "扬言层次", score: 6.0, weight: 0.1 },
            { name: "情绪感知", score: 9.5, weight: 0.15 },
            { name: "事件影响范围", score: 5.0, weight: 0.1 },
            { name: "人口属性", score: 10.0, weight: 0.15 },
            { name: "社区属性", score: 11.0, weight: 0.15 },
            { name: "来源渠道", score: 8.0, weight: 0.1 },
          ],
        },
        {
          name: "金谷社区",
          challenge_score: 76,
          intro: "新兴住宅区，青年人口集中，事件响应快速。",
          challenge_score_details: [
            { name: "治理事项", score: 21.0, weight: 0.25 },
            { name: "扬言层次", score: 8.0, weight: 0.1 },
            { name: "情绪感知", score: 11.5, weight: 0.15 },
            { name: "事件影响范围", score: 7.0, weight: 0.1 },
            { name: "人口属性", score: 11.0, weight: 0.15 },
            { name: "社区属性", score: 11.5, weight: 0.15 },
            { name: "来源渠道", score: 7.5, weight: 0.1 },
          ],
        },
      ],
      胜浦街道: [
        {
          name: "和顺社区",
          challenge_score: 71,
          intro: "位于胜浦核心区域，居民活跃度高，治理机制健全。",
          challenge_score_details: [
            { name: "治理事项", score: 19.0, weight: 0.25 },
            { name: "扬言层次", score: 6.5, weight: 0.1 },
            { name: "情绪感知", score: 10.0, weight: 0.15 },
            { name: "事件影响范围", score: 6.0, weight: 0.1 },
            { name: "人口属性", score: 10.5, weight: 0.15 },
            { name: "社区属性", score: 12.0, weight: 0.15 },
            { name: "来源渠道", score: 7.0, weight: 0.1 },
          ],
        },
        {
          name: "通和社区",
          challenge_score: 66,
          intro: "靠近工业园区东环，人员构成多元，事务处理偏多。",
          challenge_score_details: [
            { name: "治理事项", score: 17.0, weight: 0.25 },
            { name: "扬言层次", score: 5.5, weight: 0.1 },
            { name: "情绪感知", score: 8.5, weight: 0.15 },
            { name: "事件影响范围", score: 5.5, weight: 0.1 },
            { name: "人口属性", score: 9.0, weight: 0.15 },
            { name: "社区属性", score: 11.0, weight: 0.15 },
            { name: "来源渠道", score: 7.5, weight: 0.1 },
          ],
        },
        {
          name: "建元社区",
          challenge_score: 60,
          intro: "相对较新的住宅区，基础设施建设中。",
          challenge_score_details: [
            { name: "治理事项", score: 15.0, weight: 0.25 },
            { name: "扬言层次", score: 4.5, weight: 0.1 },
            { name: "情绪感知", score: 7.0, weight: 0.15 },
            { name: "事件影响范围", score: 4.0, weight: 0.1 },
            { name: "人口属性", score: 8.5, weight: 0.15 },
            { name: "社区属性", score: 10.0, weight: 0.15 },
            { name: "来源渠道", score: 6.5, weight: 0.1 },
          ],
        },
        {
          name: "春晓社区",
          challenge_score: 75,
          intro: "社区文化氛围浓厚，居民满意度较高。",
          challenge_score_details: [
            { name: "治理事项", score: 21.0, weight: 0.25 },
            { name: "扬言层次", score: 7.0, weight: 0.1 },
            { name: "情绪感知", score: 11.0, weight: 0.15 },
            { name: "事件影响范围", score: 6.5, weight: 0.1 },
            { name: "人口属性", score: 10.0, weight: 0.15 },
            { name: "社区属性", score: 11.5, weight: 0.15 },
            { name: "来源渠道", score: 8.0, weight: 0.1 },
          ],
        },
        {
          name: "永安桥社区",
          challenge_score: 68,
          intro: "临近主干道，交通便利，人口流动性较大。",
          challenge_score_details: [
            { name: "治理事项", score: 18.0, weight: 0.25 },
            { name: "扬言层次", score: 6.0, weight: 0.1 },
            { name: "情绪感知", score: 9.5, weight: 0.15 },
            { name: "事件影响范围", score: 5.5, weight: 0.1 },
            { name: "人口属性", score: 9.5, weight: 0.15 },
            { name: "社区属性", score: 11.0, weight: 0.15 },
            { name: "来源渠道", score: 7.5, weight: 0.1 },
          ],
        },
      ],
      金鸡湖街道: twoCateGoryData,
    };

    setDataSource(dataList[street as keyof typeof dataList] || []);
  };

  useEffect(() => {
    getTwoCateGoryData(value as string);
  }, [value]);

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
            options={areaOption?.slice(1)}
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
