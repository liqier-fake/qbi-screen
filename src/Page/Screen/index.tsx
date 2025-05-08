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
  createMockData,
  ScreenDataType,
  dataSource4,
} from "./mock";
import LineChart from "./components/Chart/LineChart.tsx";
import Heatmap from "./components/Chart/Heatmap.tsx";
import ComSelect from "./components/ComSelect/index.tsx";
import ComTable from "./components/ComTable/index.tsx";
import { columns1, columns2, columns3, columns4 } from "./columns.tsx";
import BaseChart from "./components/Chart/BaseChart.tsx";
import { EChartsOption } from "echarts";
import { Flex, Button, Select } from "antd";
import {
  apiGetGovProfile1,
  apiGetGovProfile2,
  apiGetKeyFocus,
  apiGetKeyWords,
  apiGetLevel2Trend,
  apiGetSocialRisk,
  apiGetStaticBasic,
  apiGetTicketCount,
  apiGetWorkDetail,
  BaseType,
  TimeRange,
} from "./api.ts";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import WorkModal from "./components/WorkMoal/index.tsx";
import { AuthChangeEventDetail } from "../../types/events";
import Map, {
  MapTypeEnum,
  MapTypeNames,
  TicketCountData,
  // streetNameToEnum,
} from "./components/Chart/Map.tsx";

const TimeRangeOption = [
  { label: "近7天", value: TimeRange.last_7_days },
  { label: "近30天", value: TimeRange.last_30_days },
  { label: "本周", value: TimeRange.this_week },
  { label: "上周", value: TimeRange.last_week },
  { label: "本月", value: TimeRange.this_month },
  { label: "上月", value: TimeRange.last_month },
  { label: "今年", value: TimeRange.this_year },
  { label: "去年", value: TimeRange.last_year },
];

