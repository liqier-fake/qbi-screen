import styles from "./index.module.less";
import ComModal, { ComModalProps } from "../ComModal";
import DividerTitle from "../DividerTitle";
import AiSummaryContent from "../AiSummaryContent";
import WorkTable from "../WorkTable";
import { memo, useState } from "react";
import { ColumnType, TableProps } from "antd/es/table";
import { TicketRecord } from "../../types";
import { TimeRange } from "../../api";

/**
 * 请求函数类型
 */
type FetchDataFunction<T = TicketRecord> = (
  params: Record<string, unknown> & {
    time_range: TimeRange;
  }
) => Promise<{
  data: {
    data: T[];
    total?: number;
  };
}>;

/**
 * 工单列表弹窗属性接口(支持分页)
 */
interface WorkListModalProps<T = TicketRecord>
  extends Omit<ComModalProps, "children"> {
  columns: ColumnType<T>[];
  fetchDataApi: FetchDataFunction<T>;
  fetchParams: Record<string, unknown>;
  open: boolean;
  onCancel: () => void;
  title: string;
  pagination?: {
    defaultCurrent?: number;
    defaultPageSize?: number;
  };
  onRow?: (record: T, index?: number) => object;
  showAiSummary?: boolean;
  onDataLoaded?: (data: any) => void;
  children?: React.ReactNode;
  tableProps?: TableProps<T>;
}

/**
 * 工单列表弹窗组件(支持分页)
 */
const WorkListModal = <T extends Record<string, unknown>>({
  columns,
  fetchDataApi,
  fetchParams,
  open,
  onCancel,
  title,
  pagination = {
    defaultCurrent: 1,
    defaultPageSize: 10,
  },
  onRow,
  showAiSummary = true,
  children,
  onDataLoaded,
  tableProps,
  ...rest
}: WorkListModalProps<T>) => {
  // 表格数据，用于AI总结
  const [tableData, setTableData] = useState<T[]>([]);

  return (
    <ComModal
      title={title}
      open={open}
      onCancel={onCancel}
      width={"60%"}
      centered
      footer={null}
      className={styles.workModal}
      destroyOnClose
      {...rest}
    >
      <div className={styles.workModalContent}>
        {showAiSummary && (
          <>
            <DividerTitle title="AI总结" />
            <AiSummaryContent data={tableData} />
          </>
        )}
        {children}
        <DividerTitle title="工单详情" />
        {open && (
          <WorkTable
            key={`${JSON.stringify(fetchParams)}`}
            columns={columns}
            fetchDataApi={fetchDataApi as any}
            fetchParams={fetchParams}
            pagination={pagination}
            onRow={onRow}
            onDataLoaded={(data) => {
              setTableData(data?.data || []);
              onDataLoaded?.(data);
            }}
            tableProps={tableProps}
          />
        )}
      </div>
    </ComModal>
  );
};

export default memo(WorkListModal);
