/**
 * 详情弹窗相关逻辑的自定义Hook
 */
import { useState, useMemo } from "react";
import { TicketRecord } from "../types";
import { generateFormData } from "../configs/detailConfig";
import { DetailModalProps } from "../components/DetailModal";

/**
 * 详情弹窗Hook返回类型
 */
export interface UseDetailModalReturn {
  /** 弹窗是否打开 */
  open: boolean;
  /** 当前记录数据 */
  record: TicketRecord;
  /** 格式化的表单数据 */
  formData: DetailModalProps["formData"];
  /** 打开弹窗并设置记录数据 */
  openModal: (record: TicketRecord) => void;
  /** 关闭弹窗 */
  closeModal: () => void;
}

/**
 * 详情弹窗逻辑Hook
 * @returns 弹窗状态和操作方法
 */
export const useDetailModal = (): UseDetailModalReturn => {
  const [open, setOpen] = useState<boolean>(false);
  const [record, setRecord] = useState<TicketRecord>({});

  /**
   * 生成表单数据
   */
  const formData = useMemo(() => {
    return generateFormData(record);
  }, [record]);

  /**
   * 打开弹窗并设置记录数据
   * @param record 工单记录数据
   */
  const openModal = (record: TicketRecord) => {
    // 只有包含治理挑战指数的记录才能打开详情
    if (!record.challenge_score) return;

    setRecord(record);
    setOpen(true);
  };

  /**
   * 关闭弹窗
   */
  const closeModal = () => {
    setOpen(false);
    setRecord({});
  };

  return {
    open,
    record,
    formData,
    openModal,
    closeModal,
  };
};
