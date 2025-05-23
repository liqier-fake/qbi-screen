/**
 * 关注人群重点诉求面板组件
 */
import React, { memo, useEffect, useState } from "react";
import ComSelect from "../ComSelect";
import ComTable from "../ComTable";
import PanelItem from "../PanelItem";
import styles from "../../index.module.less";
import { columns1 } from "../../columns";
import DetailModal from "../DetailModal";
import { peopleOption } from "../../mock";
import { apiGetSocialRisk, TimeRange } from "../../api";
import { useDetailModal } from "../../hooks/useDetailModal";
import { TicketRecord } from "../../types";

const PeopleFocusPanel: React.FC<{
  defautValue?: string;
  onChange?: (value: string) => void;
  timeRange: TimeRange;
}> = ({ defautValue, onChange, timeRange }) => {
  const [value, setValue] = useState(defautValue || peopleOption[0].value);
  const [dataSource, setDataSource] = useState<TicketRecord[]>([]);

  // 使用详情弹窗Hook
  const detailModal = useDetailModal();

  useEffect(() => {
    if (!defautValue) return;
    setValue(defautValue);
  }, [defautValue]);

  /**
   * 获取关注人群重点诉求数据
   */
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
            onRowClick={(record: TicketRecord) => {
              detailModal.openModal(record);
            }}
          />
          <DetailModal
            title="关注人群重点诉求详情"
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

export default memo(PeopleFocusPanel);
