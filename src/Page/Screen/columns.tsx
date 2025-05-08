import { Column } from "./components/ComTable";

export const columns1: Column<any>[] = [
  {
    title: "时间",
    dataIndex: "date",
    align: "left",
    width: 100,
    render: (text: string) => {
      return text.split(" ")[0];
    },
  },
  {
    title: "诉求内容",
    dataIndex: "content",
    width: 100,
    align: "left",
  },
  {
    title: "二级分类",
    dataIndex: "c2",
    width: 120,
    align: "left",
  },
  {
    title: "威胁指数",
    dataIndex: "threaten",
    width: 80,
    align: "left",
    render: (text: number) => (
      <span style={{ color: text > 0.8 ? "red" : "inherit" }}>{text}</span>
    ),
  },
];
export const columns4: Column<any>[] = [
  {
    title: "街道",
    dataIndex: "street",
    width: 80,
    align: "left",
  },
  {
    title: "责任社区",
    dataIndex: "community",
    width: 80,
    align: "left",
  },
  {
    title: "攻坚项目",
    dataIndex: "project",
    width: 150,
    align: "left",
  },
  {
    title: "热点事项",
    dataIndex: "content",
    width: 150,
    align: "left",
  },
];
export const columns2: Column<any>[] = [
  {
    title: "时间",
    dataIndex: "date",
    width: 80,
    align: "left",
    render: (text: string) => {
      return text.split(" ")[0];
    },
  },
  {
    title: "诉求内容",
    dataIndex: "content",
    width: 150,
    align: "left",
  },
  {
    title: "二级分类",
    dataIndex: "c2",
    width: 80,
    align: "left",
  },
  {
    title: "威胁指数",
    dataIndex: "threaten",
    width: 80,
    align: "left",
    render: (text: number) => (
      <span style={{ color: text > 0.8 ? "red" : "inherit" }}>{text}</span>
    ),
  },
];

export const columns3: Column<any>[] = [
  {
    title: "社区名",
    dataIndex: "community",
    width: 150,
    align: "left",
  },
  {
    title: "重点事项",
    dataIndex: "category",
    width: 200,
    align: "left",
  },
  {
    title: "诉求量",
    dataIndex: "count",
    width: 80,
    align: "left",
    render: (text: number) => (
      <span style={{ color: text > 50 ? "red" : "inherit" }}>{text}</span>
    ),
  },
];

export const worckColumns: any[] = [
  {
    title: "内容",
    dataIndex: "content",
    key: "content",
    align: "left",
    width: 300,
  },
  {
    title: "日期",
    dataIndex: "date",
    key: "date",
    align: "left",
    width: 100,
    render: (text: string) => {
      return text.split(" ")[0];
    },
  },
  {
    title: "来源",
    dataIndex: "ds1",
    key: "ds1",
    width: 100,
    align: "left",
  },
  {
    title: "威胁指数",
    dataIndex: "threaten",
    key: "threaten",
    align: "left",
    width: 100,
  },
];
