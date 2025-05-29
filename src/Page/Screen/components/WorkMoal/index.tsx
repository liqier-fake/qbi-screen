import { Table } from "antd";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.less";
import { worckColumns } from "../../columns";
import ComModal, { ComModalProps } from "../ComModal";
import ComContent from "../ComContent";
import { fetchEventSource } from "@microsoft/fetch-event-source";

/**
 * 工单列表弹窗属性接口
 */
interface WorkModalProps extends ComModalProps {
  /**
   * 弹窗标题
   */
  textTitle?: string;
  /**
   * AI总结内容
   */
  workAiComment: string;
  /**
   * 工单详情数据
   */
  workDetail: any[];
  /**
   * 加载状态
   */
  loading?: boolean;
}

/**
 * 工作列表弹窗组件(不支持分页)
 */
const WorkModal = ({
  workAiComment,
  workDetail = [],
  loading,
  ...rest
}: WorkModalProps) => {
  return (
    <ComModal
      {...rest}
      width={"60%"}
      centered
      footer={null}
      className={styles.workModal}
    >
      <div className={styles.workModalContent}>
        <div className={styles.divider}>AI总结</div>
        <ComContent content={workAiComment} markdown={true} />
        <div className={styles.divider}>工单详情</div>
        <Table
          dataSource={workDetail || []}
          columns={worckColumns}
          loading={loading}
          pagination={false}
          scroll={{ y: 249 }}
        />
      </div>
    </ComModal>
  );
};

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
type FetchDataFunction<T = any, P = any> = (params: P) => Promise<{
  data: {
    data: T[];
    total?: number;
  };
}>;

/**
 * 工单列表弹窗属性接口(支持分页)
 */
interface WorkListModalProps extends Omit<ComModalProps, "children"> {
  /**
   * 表格列配置
   */
  columns: any[];
  /**
   * 获取表格数据的接口函数
   */
  fetchDataApi: FetchDataFunction;
  /**
   * 获取表格数据的参数
   */
  fetchParams: Record<string, any>;
  /**
   * 是否显示弹窗
   */
  open: boolean;
  /**
   * 关闭弹窗回调
   */
  onCancel: () => void;
  /**
   * 弹窗标题
   */
  title: string;
  /**
   * 分页配置
   */
  pagination?: {
    /**
     * 默认当前页
     */
    defaultCurrent?: number;
    /**
     * 默认每页条数
     */
    defaultPageSize?: number;
  };
  /**
   * 表格行属性配置函数
   */
  onRow?: (record: any, index?: number) => object;
}

/**
 * 工单列表弹窗组件(支持分页)
 */
const WorkListModal = ({
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
  ...rest
}: WorkListModalProps) => {
  // 表格数据
  const [dataSource, setDataSource] = useState<any[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 分页信息
  const [paginationInfo, setPaginationInfo] = useState<PaginationProps>({
    current: pagination.defaultCurrent || 1,
    pageSize: pagination.defaultPageSize || 10,
    total: 0,
  });
  // AI总结
  const [aiSummary, setAiSummary] = useState<string>("");
  // AI总结加载状态
  const [aiLoading, setAiLoading] = useState(false);
  // 中断控制器
  const ctrlRef = useRef<AbortController | null>(null);

  /**
   * 获取表格数据
   */
  const fetchData = async (page = paginationInfo.current) => {
    try {
      setLoading(true);
      const { data } = await fetchDataApi({
        ...fetchParams,
        page,
        page_size: paginationInfo.pageSize,
      });

      setDataSource(data.data || []);
      setPaginationInfo((prev) => ({
        ...prev,
        current: page,
        total: data.total || data.data.length,
      }));

      // 获取数据后生成AI总结
      generateAiSummary(data.data);
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 生成AI总结
   */
  const generateAiSummary = (data: any[]) => {
    // 如果没有数据，则不生成总结
    if (!data || data.length === 0) {
      setAiSummary("没有数据可供总结");
      return;
    }

    // 设置加载状态为true
    setAiLoading(true);

    // 取消之前的请求
    if (ctrlRef.current) {
      ctrlRef.current.abort();
      ctrlRef.current = null;
    }

    // 创建新的控制器
    const ctr = new AbortController();
    ctrlRef.current = ctr;

    // 将数据中的内容提取出来，作为AI总结的输入
    const content = data
      .map((item) => {
        // 假设数据中有content字段
        if (item.content) return item.content;
        // 如果没有content字段，尝试将对象转为字符串
        return JSON.stringify(item);
      })
      .join("\n");

    // 重置AI总结
    setAiSummary("");
    // 使用fetchEventSource请求AI总结
    fetchEventSource(`${import.meta.env.VITE_BASE_API_URL}/process-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + import.meta.env.VITE_CHAT_TOKEN,
      },
      body: JSON.stringify({
        task: "summary+breakdown",
        content,
      }),
      signal: ctr.signal,
      onmessage(msg) {
        try {
          const res = JSON.parse(msg.data);
          setAiSummary((prev) => prev + (res.content || ""));
          // 如果收到消息，说明已经开始生成内容，可以关闭loading
          if (res.content) {
            setAiLoading(false);
          }
        } catch (error) {
          console.error("解析AI总结数据失败:", error);
          setAiLoading(false);
        }
      },
      onclose() {
        console.log("AI总结请求关闭");
        setAiLoading(false);
      },
      onerror(err) {
        console.error("AI总结请求出错:", err);
        setAiSummary("AI总结生成失败，请稍后再试");
        setAiLoading(false);
        // 阻止自动重试
        throw new Error("请求失败，终止 fetchEventSource");
      },
    });
  };

  /**
   * 表格分页切换
   */
  const handleTableChange = (page: number) => {
    fetchData(page);
  };

  /**
   * 初始化加载数据
   */
  useEffect(() => {
    if (open) {
      fetchData(pagination.defaultCurrent || 1);
    } else {
      // 弹窗关闭时，清空数据和总结
      setDataSource([]);
      setAiSummary("");
      setAiLoading(false);
      // 取消请求
      if (ctrlRef.current) {
        ctrlRef.current.abort();
        ctrlRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fetchDataApi, JSON.stringify(fetchParams)]);

  /**
   * 组件卸载时，取消请求
   */
  useEffect(() => {
    return () => {
      if (ctrlRef.current) {
        ctrlRef.current.abort();
        ctrlRef.current = null;
      }
    };
  }, []);

  return (
    <ComModal
      title={title}
      open={open}
      onCancel={onCancel}
      width={"60%"}
      centered
      footer={null}
      className={styles.workModal}
      {...rest}
    >
      <div className={styles.workModalContent}>
        <div className={styles.divider}>AI总结</div>
        <ComContent
          content={aiLoading ? "加载中..." : aiSummary || ""}
          markdown={true}
        />
        <div className={styles.divider}>工单详情</div>
        <Table
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          pagination={{
            current: paginationInfo.current,
            pageSize: paginationInfo.pageSize,
            total: paginationInfo.total,
            onChange: handleTableChange,
            showSizeChanger: false,
            showQuickJumper: false,
          }}
          scroll={{ y: 200 }} // 使表格宽度自适应
          onRow={onRow}
        />
      </div>
    </ComModal>
  );
};

export default WorkModal;
export { WorkListModal };