const Screen = () => {
  const [trendKey, setTrendKey] = useState<string>(areaOption[0].value);

  const [categoryKey, setCategoryKey] = useState<string>(areaOption[0].value);

  const [focusKey, setFocusKey] = useState<string>(areaOption[2].value);

  const [requestKey, setRequestKey] = useState<string>(peopleOption[0].value);

  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.this_year);

  const [screenData, setScreenData] = useState<ScreenDataType>(
    createMockData()
  );

  const {
    twoCateGoryDataSource = [],
    socialRiskDataSource = [],
    govProfile2LineData = {
      xData: [],
      lineData: [],
    },

    level2TrendLineData = {
      xData: [],
      lineData: [],
    },
  } = screenData;

  const timer = useRef<NodeJS.Timeout | null>(null);

  // 添加地图类型状态
  const [currentMapType, setCurrentMapType] = useState<MapTypeEnum>(
    MapTypeEnum.area
  );
  // 添加工单数据状态
  const [ticketData, setTicketData] = useState<TicketCountData[]>([]);

  // 二级趋势预测
  const getLevel2TrendData = async () => {
    const {
      data: { data: level2TrendData },
    } = await apiGetLevel2Trend({
      time_range: timeRange,
      street: trendKey,
    });

    console.log(level2TrendData, "level2TrendData");

    const smqtGroups = new Set<string>();
    const monthData: { [key: string]: { [key: string]: number } } = {};

    Object.keys(level2TrendData).forEach((month) => {
      level2TrendData[month].forEach(
        ({ c2, count }: { c2: string; count: number }) => {
          smqtGroups.add(c2);
          if (!monthData[month]) {
            monthData[month] = {};
          }
          monthData[month][c2] = (monthData[month][c2] || 0) + count;
        }
      );
    });

    const sortedMonths = Object.keys(level2TrendData).sort();

    const lineData = {
      xData: sortedMonths,
      lineData: Array.from(smqtGroups)
        .map((c2) => {
          const data = sortedMonths.map((month) => monthData[month]?.[c2] || 0);

          if (data.some((val) => val > 0)) {
            return {
              name: c2,
              data,
            };
          }
          return null;
        })
        .filter(
          (item): item is { name: string; data: number[] } => item !== null
        ), // 使用类型谓词确保过滤掉null值
    };

    console.log(lineData, "level2TrendLineDatalevel2TrendLineData");

    setScreenData((prev) => ({
      ...prev,
      level2TrendLineData: lineData,
    }));
  };

  // 攻坚重点
  const getKeyFocusData = async () => {
    const {
      data: { data: keyFocusData },
    } = await apiGetKeyFocus({
      time_range: timeRange,
      street: focusKey,
    });
    console.log(keyFocusData, "keyFocusData");
    setScreenData((prev) => ({
      ...prev,
      keyFocusData,
    }));
  };

  // 二级分类
  const getTwoCateGoryData = async () => {
    const {
      data: { data: twoCateGoryData },
    } = await apiGetSocialRisk({
      time_range: timeRange,
      street: categoryKey,
    });

    setScreenData((prev) => ({
      ...prev,
      twoCateGoryDataSource: twoCateGoryData || [],
    }));
  };

  // 关注人群重点诉求
  const getSocialRiskData = async () => {
    const {
      data: { data: socialRiskData },
    } = await apiGetSocialRisk({
      time_range: timeRange,
      group: "新市民劳动者",
    });
    console.log(socialRiskData, "socialRiskData");
    setScreenData((prev) => ({
      ...prev,
      socialRiskDataSource: socialRiskData || [],
    }));
  };

  // 社会攻坚项目
  // const getSocialChallengeData = async () => {
  //   const { data:{data:socialChallengeData} } = await apiGetSocialChallenge({
  //     time_range: timeRange,
  //   });

  //   console.log(socialChallengeData, "socialChallengeData");

  //   setScreenData(prev => ({
  //     ...prev,
  //     dataSource4: socialChallengeData
  //   }));
  // };

  // 数据来源
  const getSourceCountData = async () => {
    const {
      data: { data: sourceData },
    } = await apiGetStaticBasic({
      time_range: timeRange,
      type: BaseType.source_count,
    });

    const sourceCountData = {
      total: sourceData
        ?.reduce((acc: number, item: { count: number }) => acc + item.count, 0)
        ?.toString(),
      list: sourceData.map((item: { source: string; count: number }) => ({
        title: item.source,
        value: item.count,
      })),
    };

    console.log(sourceCountData, "sourceData");

    setScreenData((prev) => ({
      ...prev,
      oneData: sourceCountData,
    }));
  };

  // 民有所呼 我有所为
  const getLevel1CountData = async () => {
    const {
      data: { data: level1Data },
    } = await apiGetStaticBasic({
      time_range: timeRange,
      type: BaseType.level1_count,
    });

    const level1CountData = {
      list: level1Data
        .map(({ c1, count }: { c1: string; count: number }) => {
          if (c1) {
            return {
              title: c1,
              value: count,
            };
          }
          return null;
        })
        ?.filter(Boolean),
    };

    console.log(level1CountData, "level1Data");

    setScreenData((prev) => ({
      ...prev,
      twoData: level1CountData,
    }));
  };

  // 人群画像
  const getPeopleTicketCountData = async () => {
    const {
      data: { data: peopleData },
    } = await apiGetStaticBasic({
      time_range: timeRange,
      type: BaseType.people_ticket_count,
    });

    const peopleTicketCountData = {
      list: peopleData.map(
        ({ smqt, count }: { smqt: string; count: number }) => {
          return {
            title: smqt,
            value: count,
          };
        }
      ),
    };

    console.log(peopleTicketCountData, "peopleTicketCountData");

    setScreenData((prev) => ({
      ...prev,
      threeData: peopleTicketCountData,
    }));
  };

  // 治理画像-热力图
  const getGovProfile1Data = async () => {
    const {
      data: { data: govProfile1Data },
    } = await apiGetGovProfile1({
      time_range: timeRange,
    });
    console.log(govProfile1Data, "govProfile1Data");
    setScreenData((prev) => ({
      ...prev,
      heatmapData: govProfile1Data,
    }));
  };

  // 治理画像-折线图
  const getGovProfile2Data = async () => {
    const {
      data: { data: govProfile2Data },
    } = await apiGetGovProfile2({
      time_range: timeRange,
    });

    // 准备LineChart所需的数据格式
    const smqtGroups = new Set<string>();
    const monthData: { [key: string]: { [key: string]: number } } = {};

    // 遍历所有月份数据并收集所有人群类型
    Object.keys(govProfile2Data).forEach((month) => {
      govProfile2Data[month].forEach(
        ({ smqt, count }: { smqt: string; count: number }) => {
          smqtGroups.add(smqt);
          // 初始化月份数据结构
          if (!monthData[month]) {
            monthData[month] = {};
          }

          // 只按smqt分类，相同smqt的count相加
          monthData[month][smqt] = (monthData[month][smqt] || 0) + count;
        }
      );
    });

    // 将所有月份按时间顺序排序
    const sortedMonths = Object.keys(govProfile2Data).sort();

    // 构建lineData数据结构，只按人群类型分组
    const lineData = {
      xData: sortedMonths,
      lineData: Array.from(smqtGroups)
        .map((smqt) => {
          const data = sortedMonths.map(
            (month) => monthData[month]?.[smqt] || 0
          );

          // 只返回有数据的系列（至少有一个非零值）
          if (data.some((val) => val > 0)) {
            return {
              name: smqt,
              data,
            };
          }
          return null;
        })
        .filter(
          (
            item
          ): item is {
            name: string;
            data: number[];
            itemStyle: { color: string };
          } => item !== null
        ), // 使用类型谓词确保过滤掉null值
    };

    console.log("转换后的lineData:", lineData);

    setScreenData((prev) => ({
      ...prev,
      govProfile2LineData: lineData,
    }));
  };

  // 词云数据
  const getKeyWordsData = async () => {
    const {
      data: { data: keyWordsData },
    } = await apiGetKeyWords({
      time_range: timeRange,
    });
    console.log(keyWordsData, "keyWordsData");
    setScreenData((prev) => ({
      ...prev,
      wordCloudData: keyWordsData,
    }));
  };

  // 区域工单数量统计 - 根据地图类型获取对应工单数据
  const getTicketCountData = async (
    mapType: MapTypeEnum = MapTypeEnum.area
  ) => {
    try {
      // 根据地图类型获取街道名称
      const streetName =
        mapType === MapTypeEnum.area ? undefined : MapTypeNames[mapType];

      // 调用接口获取工单数据
      const { data } = await apiGetTicketCount({
        time_range: timeRange,
        street: streetName,
      });

      console.log("工单数据:", data.data);
      // 确保数据符合 TicketCountData 接口格式
      const formattedData: TicketCountData[] = Array.isArray(data.data)
        ? data.data.map((item: { name: string; count: number | string }) => {
            // 确保count是数字类型，并处理可能的NaN情况
            const count =
              typeof item.count === "number"
                ? item.count
                : Number(item.count) || 0; // 使用 || 0 防止NaN

            return {
              name: item.name,
              count: count,
            };
          })
        : [];

      // 更新工单数据状态
      setTicketData(formattedData);
    } catch (error) {
      console.error("获取工单数据失败:", error);
      setTicketData([]);
    }
  };

  // 监听地图类型变化，获取对应的工单数据
  useEffect(() => {
    getTicketCountData(currentMapType);
  }, [currentMapType, timeRange]);

  // 处理地图类型选择变化
  const handleMapTypeChange = (value: MapTypeEnum) => {
    setCurrentMapType(value);
  };

  // 在地图区域点击时，处理地图下钻
  // const handleMapAreaClick = (areaName: string) => {
  //   if (currentMapType === MapTypeEnum.area && streetNameToEnum[areaName]) {
  //     const nextMapType = streetNameToEnum[areaName];
  //     setCurrentMapType(nextMapType);
  //   }
  // };

  useEffect(() => {
    // 数据来源
    getSourceCountData();
    // 民有所呼 我有所为
    getLevel1CountData();
    // 人群画像
    getPeopleTicketCountData();
    // 攻坚重点
    getKeyFocusData();
    // 二级分类
    getTwoCateGoryData();
    // 社会攻坚项目
    // getSocialChallengeData();
    // 关注人群重点诉求
    getSocialRiskData();
    // 词云数据
    getKeyWordsData();
    // 二级趋势预测
    getLevel2TrendData();
    // 治理画像-热力图
    getGovProfile1Data();
    // 治理画像-折线图
    getGovProfile2Data();
    // 区域工单数量统计 - 初始化时获取一次数据
    getTicketCountData();
  }, [timeRange]);

  // 二级趋势预测
  useEffect(() => {
    getLevel2TrendData();
  }, [trendKey]);

  // 攻坚重点
  useEffect(() => {
    getKeyFocusData();
  }, [focusKey]);

  // 二级分类
  useEffect(() => {
    getTwoCateGoryData();
  }, [categoryKey]);
  // 关注人群重点诉求
  useEffect(() => {
    getSocialRiskData();
  }, [requestKey]);

  const pieOption: EChartsOption = useMemo(() => {
    // 统计不同等级的数量
    const levelCounts = {
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
    };

    // 遍历keyFocusData统计各等级数量
    (screenData.keyFocusData || []).forEach(
      (item: { count: number; category: string; level: string }) => {
        // 记录总数
        levelCounts.total++;

        // 根据数值范围判断等级
        if (item.count > 50) {
          levelCounts.high++;
        } else if (item.count > 10) {
          levelCounts.medium++;
        } else if (item.count >= 1) {
          levelCounts.low++;
        }
      }
    );

    // 打印统计结果
    console.log("攻坚重点统计:", {
      数据总量: levelCounts.total,
      高危: levelCounts.high,
      中危: levelCounts.medium,
      低危: levelCounts.low,
      原始数据: screenData.keyFocusData,
    });

    // 定义显示文本
    const highText = `高 ${levelCounts.high}个`;
    const mediumText = `中 ${levelCounts.medium}个`;
    const lowText = `低 ${levelCounts.low}个`;

    return {
      backgroundColor: "#0b1e3a",
      tooltip: {
        show: false,
        trigger: "item",
        formatter: "{b}: {c}个 ({d}%)",
      },
      grid: {
        top: 0,
        left: 0,
      },
      legend: {
        orient: "vertical",
        left: "center",
        bottom: "10",
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          color: "#fff",
          fontSize: 10,
        },
        data: [
          { name: highText, icon: "circle" },
          { name: mediumText, icon: "circle" },
          { name: lowText, icon: "circle" },
        ],
      },
      color: ["#e74c3c", "#2ecc71", "#3498db"], // 高:红, 中:绿, 低:蓝
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
            { value: levelCounts.high, name: highText },
            { value: levelCounts.medium, name: mediumText },
            { value: levelCounts.low, name: lowText },
          ],
        },
      ],
    };
  }, [screenData.keyFocusData]);
  const cloudOption: EChartsOption = useMemo(() => {
    // 从screenData中获取词云数据
    const wordCloudData = screenData.wordCloudData || [];

    return {
      backgroundColor: "transparent",
      // 移除背景圆形线条
      // graphic: [
      //   {
      //     type: "circle",
      //     shape: {
      //       cx: 400,
      //       cy: 300,
      //       r: 180,
      //     },
      //     style: {
      //       // stroke: "#dddd",
      //       lineWidth: 1,
      //       lineDash: [5, 5],
      //       fill: "transparent",
      //     },
      //   },
      //   {
      //     type: "circle",
      //     shape: {
      //       cx: 400,
      //       cy: 300,
      //       r: 260,
      //     },
      //     style: {
      //       stroke: "#2C83C4",
      //       lineWidth: 1,
      //       lineDash: [5, 5],
      //       fill: "transparent",
      //     },
      //   },
      // ],
      // 添加tooltip配置，实现悬停显示count
      tooltip: {
        trigger: "item",
        formatter: function (params: any) {
          return `${params.name}: ${params.value}条`;
        },
        backgroundColor: "rgba(0,0,0,0.7)",
        borderColor: "#2C83C4",
        textStyle: {
          color: "#fff",
        },
      },
      series: [
        {
          type: "graph",
          layout: "none",
          coordinateSystem: undefined,
          label: {
            show: true,
            color: "#fff",
            fontSize: 10,
            fontWeight: "bold",
          },
          // 鼠标悬停效果增强
          emphasis: {
            focus: "adjacency" as const,
            label: {
              fontSize: 12,
              fontWeight: "bold",
              color: "#30D8FF",
            },
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(48, 216, 255, 0.5)",
            },
          },
          symbolSize: (val) => {
            // 根据count动态设置大小，确保最小不低于30，最大不超过120
            if (!val) return 30; // 防止无数据情况

            // 使用对数比例，避免数值差异过大时节点大小差异也过大
            // 对数增长更合理：数量级的增长体现为大小的线性增长
            return Math.max(30, Math.min(120, 30 + 15 * Math.log10(val)));
          },
          data: (() => {
            const centerX = 400;
            const centerY = 300;
            const innerRadius = 180;
            const outerRadius = 260;

            // 如果没有数据，显示默认中心点
            if (!wordCloudData.length) {
              return [
                {
                  name: "暂无词云数据",
                  x: centerX,
                  y: centerY,
                  symbolSize: 110,
                  itemStyle: { color: "#30D8FF" },
                  label: { fontSize: 12 },
                  value: 0,
                },
              ];
            }

            // 中心点显示数量最多的分类
            const centerData =
              wordCloudData.length > 0
                ? wordCloudData.sort(
                    (
                      a: { category: string; count: number },
                      b: { category: string; count: number }
                    ) => b.count - a.count
                  )[0]
                : { category: "热点问题", count: 0 };

            const centerNode = {
              name: centerData.category,
              x: centerX,
              y: centerY,
              // 中心节点大小特殊处理，确保其始终是最大的
              symbolSize: centerData.count
                ? Math.max(100, 30 + 15 * Math.log10(centerData.count))
                : 80,
              itemStyle: { color: "#30D8FF" },
              label: {
                fontSize: 12,
                // 根据文本长度自动调整字体大小
                formatter: (params: any) => {
                  const name = params.name as string;
                  // 太长的文本进行截断显示
                  return name.length > 8 ? name.substring(0, 7) + "..." : name;
                },
              },
              value: centerData.count,
            };

            // 将剩余数据分配到内圈和外圈
            const remainingData = wordCloudData.slice(1);

            // 内圈数据（取前5条或更少）
            const innerCount = Math.min(5, Math.ceil(remainingData.length / 2));
            const innerData = remainingData.slice(0, innerCount);

            // 外圈数据（取剩余的，最多10条）
            const outerData = remainingData.slice(innerCount, innerCount + 10);

            // 生成内圈节点
            const innerNodes = innerData.map((item, i) => {
              const angle = (2 * Math.PI * i) / innerData.length;
              return {
                name: item.category,
                x: centerX + innerRadius * Math.cos(angle),
                y: centerY + innerRadius * Math.sin(angle),
                itemStyle: { color: "#0079C2" },
                value: item.count,
              };
            });

            // 生成外圈节点
            const outerNodes = outerData.map((item, i) => {
              const angle = (2 * Math.PI * i) / outerData.length;
              return {
                name: item.category,
                x: centerX + outerRadius * Math.cos(angle),
                y: centerY + outerRadius * Math.sin(angle),
                itemStyle: { color: "#3DA2FF" },
                value: item.count,
              };
            });

            return [centerNode, ...innerNodes, ...outerNodes];
          })(),
        },
      ],
    };
  }, [screenData.wordCloudData]);

  // 攻坚项目弹窗
  const [workOpen, setWorkOpen] = useState(false);
  const [workDetail, setWorkDetail] = useState<any>(null);
  const [workRecord, setWorkRecord] = useState<any>(null);
  const [wrokLoading, setWorkLoading] = useState(false);
  const [workAiComment, setWorkAiComment] = useState<string>("");
  const ctrlRef = useRef<AbortController | null>(null);

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
              {...level2TrendLineData}
              enableSlide={true}
              slideInterval={2000}
              visibleDataPoints={3}
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
                dataSource={screenData.keyFocusData || []}
                onRowClick={async (record) => {
                  setWorkOpen(true);
                  setWorkRecord(record);

                  try {
                    if (wrokLoading) return;
                    setWorkLoading(true);
                    const { data } = await apiGetWorkDetail({
                      category: record?.category as string,
                      community: record?.community as string,
                    });

                    setWorkDetail(data.data);
                    if (ctrlRef.current) {
                      ctrlRef.current.abort();
                      ctrlRef.current = null;
                    }
                    const ctr = new AbortController();
                    ctrlRef.current = ctr;

                    const content = data?.data
                      ?.map((item: { content: string }) => item.content)
                      .join("");

                    fetchEventSource(
                      `${import.meta.env.VITE_BASE_API_URL}/process-data`,
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
              dataSource={twoCateGoryDataSource}
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
      categoryKey,
      focusKey,
      level2TrendLineData,
      pieOption,
      screenData.keyFocusData,
      screenData.oneData,
      screenData.twoData,
      trendKey,
      twoCateGoryDataSource,
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
              enableSlide={false}
              slideInterval={3500}
              visibleDataPoints={3}
              data={screenData.heatmapData}
            />
            <LineChart
              {...govProfile2LineData}
              enableSlide={true}
              slideInterval={2000}
              visibleDataPoints={3}
              className={styles.manageChartItem}
            />
          </div>
        ),
      },
    ],
    [screenData.threeData, govProfile2LineData, screenData.heatmapData]
  );

  /**
   * 触发自定义登录状态变更事件
   * @param isLoggedIn 登录状态
   */
  const triggerAuthChangeEvent = (isLoggedIn: boolean) => {
    // 创建并触发自定义事件
    const authChangeEvent = new CustomEvent("authChange", {
      detail: { isLoggedIn } as AuthChangeEventDetail,
    });
    window.dispatchEvent(authChangeEvent);
  };

  /**
   * 处理用户登出操作
   */
  const handleLogout = () => {
    // 清除登录状态
    localStorage.removeItem("isLoggedIn");

    // 触发自定义登出事件
    triggerAuthChangeEvent(false);
  };

  return (
    <div className={styles.screen}>
      {/* 时间选择 */}
      <div className={styles.selectWrap}>
        <Select
          className={styles.select}
          style={{ width: 90 }}
          options={TimeRangeOption}
          onChange={(value) => {
            setTimeRange(value);
          }}
          value={timeRange}
          popupClassName="customSelectDropdown"
        />
        <Select
          className={styles.select}
          value={currentMapType}
          onChange={handleMapTypeChange}
          options={Object.values(MapTypeEnum).map((type) => ({
            label: MapTypeNames[type as MapTypeEnum],
            value: type,
          }))}
          popupClassName="customSelectDropdown"
        />
      </div>
      {/* 标题 */}

      <div className={styles.header}>
        <span
          className={styles.title}
          onClick={() => {
            clearInterval(timer.current!);
          }}
        >
          民情全息感知与数智治理平台
        </span>

        <Button type="link" className={styles.logoutBtn} onClick={handleLogout}>
          退出登录
        </Button>
      </div>

      {/* 内容 */}
      <div className={styles.contentWrap}>
        {/* 地图 - 传递地图类型和工单数据 */}
        <Map currentMapType={currentMapType} ticketData={ticketData}></Map>
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
                  dataSource={socialRiskDataSource}
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
      {/* 
      <Modal
        destroyOnClose
        open={workOpen}
        onOk={() => setWorkOpen(false)}
        loading={wrokLoading}
        onCancel={() => setWorkOpen(false)}
        width={"50%"}
        centered
        footer={null}
        className={styles.workModal}
        closeIcon={null}
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
          pagination={false}
          scroll={{ y: 300, x: 1000 }}
        />
      </Modal> */}
      <WorkModal
        open={workOpen}
        onOk={() => setWorkOpen(false)}
        loading={wrokLoading}
        onCancel={() => {
          setWorkOpen(false);
          setWorkAiComment("");
          setWorkDetail(null);
          if (ctrlRef.current) {
            ctrlRef.current.abort();
            ctrlRef.current = null;
          }
        }}
        workAiComment={workAiComment}
        workDetail={workDetail}
        textTitle={`${workRecord?.community}${workRecord?.category}事项`}
      />
    </div>
  );
};

export default Screen;
