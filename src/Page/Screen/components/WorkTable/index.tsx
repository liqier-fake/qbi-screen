import { Table } from "antd";
import type { ColumnType, TableProps } from "antd/es/table";
import { useEffect, useRef, useState } from "react";
import DetailModal from "../DetailModal";
import { useDetailModal } from "../../hooks/useDetailModal";
import { TicketRecord } from "../../types";

/**
 * 分页参数接口
 */
interface PaginationProps {
  /**
   * 当前页码
   */
  current: number;
  /**
   * 每页显示条数
   */
  pageSize: number;
  /**
   * 总数据条数
   */
  total: number;
}

/**
 * 请求函数类型
 */
type FetchDataFunction<T = TicketRecord> = (
  params: Record<string, unknown>
) => Promise<{
  data: {
    data: T[];
    total?: number;
  };
}>;

interface WorkTableProps<T = TicketRecord> {
  /**
   * 表格列配置
   */
  columns: ColumnType<T>[];
  /**
   * 获取表格数据的接口函数
   */
  fetchDataApi: FetchDataFunction<T>;
  /**
   * 获取表格数据的参数
   */
  fetchParams: Record<string, unknown>;
  /**
   * 分页配置
   */
  pagination?: {
    defaultCurrent?: number;
    defaultPageSize?: number;
  };
  /**
   * 表格行属性配置函数
   */
  onRow?: (record: T, index?: number) => object;
  /**
   * 数据加载完成回调
   */
  onDataLoaded?: (data: any) => void;
  tableProps?: TableProps<T>;
}

/**
 * 工单表格组件
 */
const WorkTable = <T extends Record<string, unknown>>({
  columns,
  fetchDataApi,
  fetchParams,
  pagination = {
    defaultCurrent: 1,
    defaultPageSize: 10,
  },
  onRow,
  onDataLoaded,
  tableProps,
}: WorkTableProps<T>) => {
  // 表格数据
  const [dataSource, setDataSource] = useState<T[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 分页信息
  const [paginationInfo, setPaginationInfo] = useState<PaginationProps>({
    current: pagination.defaultCurrent || 1,
    pageSize: pagination.defaultPageSize || 10,
    total: 0,
  });

  // 使用详情弹窗Hook
  const detailModal = useDetailModal();

  // 使用ref记录是否已经加载过数据
  const hasLoadedRef = useRef(false);

  /**
   * 处理行点击事件
   */
  const handleRowClick = (record: T) => {
    detailModal.openModal(record as TicketRecord);
  };

  /**
   * 合并自定义和默认的行属性
   */
  const mergedOnRow = (record: T, index?: number) => {
    const defaultRowProps = {
      onClick: () => handleRowClick(record),
      style: { cursor: "pointer" },
    };

    // 如果传入了自定义 onRow，则合并属性
    const customRowProps = onRow ? onRow(record, index) : {};
    return {
      ...defaultRowProps,
      ...customRowProps,
    };
  };

  const loadData = async (page: number) => {
    try {
      setLoading(true);
      const { data } = await fetchDataApi({
        ...fetchParams,
        page,
        page_size: paginationInfo.pageSize,
      });

      const tableData = data.data || [];
      setDataSource(tableData);
      setPaginationInfo((prev) => ({
        ...prev,
        current: page,
        total: data.total || tableData.length,
      }));

      // 通知父组件数据已加载
      onDataLoaded?.(data);
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 使用useEffect加载数据，但只在第一次渲染时加载
  useEffect(() => {
    if (!hasLoadedRef.current) {
      const currentPage = pagination.defaultCurrent || 1;
      loadData(currentPage);
      hasLoadedRef.current = true;
    }
  }, []);

  return (
    <>
      <Table
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        pagination={{
          current: paginationInfo.current,
          pageSize: paginationInfo.pageSize,
          total: paginationInfo.total,
          onChange: loadData,
          showSizeChanger: false,
          showQuickJumper: false,
        }}
        scroll={{ y: 200 }}
        onRow={mergedOnRow}
        {...tableProps}
      />

      <DetailModal
        title="工单详情"
        open={detailModal.open}
        onCancel={detailModal.closeModal}
        formData={detailModal.formData}
        showCloseIcon={true}
      />
    </>
  );
};

export default WorkTable;
