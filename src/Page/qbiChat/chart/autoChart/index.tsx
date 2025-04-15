import { DownloadOutlined } from "@ant-design/icons";
import { Advice, Advisor, Datum } from "@antv/ava";
import { Chart, ChartRef } from "@berryv/g2-react";
import { Button, Col, Empty, Row, Select, Space, Tooltip } from "antd";
import { compact, concat, uniq } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { downloadImage } from "../helpers/downloadChartImage";
import { customizeAdvisor, getVisAdvices } from "./advisor/pipeline";
import { defaultAdvicesFilter } from "./advisor/utils";
import { customCharts } from "./charts";
import { processNilData, sortData } from "./charts/util";
import {
  AutoChartProps,
  ChartType,
  CustomAdvisorConfig,
  CustomChart,
  Specification,
} from "./types";
const { Option } = Select;

export const AutoChart = (props: AutoChartProps) => {
  const { data: originalData, chartType, scopeOfCharts, ruleConfig } = props;
  // 处理空值数据 (为'-'的数据)
  const data = processNilData(originalData) as Datum[];

  const [advisor, setAdvisor] = useState<Advisor>();
  const [advices, setAdvices] = useState<Advice[]>([]);
  const [renderChartType, setRenderChartType] = useState<ChartType>();
  const chartRef = useRef<ChartRef>(null);

  useEffect(() => {
    const input_charts: CustomChart[] = customCharts;
    const advisorConfig: CustomAdvisorConfig = {
      charts: input_charts,
      scopeOfCharts: {
        // 排除面积图
        exclude: [
          "area_chart",
          "stacked_area_chart",
          "percent_stacked_area_chart",
        ],
      },
      ruleConfig,
    };
    setAdvisor(customizeAdvisor(advisorConfig));
  }, [ruleConfig, scopeOfCharts]);

  /** 将 AVA 得到的图表推荐结果和模型的合并 */
  const getMergedAdvices = (avaAdvices: Advice[]) => {
    if (!advisor) return [];
    const filteredAdvices = defaultAdvicesFilter({
      advices: avaAdvices,
    });
    const allChartTypes = uniq(
      compact(
        concat(
          chartType,
          avaAdvices.map((item) => item.type)
        )
      )
    );
    const allAdvices = allChartTypes
      .map((chartTypeItem) => {
        const avaAdvice = filteredAdvices.find(
          (item) => item.type === chartTypeItem
        );
        // 如果在 AVA 推荐列表中，直接采用推荐列表中的结果
        if (avaAdvice) {
          return avaAdvice;
        }
        // 如果不在，则单独为其生成图表 spec
        const dataAnalyzerOutput = advisor.dataAnalyzer.execute({ data });
        if ("data" in dataAnalyzerOutput) {
          const specGeneratorOutput = advisor.specGenerator.execute({
            data: dataAnalyzerOutput.data,
            dataProps: dataAnalyzerOutput.dataProps,
            chartTypeRecommendations: [{ chartType: chartTypeItem, score: 1 }],
          });
          if ("advices" in specGeneratorOutput)
            return specGeneratorOutput.advices?.[0];
        }
      })
      .filter((advice) => advice?.spec) as Advice[];
    return allAdvices;
  };

  useEffect(() => {
    if (data && advisor) {
      const avaAdvices = getVisAdvices({
        data,
        myChartAdvisor: advisor,
      });
      // 合并模型推荐的图表类型和 ava 推荐的图表类型
      const allAdvices = getMergedAdvices(avaAdvices);
      setAdvices(allAdvices);
      setRenderChartType(allAdvices[0]?.type as ChartType);
    }
  }, [JSON.stringify(data), advisor, chartType]);

  const chart_map = {
    stacked_column_chart: "堆叠柱状图",
    column_chart: "柱状图",
    percent_stacked_column_chart: "百分比堆叠柱状图",
    grouped_column_chart: "簇形柱状图",
    time_column: "簇形柱状图",
    pie_chart: "饼图",
    line_chart: "折线图",
    area_chart: "面积图",
    stacked_area_chart: "堆叠面积图",
    scatter_plot: "散点图",
    bubble_chart: "气泡图",
    stacked_bar_chart: "堆叠条形图",
    bar_chart: "条形图",
    percent_stacked_bar_chart: "百分比堆叠条形图",
    grouped_bar_chart: "簇形条形图",
    water_fall_chart: "瀑布图",
    table: "表格",
    donut_chart: "环形图",
    multi_line_chart: "多折线图",
    multi_measure_column_chart: "多指标柱形图",
    multi_measure_line_chart: "多指标折线图",
  };

  const visComponent = useMemo(() => {
    /* Advices exist, render the chart. */
    if (advices?.length > 0) {
      const chartTypeInput = renderChartType ?? advices[0].type;
      const spec: Specification =
        advices?.find((item: Advice) => item.type === chartTypeInput)?.spec ??
        undefined;
      if (spec) {
        if (
          spec.data &&
          ["line_chart", "step_line_chart"].includes(chartTypeInput)
        ) {
          // 处理 ava 内置折线图的排序问题
          const dataAnalyzerOutput = advisor?.dataAnalyzer.execute({ data });
          if (dataAnalyzerOutput && "dataProps" in dataAnalyzerOutput) {
            spec.data = sortData({
              data: spec.data,
              xField: dataAnalyzerOutput.dataProps?.find(
                (field: any) => field.recommendation === "date"
              ),
              chartType: chartTypeInput,
            });
          }
        }
        if (chartTypeInput === "pie_chart" && spec?.encode?.color) {
          // 补充饼图的 tooltip title 展示
          spec.tooltip = { title: { field: spec.encode.color } };
        }
        return (
          <Chart
            key={chartTypeInput}
            options={{
              ...spec,
              autoFit: true,
              theme: "light",
              height: 300,
            }}
            ref={chartRef}
          />
        );
      }
    }
  }, [advices, renderChartType]);

  if (renderChartType) {
    return (
      <div>
        <Row justify="space-between" className="mb-2">
          <Col>
            <Space>
              <span>建议</span>
              <Select
                className="w-52"
                value={renderChartType}
                placeholder={"Chart Switcher"}
                onChange={(value) => setRenderChartType(value)}
                size={"small"}
                style={{ width: "120px" }}
              >
                {advices?.map((item) => {
                  const name = chart_map[item.type as keyof typeof chart_map];
                  console.log(item.type);
                  return (
                    <Option key={item.type} value={item.type}>
                      <Tooltip title={name} placement={"right"}>
                        <div>{name}</div>
                      </Tooltip>
                    </Option>
                  );
                })}
              </Select>
            </Space>
          </Col>
          <Col>
            <Tooltip title={"下载"}>
              <Button
                onClick={() => downloadImage(chartRef.current, renderChartType)}
                icon={<DownloadOutlined />}
                type="text"
              />
            </Tooltip>
          </Col>
        </Row>
        <div className="flex">{visComponent}</div>
      </div>
    );
  }

  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={"暂无合适的可视化视图"}
    />
  );
};

export * from "./helpers";
