import { Column } from "./components/ComTable";

export const columns1: Column<any>[] = [
  {
    title: "时间",
    dataIndex: "time",
    width: 120,
    align: "left",
  },
  {
    title: "诉求内容",
    dataIndex: "content",
    width: 200,
    align: "left",
  },
  {
    title: "二级分类",
    dataIndex: "category",
    width: 120,
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
export const columns4: Column<any>[] = [
  {
    title: "街道",
    dataIndex: "street",
    width: 150,
    align: "left",
  },
  {
    title: "责任社区",
    dataIndex: "community",
    width: 150,
    align: "left",
  },
  {
    title: "攻坚项目",
    dataIndex: "project",
    width: 300,
    align: "left",
  },
  {
    title: "热点事项",
    dataIndex: "content",
    width: 400,
    align: "left",
  },
];
export const columns2: Column<any>[] = [
  {
    title: "时间",
    dataIndex: "word",
    width: 100,
    align: "left",
  },
  {
    title: "诉求内容",
    dataIndex: "content",
    width: 200,
    align: "left",
  },
  {
    title: "一级/二级分类",
    dataIndex: "reliefCategory",
    width: 180,
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

export const columns3: Column<any>[] = [
  {
    title: "社区名",
    dataIndex: "community",
    width: 150,
    align: "left",
  },
  {
    title: "重点事项",
    dataIndex: "keyMatter",
    width: 180,
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
