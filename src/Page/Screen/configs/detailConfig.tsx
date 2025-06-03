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
export const sourceTableColumns = (list: { name: string }[]) => {
  return list?.map(({ name }, index) => {
    return {
      title: name,
      dataIndex: index,
      render: (text: string) => renderText(text),
      align: "center" as const,
    };
  });
};
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
    challenge_score_details = [],
  } = record;

  const dataList: { [key: string]: any } = {};

  challenge_score_details.forEach(({ score, weight }, index) => {
    const key = String(index);
    dataList[key] = `${score}\n(${weight})`;
  });

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
            dataSource={[dataList]}
            columns={sourceTableColumns(challenge_score_details || [])}
            pagination={false} // 不显示分页
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
