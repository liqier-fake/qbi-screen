/**
 * 详情弹窗可重用配置
 */
import { Table } from "antd";
import { DetailModalProps } from "../components/DetailModal";
import { TicketRecord } from "../types";

/**
 * 渲染文本内容（支持换行）
 */
const renderText = (text: string) => {
  return <div style={{ whiteSpace: "pre-line" }}>{text}</div>;
};

/**
 * 来源信息表格列配置
 */
export const sourceTableColumns = [
  {
    title: "来源",
    dataIndex: "ds1",
    render: (text: string) => renderText(text),
    align: "center" as const,
  },
  {
    title: "诉求人数",
    dataIndex: "impact_scope",
    render: (text: string) => renderText(text),
    align: "center" as const,
  },
  {
    title: "影响范围",
    dataIndex: "impact_scope",
    render: (text: string) => renderText(text),
    align: "center" as const,
  },
  {
    title: "情感分值",
    dataIndex: "sentiment",
    render: (text: string) => renderText(text),
    align: "center" as const,
  },
  {
    title: "扬言分值",
    dataIndex: "threaten",
    render: (text: string) => renderText(text),
    align: "center" as const,
  },
];

/**
 * 生成详情弹窗的表单数据
 * @param record 工单记录数据
 * @returns 格式化的表单数据
 */
export const generateFormData = (
  record: TicketRecord
): DetailModalProps["formData"] => {
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
    {
      key: "challenge_score",
      label: "治理挑战指数",
      value: challenge_score,
    },
    {
      key: "date",
      label: "诉求时间",
      value: date,
    },
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
            columns={sourceTableColumns}
            pagination={false}
          />
        );
      },
    },
    {
      key: "c1",
      label: "分类",
      value: `${c1}/${c2}/${c3}/${category}`,
    },
    {
      key: "smqt",
      label: "市民群体",
      value: smqt,
    },
    {
      key: "address_detail",
      label: "详细地址",
      value: address_detail,
    },
  ];
};
