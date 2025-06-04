import { Column } from "./components/ComTable";

// 定义数据类型接口
interface TableData {
  [key: string]: any;
}

export const columns1: Column<TableData>[] = [
  {
    title: "社区",
    dataIndex: "name",
    align: "left",
    width: 20,
    render: (text: string) => {
      return text?.split(" ")[0] || "";
    },
  },
  {
    title: "简介",
    dataIndex: "intro",
    width: 40,
    align: "left",
  },
  {
    title: "挑战指数",
    dataIndex: "challenge_score",
    width: 20,
    align: "left",
    render: (text: number) => (
      <span style={{ color: text > 0.8 ? "red" : "inherit" }}>{text}</span>
    ),
  }
];



export const columns4: Column<TableData>[] = [
  {
    title: "街道",
    dataIndex: "street",
    width: 20,
    align: "left",
  },
  {
    title: "责任社区",
    dataIndex: "community",
    width: 20,
    align: "left",
  },
  {
    title: "攻坚项目",
    dataIndex: "challenge",
    width: 30,
    align: "left",
  },
  {
    title: "智能推荐",
    dataIndex: "llm_hot_items",
    width: 30,
    align: "left",
  },
];

export const columns2: Column<TableData>[] = [
  {
    title: "时间",
    dataIndex: "date",
    width: 15,
    align: "left",
    render: (text: string) => {
      return text?.split(" ")[0] || "";
    },
  },
  {
    title: "诉求内容",
    dataIndex: "content",
    width: 45,
    align: "left",
  },
  {
    title: "二级分类",
    dataIndex: "c2",
    width: 20,
    align: "left",
  },
  {
    title: "治理挑战指数",
    dataIndex: "challenge_score",
    width: 20,
    align: "left",
    render: (text: number) => (
      <span style={{ color: text > 0.8 ? "red" : "inherit" }}>{text}</span>
    ),
  },
];

export const columns3: Column<TableData>[] = [
  {
    title: "社区名",
    dataIndex: "community",
    width: 30,
    align: "left",
  },
  {
    title: "重点事项",
    dataIndex: "category",
    width: 45,
    align: "left",
  },
  {
    title: "诉求量",
    dataIndex: "count",
    width: 25,
    align: "left",
    render: (text: number) => (
      <span style={{ color: text > 50 ? "red" : "inherit" }}>{text}</span>
    ),
  },
];

export const worckColumns: Column<TableData>[] = [
  {
    title: "内容",
    dataIndex: "content",
    width: 40,
    align: "left",
  },
  {
    title: "日期",
    dataIndex: "date",
    width: 20,
    align: "left",
    render: (text: string) => {
      return text?.split(" ")[0] || "";
    },
  },
  {
    title: "来源",
    dataIndex: "ds1",
    width: 20,
    align: "left",
  },
  {
    title: "治理挑战指数",
    dataIndex: "challenge_score",
    width: 20,
    align: "left",
  },
];
