/**
 * 治理挑战指数面板组件
 */
import React, { memo, useEffect, useMemo, useState } from "react";
import ComSelect from "../ComSelect";
import ComTable from "../ComTable";
import PanelItem from "../PanelItem";
import styles from "../../index.module.less";
import { columns1 } from "../../columns";
import DetailModal, { DetailModalProps } from "../DetailModal";
import { Table } from "antd";
import { areaOption } from "../../mock";
import { apiGetSocialRisk, TimeRange } from "../../api";

const GovernanceChallengePanel: React.FC<{
  timeRange: TimeRange;
  defautValue?: string;
  onChange?: (value: string) => void;
}> = ({ timeRange, defautValue, onChange }) => {
  const [dataSource, setDataSource] = useState<any[]>([]);

  const [value, setValue] = useState(defautValue || areaOption[0].value);
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState<any>({});

  useEffect(() => {
    if (!defautValue) return;
    setValue(defautValue);
  }, [defautValue]);

  // 二级分类
  const getTwoCateGoryData = async (timeRange: TimeRange, street: string) => {
    const {
      data: { data: twoCateGoryData },
    } = await apiGetSocialRisk({
      time_range: timeRange,
      street: street,
    });
    setDataSource(twoCateGoryData || []);
  };

  useEffect(() => {
    getTwoCateGoryData(timeRange, value);
  }, [timeRange, value]);

  const formData = useMemo(() => {
    const columns = [
      {
        title: "诉求来源",
        dataIndex: "ds1",
      },
      {
        title: "诉求人数",
        dataIndex: "impact_scope",
      },
      {
        title: "影响范围",
        dataIndex: "impact_scope",
      },
      {
        title: "情感分值",
        dataIndex: "sentiment",
      },
      {
        title: "扬言分值",
        dataIndex: "threaten",
      },
    ];

    const { challenge_score, date, c2, content } = record;

    return [
      { key: "challenge_score", label: "治理挑战指数", value: challenge_score },
      { key: "date", label: "诉求时间", value: date },
      { key: "c2", label: "二级分类", value: c2 },
      {
        key: "content",
        label: "诉求内容",
        value: content,
        type: "comcontent" as const,
      },
      {
        key: "source",
        label: "",
        value: "source",
        type: "render",
        render: () => {
          return (
            <Table
              dataSource={[
                record,
                {
                  ds1: "21.05",
                  impact_scope: "10.3",
                  sentiment: "29.95",
                  threaten: "23.74",
                },
              ]}
              columns={columns}
              pagination={false}
            />
          );
        },
      },
    ] as DetailModalProps["formData"];
  }, [JSON.stringify(record)]);
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
              setOpen(true);
              setRecord(record);
            }}
          />
          <DetailModal
            title="治理挑战指数详情"
            open={open}
            onCancel={() => setOpen(false)}
            formData={formData}
            showCloseIcon={true}
          />
        </div>
      }
    />
  );
};

export default memo(GovernanceChallengePanel);
