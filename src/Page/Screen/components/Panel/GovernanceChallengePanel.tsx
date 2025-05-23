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
import { apiGetSocialRisk, TimeRange } from "../../api";
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
            onRowClick={(record: TicketRecord) => {
              detailModal.openModal(record);
            }}
          />
          <DetailModal
            title="治理挑战指数详情"
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
