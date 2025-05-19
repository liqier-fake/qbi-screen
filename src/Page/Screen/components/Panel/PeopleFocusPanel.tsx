/**
 * 关注人群重点诉求面板组件
 */
import React, { memo, useEffect, useMemo, useState } from "react";
import ComSelect from "../ComSelect";
import ComTable from "../ComTable";
import PanelItem from "../PanelItem";
import styles from "../../index.module.less";
import { columns1 } from "../../columns";
import DetailModal, { DetailModalProps } from "../DetailModal";
import { Table } from "antd";
import { peopleOption } from "../../mock";
import { apiGetSocialRisk, TimeRange } from "../../api";
const PeopleFocusPanel: React.FC<{
  defautValue?: string;
  onChange?: (value: string) => void;
  timeRange: TimeRange;
}> = ({ defautValue, onChange, timeRange }) => {
  const [value, setValue] = useState(defautValue || peopleOption[0].value);
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState<any>({});
  const [dataSource, setDataSource] = useState<any[]>([]);
  useEffect(() => {
    if (!defautValue) return;
    setValue(defautValue);
  }, [defautValue]);

  // 关注人群重点诉求
  const getSocialRiskData = async (timeRange: TimeRange, value: string) => {
    const {
      data: { data: socialRiskData },
    } = await apiGetSocialRisk({
      time_range: timeRange,
      group: value,
    });
    console.log(socialRiskData, "socialRiskData");
    setDataSource(socialRiskData || []);
  };

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

    const { threaten, date, c2, content } = record;

    return [
      { key: "threaten", label: "治理挑战指数", value: threaten },
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
            <Table dataSource={[record]} columns={columns} pagination={false} />
          );
        },
      },
    ] as DetailModalProps["formData"];
  }, [JSON.stringify(record)]);

  useEffect(() => {
    getSocialRiskData(timeRange, value);
  }, [timeRange, value]);

  return (
    <PanelItem
      title="关注人群重点诉求"
      render={
        <div className={styles.warp}>
          <ComSelect
            className={styles.select}
            options={peopleOption}
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
            title="关注人群重点诉求详情"
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

export default memo(PeopleFocusPanel);
