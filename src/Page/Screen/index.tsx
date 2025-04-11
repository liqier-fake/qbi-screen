import { useEffect, useMemo, useRef, useState } from "react";
import ComTitle from "./components/ComTitle";
import styles from "./index.module.less";
import { LeftRenderListType } from "./common.ts";
import classNames from "classnames";
import AIChat from "./components/AIChat";
import ComCustom from "./components/ComCustom";
import {
  peopleOption,
  areaOption,
  dataSource3,
  updateMockData,
  createMockData,
  ScreenDataType,
  dataSource1,
  dataSource2,
} from "./mock";
import LineChart from "./components/Chart/LineChart.tsx";
import Heatmap from "./components/Chart/Heatmap.tsx";
import ComSelect from "./components/ComSelect/index.tsx";
import ComTable from "./components/ComTable/index.tsx";
import { columns1, columns2, columns3 } from "./columns.tsx";
import BaseChart from "./components/Chart/BaseChart.tsx";
import { EChartsOption } from "echarts";

const Screen = () => {
  const [trendKey, setTrendKey] = useState("");

  const [categoryKey, setCategoryKey] = useState("");

  const [focusKey, setFocusKey] = useState("");

  const [requestKey, setRequestKey] = useState("");

  const [screenData, setScreenData] = useState<ScreenDataType>(
    createMockData()
  );

  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
              <ComTable columns={columns3} dataSource={dataSource3}></ComTable>
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
        title: "三级趋势与预测",
        render: (
          <div className={styles.warp}>
            <LineChart
              {...screenData.lineData}
              enableSlide={true}
              slideInterval={2000}
              visibleDataPoints={8}
            />
          </div>
        ),
      },
    ],
    [
      screenData.oneData,
      screenData.twoData,
      screenData.lineData,
      trendKey,
      focusKey,
      categoryKey,
      pieOption,
    ]
  );
  const rightRenderList: LeftRenderListType[] = useMemo(
    () => [
      {
        title: "人群画像",
        render: <ComCustom type="cardThree" data={screenData.threeData} />,
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
    </div>
  );
};

export default Screen;
