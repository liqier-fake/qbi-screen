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
    const renderText = (text: string) => {
      return <div style={{ whiteSpace: "pre-line" }}>{text}</div>;
    };

    const columns = [
      {
        title: "来源",
        dataIndex: "ds1",
        render: (text: string) => renderText(text),
        align: "center",
      },
      {
        title: "诉求人数",
        dataIndex: "impact_scope",
        render: (text: string) => renderText(text),
        align: "center",
      },
      {
        title: "影响范围",
        dataIndex: "impact_scope",
        render: (text: string) => renderText(text),
        align: "center",
      },
      {
        title: "情感分值",
        dataIndex: "sentiment",
        render: (text: string) => renderText(text),
        align: "center",
      },

      {
        title: "扬言分值",
        dataIndex: "threaten",
        render: (text: string) => renderText(text),
        align: "center",
      },
    ];

    const {
      challenge_score,
      date,
      c1,
      c2,
      c3,
      category,
      content,
      address_detail,
      smqt,
    } = record;

    return [
      { key: "challenge_score", label: "治理挑战指数", value: challenge_score },
      { key: "date", label: "诉求时间", value: date },

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
                {
                  ds1: record.ds1,
                  impact_scope: `${record.impact_scope}\n(10.3)`,
                  sentiment: `${record.sentiment}\n(29.95)`,
                  threaten: `${record.threaten}\n(23.74)`,
                },
              ]}
              // @ts-ignore
              columns={columns}
              pagination={false}
            />
          );
        },
      },
      { key: "c1", label: "分类", value: `${c1}/${c2}/${c3}/${category}` },
      { key: "smqt", label: "市民群体", value: smqt },
      { key: "address_detail", label: "详细地址", value: address_detail },
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
