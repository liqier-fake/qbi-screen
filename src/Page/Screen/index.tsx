import { useEffect, useMemo, useRef, useState } from "react";
import ComTitle from "./components/ComTitle";
import styles from "./index.module.less";
import { LeftRenderListType } from "./common.ts";
import classNames from "classnames";
import markdownit from "markdown-it";
import AIChat from "./components/AIChat";
import ComCustom from "./components/ComCustom";
import {
  peopleOption,
  areaOption,
  updateMockData,
  createMockData,
  ScreenDataType,
  dataSource1,
  dataSource2,
  dataSource4,
} from "./mock";
import LineChart from "./components/Chart/LineChart.tsx";
import Heatmap from "./components/Chart/Heatmap.tsx";
import ComSelect from "./components/ComSelect/index.tsx";
import ComTable from "./components/ComTable/index.tsx";
import {
  columns1,
  columns2,
  columns3,
  columns4,
  worckColumns,
} from "./columns.tsx";
import BaseChart from "./components/Chart/BaseChart.tsx";
import { EChartsOption } from "echarts";
import { Flex, Modal, Table, Typography } from "antd";
import { apiGetWorkDetail, apiGetWorkList } from "./api.ts";
import { fetchEventSource } from "@microsoft/fetch-event-source";
// import FlipNumberDemo from "./components/FlipNumber/demo.tsx";

