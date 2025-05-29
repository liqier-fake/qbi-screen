/**
 * 工单列表与详情弹窗组合组件
 * 统一处理所有工单列表弹窗场景：分类统计、热力图、词云等
 */
import React from "react";
import columns from "../CategoryModal/columns"; // 复用现有的列配置
import { apiGetTicketList, TimeRange } from "../../api";
import WorkListModal from "../WorkMoal";

export interface WorkListWithDetailProps {
  /** 弹窗标题 */
  title: string;
  /** 弹窗是否打开 */
  open: boolean;
  /** 关闭弹窗回调 */
  onCancel: () => void;
  /** 时间范围 */
  timeRange: TimeRange;
  /** 查询参数 - 支持所有可能的字段组合 */
  fetchParams: {
    category?: string; // 分类名称
    word?: string; // 词云关键词
    c3?: string; // 热力图c3分类
    c1?: string; // c1分类
    c2?: string; // c2分类
    smqt?: string; // 人群分类
    [key: string]: string | number | undefined; // 支持未来扩展
  };
  /** 分页配置 */
  pagination?: {
    defaultCurrent?: number;
    defaultPageSize?: number;
  };
}

/**
 * 工单列表与详情弹窗组合组件
 */
const WorkListWithDetail: React.FC<WorkListWithDetailProps> = ({
  title,
  open,
  onCancel,
  timeRange,
  fetchParams,
  pagination = {
    defaultCurrent: 1,
    defaultPageSize: 10,
  },
}) => {
  return (
    <>
      <WorkListModal
        title={title}
        open={open}
        onCancel={onCancel}
        columns={columns}
        fetchDataApi={apiGetTicketList as any}
        fetchParams={{
          ...fetchParams,
          time_range: timeRange,
        }}
        pagination={pagination}
      />
    </>
  );
};

export default WorkListWithDetail;
