/**
 *  社区攻坚项目面板
 */
import React, { memo, useEffect, useMemo, useState } from "react";
import ComTable from "../ComTable";
import PanelItem from "../PanelItem";
import styles from "../../index.module.less";
import DetailModal, { DetailModalProps } from "../DetailModal";
import { columns4 } from "../../columns";

import {
  apiGetSocialChallenge,
  apiGetSocialChallengeDetail,
  apiGetTopCategory,
  TimeRange,
} from "../../api";
import WorkListWithDetail from "../WorkListWithDetail";
import { Flex, Tag } from "antd";

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
  const [dataSource, setDataSource] = useState<SocialChallengeItem[]>([]);
  const [topCategory, setTopCategory] = useState<{
    data?: { category: string; count: number }[];
    year?: number;
  }>({});
  const [topCategoryOpen, setTopCategoryOpen] = useState(false);
  const [currentCategoryRecord, setCurrentCategoryRecord] = useState<any>({});
  // 获取社区攻坚项目数据
  const getSocialChallengeData = async (timeRange: TimeRange) => {
    try {
      const {
        data: { data: socialChallengeData },
      } = await apiGetSocialChallenge({
        time_range: timeRange,
        page: 1,
        page_size: 20,
      });
      setDataSource(socialChallengeData || []);
    } catch (error) {
      console.error("获取社区攻坚项目数据失败:", error);
      // 失败时使用默认数据
      setDataSource([]);
    }
  };

  // 获取社区攻坚项目top分类
  const getTopCategory = async (community: string) => {
    const { data } = await apiGetTopCategory({ community });
    setTopCategory(data);
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
      },
      {
        key: "llm_hot_items",
        label: "下阶段立项参考（智能推荐）1",
        value: llm_hot_items || "",
      },
      {
        key: "llm_intro",
        label: "下阶段立项简介（智能推荐）1",
        value: llm_intro || "",
        // type: "comcontent" as const,
      },
      {
        key: "llm_hot_items1",
        label: "下阶段立项参考（智能推荐）2",
        value: llm_hot_items || "",
      },
      {
        key: "llm_intro1",
        label: "下阶段立项简介（智能推荐）2",
        value: llm_intro || "",
        // type: "comcontent" as const,
      },
      {
        key: "llm_hot_items2",
        label: "下阶段立项参考（智能推荐）3",
        value: llm_hot_items || "",
      },
      {
        key: "llm_intro2",
        label: "下阶段立项简介（智能推荐）3",
        value: llm_intro || "",
        // type: "comcontent" as const,
      },
    ] as DetailModalProps["formData"];
  }, [JSON.stringify(record)]);

  useEffect(() => {
    if (record?.community) {
      getTopCategory(record?.community);
    }
  }, [record?.community]);

  return (
    <PanelItem
      title="社区攻坚项目"
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
            title="社区攻坚项目详情"
            open={open}
            onCancel={() => setOpen(false)}
            formData={formData}
          >
            <Flex gap={10} wrap justify="center">
              {topCategory?.data?.map((item) => (
                <Tag
                  style={{ cursor: "pointer" }}
                  key={item?.category}
                  color="#2e8fe7"
                  onClick={() => {
                    setTopCategoryOpen(true);
                    setCurrentCategoryRecord(item);
                  }}
                >
                  {item?.category}:{item?.count}
                </Tag>
              ))}
            </Flex>
          </DetailModal>
          <WorkListWithDetail
            title={`${currentCategoryRecord?.category}工单详情`}
            open={topCategoryOpen}
            onCancel={() => setTopCategoryOpen(false)}
            timeRange={timeRange}
            fetchParams={{
              ...currentCategoryRecord,
              community: record?.community,
              year: topCategory?.year,
            }}
          />
        </div>
      }
    />
  );
};

export default memo(SocialChallengePanel);