const Screen = () => {
  const [trendKey, setTrendKey] = useState("");

  const [categoryKey, setCategoryKey] = useState("");

  const [focusKey, setFocusKey] = useState("");

  const [requestKey, setRequestKey] = useState("");

  const [screenData, setScreenData] = useState<ScreenDataType>(
    createMockData()
  );

  const timer = useRef<NodeJS.Timeout | null>(null);

  const getScreenData = async () => {
    const { data } = await apiGetWorkList();
    setScreenData((prevData) => ({
      ...prevData,
      wordTableData: data,
    }));
  };

  useEffect(() => {
    getScreenData();

    return;
    const updateData = async () => {
      try {
        setScreenData((prevData) => updateMockData(prevData));
      } catch (err) {
        console.error("数据更新失败:", err);
      }
    };

    timer.current = setInterval(updateData, 3000);
    return () => clearInterval(timer.current!);
  }, []);

  const pieOption: EChartsOption = useMemo(() => {
    return {
      backgroundColor: "#0b1e3a",
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c}个 ({d}%)",
      },
      grid: {
        top: 0,
        left: 0,
        // containLabel: true,
      },
      legend: {
        orient: "vertical",
        left: "center",
        bottom: "0",
        itemWidth: 14,
        itemHeight: 14,
        textStyle: {
          color: "#fff",
          fontSize: 10,
        },
        data: [
          { name: "高 5个", icon: "circle" },
          { name: "低 2个", icon: "circle" },
          { name: "中 3个", icon: "circle" },
        ],
      },
      color: ["#e74c3c", "#3498db", "#2ecc71"], // 高:红, 低:蓝, 中:绿
      series: [
        {
          name: "等级分布",
          type: "pie",
          center: ["50%", "20%"],
          radius: ["50%", "20%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: 5, name: "高 5个" },
            { value: 2, name: "低 2个" },
            { value: 3, name: "中 3个" },
          ],
        },
      ],
    };
  }, []);
  const cloudOption: EChartsOption = useMemo(() => {
    return {
      backgroundColor: "transparent",
      graphic: [
        {
          type: "circle",
          shape: {
            cx: 400,
            cy: 300,
            r: 180,
          },
          style: {
            stroke: "#dddd",
            lineWidth: 1,
            lineDash: [5, 5],
            fill: "transparent",
          },
        },
        {
          type: "circle",
          shape: {
            cx: 400,
            cy: 300,
            r: 260,
          },
          style: {
            stroke: "#2C83C4",
            lineWidth: 1,
            lineDash: [5, 5],
            fill: "transparent",
          },
        },
      ],
      series: [
        {
          type: "graph",
          layout: "none",
          coordinateSystem: undefined,
          label: {
            show: true,
            color: "#fff",
            fontSize: 14,
            fontWeight: "bold",
          },
          symbolSize: 80,
          data: (() => {
            const centerX = 400;
            const centerY = 300;
            const innerRadius = 180;
            const outerRadius = 260;

            const innerLabels = [
              "生活服务",
              "积分入学",
              "农民工培训",
              "出租房屋管理",
              "其他",
            ];

            const outerLabels = [
              "权益保障",
              "就业创业服务",
              "职业技能培训",
              "乐居保障",
              "外来人员子女教育",
            ];

            const centerNode = {
              name: "新市民劳动者服务与保障",
              x: centerX,
              y: centerY,
              symbolSize: 110,
              itemStyle: { color: "#30D8FF" },
              label: { fontSize: 16 },
            };

            const innerNodes = innerLabels.map((label, i) => {
              const angle = (2 * Math.PI * i) / innerLabels.length;
              return {
                name: label,
                x: centerX + innerRadius * Math.cos(angle),
                y: centerY + innerRadius * Math.sin(angle),
                itemStyle: { color: "#0079C2" },
              };
            });

            const outerNodes = outerLabels.map((label, i) => {
              const angle = (2 * Math.PI * i) / outerLabels.length;
              return {
                name: label,
                x: centerX + outerRadius * Math.cos(angle),
                y: centerY + outerRadius * Math.sin(angle),
                itemStyle: { color: "#3DA2FF" },
              };
            });

            return [centerNode, ...innerNodes, ...outerNodes];
          })(),
          links: [],
          lineStyle: {
            opacity: 0,
          },
        },
      ],
    };
  }, []);

  // 攻坚项目弹窗
  const [workOpen, setWorkOpen] = useState(false);
  const [workDetail, setWorkDetail] = useState<any>(null);
  const [workRecord, setWorkRecord] = useState<any>(null);
  const [wrokLoading, setWorkLoading] = useState(false);
  const [workAiComment, setWorkAiComment] = useState<string>("");

  // 直接在组件中实现自动滚动逻辑
  const [userScrolled, setUserScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 处理滚动事件
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    // 如果用户向上滚动（不在底部），则标记为用户已滚动
    if (scrollHeight - scrollTop - clientHeight > 20) {
      setUserScrolled(true);
    } else {
      // 如果滚动到底部，重置用户滚动状态
      setUserScrolled(false);
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    if (scrollContainerRef.current && !userScrolled) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // 内容变化时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [workAiComment]);

  // 当模态框打开时重置
  useEffect(() => {
    if (workOpen) {
      setUserScrolled(false);
      setWorkAiComment("");
    }
  }, [workOpen]);

  const leftRenderList: LeftRenderListType[] = useMemo(
    () => [
      {
        title: "数据来源",
        render: <ComCustom type="cardOne" data={screenData.oneData} />,
      },
      {
        title: "民有所呼 我有所为",
        render: <ComCustom type="cardTwo" data={screenData.twoData} />,
      },
      {
        title: "二级趋势预测",
        render: (
          <div className={styles.warp}>
            <ComSelect
              className={styles.select}
              options={areaOption}
              onChange={(value) => {
                setTrendKey(value);
              }}
              value={trendKey}
            />
            <LineChart
              {...screenData.lineData}
              enableSlide={true}
              slideInterval={2000}
              visibleDataPoints={8}
            />
          </div>
        ),
      },
      {
        title: "攻坚重点",
        render: (
          <div className={styles.warp}>
            <ComSelect
              className={styles.select}
              options={areaOption}
              onChange={(value) => {
                setFocusKey(value);
              }}
              value={focusKey}
            />
            <div className={styles.twoTrend}>
              <div className={styles.pieWrap}>
                <BaseChart option={pieOption}></BaseChart>
              </div>
              <ComTable
                columns={columns3}
                dataSource={screenData.wordTableData || []}
                onRowClick={async (record) => {
                  setWorkOpen(true);
                  setWorkRecord(record);

                  try {
                    if (wrokLoading) return;
                    setWorkLoading(true);
                    const { data } = await apiGetWorkDetail({
                      category: record?.category as string,
                      street: record?.street as string,
                    });

                    setWorkDetail(data.data);

                    const ctr = new AbortController();

                    console.log(data.data, "data.data");

                    const content = data?.data
                      ?.map((item: { content: string }) => item.content)
                      .join("");

                    fetchEventSource(
                      `${import.meta.env.VITE_BASE_API_URL}/v1/process-data`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization:
                            "Bearer " + import.meta.env.VITE_CHAT_TOKEN,
                        },
                        body: JSON.stringify({
                          task: "summary+breakdown",
                          content,
                        }),
                        signal: ctr.signal,
                        onmessage(msg) {
                          const res = JSON.parse(msg.data);
                          console.log(res, "res");

                          setWorkAiComment((wr) => {
                            return wr + res.content;
                          });
                        },
                        onclose() {},
                        onerror(err) {
                          console.error("请求出错:", err);
                          // **阻止自动重试**
                          throw new Error("请求失败，终止 fetchEventSource");
                        },
                      }
                    );

                    console.log(data, "data");
                  } catch (err) {
                    console.log(`apiGEtWorkDetail err : ${err}`);
                  } finally {
                    setWorkLoading(false);
                  }
                }}
              ></ComTable>
            </div>
          </div>
        ),
      },
      {
        title: "二级分类",
        render: (
          <div className={styles.warp}>
            <ComSelect
              className={styles.select}
              options={areaOption}
              onChange={(value) => {
                setCategoryKey(value);
              }}
              value={categoryKey}
            />
            <ComTable
              className={styles.table}
              columns={columns1}
              dataSource={dataSource1}
            />
          </div>
        ),
      },
      {
        title: "社会攻坚项目",
        render: (
          <div className={styles.warp}>
            <ComTable
              className={styles.table}
              columns={columns4}
              dataSource={dataSource4}
            />
          </div>
        ),
      },
    ],
    [
      screenData.oneData,
      screenData.twoData,
      screenData.lineData,
      screenData.wordTableData,
      trendKey,
      focusKey,
      pieOption,
      categoryKey,
      wrokLoading,
    ]
  );
  const rightRenderList: LeftRenderListType[] = useMemo(
    () => [
      {
        title: "人群画像",
        render: (
          <Flex justify="center" align="center" className={styles.peopleDraw}>
            <ComCustom type="cardThree" data={screenData.threeData} />
          </Flex>
        ),
      },
      {
        title: "治理画像",
        render: (
          <div className={styles.manageChart}>
            <Heatmap
              className={styles.manageChartItem}
              enableSlide={true}
              slideInterval={3500}
              visibleDataPoints={3}
            />
            <LineChart
              {...screenData.lineData}
              enableSlide={true}
              slideInterval={2000}
              visibleDataPoints={8}
              className={styles.manageChartItem}
            />
          </div>
        ),
      },
    ],
    [screenData.lineData, screenData.threeData]
  );

  // 初始化 markdown-it
  const md = markdownit({
    html: true, // 允许 HTML 标签
    breaks: true, // 转换换行符为 <br>
    linkify: true, // 自动转换 URL 为链接
  });

  return (
    <div className={styles.screen}>
      {/* 标题 */}
      <div className={styles.header}>
        <span
          className={styles.title}
          onClick={() => {
            clearInterval(timer.current!);
          }}
        >
          苏州工业园区"智汇民意"民情分析平台
        </span>
      </div>
      {/* 内容 */}
      <div className={styles.contentWrap}>
        {/* 左侧 */}
        <div className={styles.left}>
          {
            <div className={styles.left}>
              {leftRenderList.map((item) => (
                <div className={styles.leftItem} key={item.title}>
                  <ComTitle
                    key={item.title}
                    title={item.title}
                    type={"default"}
                  />
                  <div className={styles.leftItemContent}>{item.render}</div>
                </div>
              ))}
            </div>
          }
        </div>
        {/* 中间 */}
        <div className={styles.center}>
          {/* <FlipNumberDemo /> */}
          <div className={styles.centerItem}>
            <AIChat />
          </div>
        </div>
        {/* 右侧 */}
        <div className={styles.right}>
          {rightRenderList.map((item, i) => (
            <div
              className={classNames(styles.rightItem, {
                [styles.one]: i === 0,
              })}
              key={item.title}
            >
              <ComTitle key={item.title} title={item.title} type={"middle"} />
              <div className={styles.rightItemContent}>{item.render}</div>
            </div>
          ))}
          <div
            className={classNames(styles.rightItem, styles.rightItemSpecial)}
          >
            <div className={styles.rightItemLeft}>
              <ComTitle title="关注人群重点诉求" type={"default"} />
              <div className={styles.warp}>
                <ComSelect
                  className={styles.select}
                  options={peopleOption}
                  onChange={(value) => {
                    setRequestKey(value);
                  }}
                  value={requestKey}
                />
                <ComTable
                  className={styles.table}
                  columns={columns2}
                  dataSource={dataSource2}
                />
              </div>
            </div>

            <div className={styles.rightItemRight}>
              <ComTitle title="词云" type={"default"} />

              <div className={styles.cloud}>
                <BaseChart
                  style={{ width: "100%", height: "100%" }}
                  option={cloudOption}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        destroyOnClose
        title={workRecord?.category + "工单详情"}
        open={workOpen}
        onOk={() => setWorkOpen(false)}
        loading={wrokLoading}
        onCancel={() => setWorkOpen(false)}
        width={"50%"}
        centered
        footer={null}
        className={styles.workModal}
      >
        <Flex
          className={styles.workMsg}
          style={{ maxHeight: "300px", overflow: "auto" }}
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <Typography style={{ color: "#000 !important" }}>
            <div
              dangerouslySetInnerHTML={{ __html: md.render(workAiComment) }}
            />
          </Typography>
        </Flex>

        <Table
          dataSource={workDetail || []}
          columns={worckColumns}
          loading={wrokLoading}
        />
      </Modal>
    </div>
  );
};

export default Screen;
