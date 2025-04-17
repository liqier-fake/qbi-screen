import { Datum } from "@antv/ava";
import { Table, Tabs, TabsProps } from "antd";
import { CodePreview } from "./code-preview";
import { AutoChart, BackEndChartType, getChartType } from "../chart/autoChart";
import { useState } from "react";
import { compact } from "lodash";

function ChartView({
  data,
  type,
  sql,
}: {
  data: Datum[];
  type: BackEndChartType;
  sql: string;
}) {
  const [showChart, setShowChart] = useState<boolean>(false);
  console.log(showChart);

  const columns = data?.[0]
    ? Object.keys(data?.[0])?.map((item) => {
        return {
          title: item,
          dataIndex: item,
          key: item,
        };
      })
    : [];
  const ChartItem = {
    key: "chart",
    label: "Chart",
    children: (
      <AutoChart
        onRenderChartType={(chartType) => {
          console.log(chartType);
          setShowChart(Boolean(chartType));
        }}
        data={data}
        chartType={getChartType(type)}
      />
    ),
  };

  const DataItem = {
    key: "data",
    label: "Data",
    children: (
      <Table dataSource={data} columns={columns} scroll={{ x: "auto" }} />
    ),
  };

  const SqlItem = {
    key: "sql",
    label: "SQL",
    children: <CodePreview language="sql" code={sql} />,
  };

  const TabItems: TabsProps["items"] =
    type === "response_table"
      ? [DataItem]
      : compact([ChartItem, DataItem, SqlItem]);

  return (
    <Tabs
      defaultActiveKey={type === "response_table" ? "data" : "chart"}
      items={TabItems}
      size="small"
    />
  );
}

export default ChartView;
