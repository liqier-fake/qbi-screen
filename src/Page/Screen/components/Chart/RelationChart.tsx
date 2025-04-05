import React, { useMemo } from "react";
import BaseChart from "./BaseChart";
import type { EChartsOption } from "echarts";

// 节点数据类型定义
interface NodeData {
  name: string;
  value: number;
  itemStyle?: {
    color: string;
  };
  symbolSize: number;
  x?: number;
  y?: number;
}

// 组件 Props 类型定义
interface RelationChartProps {
  // 中心节点数据
  centerNode?: NodeData;
  // 周边节点数据
  nodes: NodeData[];
}

const RelationChart: React.FC<RelationChartProps> = ({
  centerNode = {
    name: "新市民劳动者服务与保障",
    value: 100,
    itemStyle: {
      color: "#36CEDA",
    },
    symbolSize: 80,
    x: 0,
    y: 0,
  },
  nodes = [],
}) => {
  // 合并中心节点和周边节点
  const data = useMemo(() => [centerNode, ...nodes], [centerNode, nodes]);

  // 生成连接关系
  const links = useMemo(
    () =>
      nodes.map((item) => ({
        source: centerNode.name,
        target: item.name,
        lineStyle: {
          color: "#304766",
          width: 1,
          type: "dashed" as const,
        },
      })),
    [nodes, centerNode.name]
  );

  const option = useMemo(
    () =>
      ({
        backgroundColor: "#001529",
        tooltip: {
          show: true,
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: "quinticInOut",
        series: [
          {
            type: "graph",
            layout: "circular",
            circular: {
              rotateLabel: true,
            },
            data,
            links,
            roam: false,
            label: {
              show: true,
              position: "right",
              color: "#fff",
              fontSize: 12,
            },
            lineStyle: {
              color: "#304766",
              width: 1,
              type: "dashed",
            },
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 1,
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.3)",
            },
            emphasis: {
              focus: "adjacency",
              lineStyle: {
                width: 2,
              },
              label: {
                fontSize: 14,
              },
            },
          },
        ],
      } as EChartsOption),
    [data, links]
  );

  return <BaseChart option={option} />;
};

export default RelationChart;
