/**
 *  社会攻坚项目面板
 */
import React, { memo, useEffect, useMemo, useState } from "react";
import ComTable from "../ComTable";
import PanelItem from "../PanelItem";
import styles from "../../index.module.less";
import DetailModal, { DetailModalProps } from "../DetailModal";
import { columns4 } from "../../columns";
import { dataSource4 } from "../../mock";
import {
  apiGetSocialChallenge,
  apiGetSocialChallengeDetail,
  TimeRange,
} from "../../api";

// 定义数据类型接口
interface SocialChallengeItem {
  street?: string;
  community?: string;
  project?: string;
  content?: string;
  [key: string]: any;
}

const SocialChallengePanel: React.FC<{
  timeRange: TimeRange;
}> = ({ timeRange }) => {
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState<SocialChallengeItem>({});
  const [dataSource, setDataSource] =
    useState<SocialChallengeItem[]>(dataSource4);

  // 获取社会攻坚项目数据
  const getSocialChallengeData = async (timeRange: TimeRange) => {
    try {
      const {
        data: { data: socialChallengeData },
      } = await apiGetSocialChallenge({
        time_range: timeRange,
        page: 1,
        page_size: 20,
      });
      setDataSource(socialChallengeData || dataSource4);
    } catch (error) {
      console.error("获取社会攻坚项目数据失败:", error);
      // 失败时使用默认数据
      setDataSource(dataSource4);
    }
  };

  useEffect(() => {
    getSocialChallengeData(timeRange);
  }, [timeRange]);

  const getDetailData = async (id: string) => {
    const { data } = await apiGetSocialChallengeDetail({ id });

    console.log("datadetail", data);

    setRecord(data);
  };

  // 使用useMemo优化表单数据生成
  const formData = useMemo(() => {
    const { challenge, intro, llm_hot_items, llm_intro, community, street } =
      record || {};

    return [
      { key: "street", label: "街道", value: street || "" },
      { key: "community", label: "责任社区", value: community || "" },
      { key: "challenge", label: "攻坚项目", value: challenge || "" },
      {
        key: "intro",
        label: "项目简介",
        value: intro || "",
        type: "comcontent",
      },
      {
        key: "llm_hot_items",
        label: "热点事项(大模型)",
        value: llm_hot_items || "",
      },
      {
        key: "llm_intro",
        label: "项目简介(大模型)",
        value: llm_intro || "",
        type: "comcontent" as const,
      },
    ] as DetailModalProps["formData"];
  }, [JSON.stringify(record)]);

  return (
    <PanelItem
      title="社会攻坚项目"
      render={
        <div className={styles.warp}>
          <ComTable
            className={styles.table}
            columns={columns4}
            dataSource={dataSource}
            onRowClick={async (record) => {
              setOpen(true);
              getDetailData(record?.id as string);
            }}
          />
          <DetailModal
            title="社会攻坚项目详情"
            open={open}
            onCancel={() => setOpen(false)}
            formData={formData}
          />
        </div>
      }
    />
  );
};

export default memo(SocialChallengePanel);
