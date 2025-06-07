import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.less";
import classNames from "classnames";
import AIChat from "./components/AIChat";
import { CardOne, CardTwo, CardThree } from "./components/ComCustom";
import { ScreenDataType } from "./mock";
import { Flex, Button, Select, message } from "antd";
import {
  apiGetStaticBasic,
  apiGetTicketCount,
  BaseType,
  TimeRange,
} from "./api.ts";

import { AuthChangeEventDetail } from "../../types/events";
import Map, {
  MapTypeEnum,
  MapTypeNames,
  TicketCountData,
  // streetNameToEnum,
} from "./components/Chart/Map/Map.tsx";

import { MapSelectTypeEnum } from "./components/Chart/Map/type.ts";
import { GroupTypeEnum } from "./components/Chart/Map/type.ts";

// 定义AIChat组件的ref类型
interface AIChatRef {
  openChatWithQuestion: (question: string) => void;
}

// 引入Panel组件
import {
  Level2TrendPanel,
  KeyFocusPanel,
  GovernanceChallengePanel,
  SocialChallengePanel,
  PeopleFocusPanel,
  WordCloudPanel,
  GovernanceProfilePanel,
} from "./components/Panel";
import PanelItem from "./components/PanelItem/index.tsx";

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
  const [, contextHolder] = message.useMessage();
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.this_year);

  const [screenData, setScreenData] = useState<ScreenDataType>({} as any);

  const timer = useRef<NodeJS.Timeout | null>(null);

  // 添加地图类型状态
  const [currentMapType, setCurrentMapType] = useState<MapTypeEnum>(
    MapTypeEnum.area
  );

  const [currentMapSelectType, setCurrentMapSelectType] =
    useState<MapSelectTypeEnum>(MapSelectTypeEnum.number);

  // 新增：群体类型状态
  const [currentGroupType, setCurrentGroupType] = useState<GroupTypeEnum>(
    GroupTypeEnum.rideHailing
  );

  // 新增：驿站显示状态
  const [showStation, setShowStation] = useState<boolean>(false);

  // 添加工单数据状态
  const [ticketData, setTicketData] = useState<TicketCountData[][]>([]);

  const [bubuleContent, setBubuleContent] = useState<string>("");

  // 传递选中的默认街道
  const defaultStreet = useMemo(() => {
    if (currentMapType === MapTypeEnum.area) {
      return;
    }
    return MapTypeNames[currentMapType];
  }, [currentMapType]);

  // 添加AIChat组件的ref
  const aiChatRef = useRef<AIChatRef | null>(null);

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
        ?.reduce((acc: number, item: { count: number; source: string }) => {
          if (item.source == "知社区") {
            return acc;
          }
          return acc + item.count;
        }, 0)
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

  // 区域工单数量统计 - 根据地图类型获取对应工单数据
  const getTicketCountData = async () => {
    try {
      const streets = Object.values(MapTypeNames);
      streets.splice(0, 1, "");

      const result = await Promise.allSettled(
        streets?.map((street) =>
          apiGetTicketCount({
            time_range: timeRange,
            street,
          })
        )
      );

      const ticketData = result.map((item) => {
        if (item.status === "fulfilled") {
          const {
            data: { data: ticketData },
          } = item.value;
          return ticketData;
        }
        return [];
      });

      // 更新工单数据状态
      setTicketData(ticketData);
    } catch (error) {
      console.error("获取工单数据失败:", error);
      setTicketData([]);
    }
  };

  // 地图类型变化处理
  const handleMapTypeChange = (value: MapTypeEnum) => {
    setCurrentMapType(value);
  };

  // 修改：地图选择类型和群体类型变化处理
  const handleCardThreeIconClick = (
    value: MapSelectTypeEnum | GroupTypeEnum,
    type: "mapType" | "group"
  ) => {
    if (type === "mapType") {
      setCurrentMapSelectType(value as MapSelectTypeEnum);
    } else if (type === "group") {
      setCurrentGroupType(value as GroupTypeEnum);
    }
  };

  useEffect(() => {
    // 数据来源
    getSourceCountData();
    // 民有所呼 我有所为
    getLevel1CountData();
    // 人群画像
    getPeopleTicketCountData();
    // 攻坚重点
    // getKeyFocusData();
    // 社区攻坚项目
    // getSocialChallengeData();
    // 关注人群重点诉求
    // getSocialRiskData(timeRange, "");
    // 词云数据
    // getKeyWordsData();
    // 二级趋势预测
    // 治理画像-热力图
    // getGovProfile1Data();
    // // 治理画像-折线图
    // getGovProfile2Data();
    // 区域工单数量统计 - 初始化时获取一次数据
    getTicketCountData();
  }, [timeRange]);

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

  const onHoverCardTwo = (content: string) => {
    console.log("Screen收到hover内容:", content);
    // 添加时间戳确保每次hover都是新的值
    const newContent = `${content}_${Date.now()}`;
    console.log("Screen设置气泡内容:", newContent);
    setBubuleContent(newContent);
  };

  // 处理地图组件发起的提问
  const handleAskQuestion = (question: string) => {
    console.log("从地图发起提问:", question);
    // 调用AIChat组件的方法打开对话框并设置问题
    aiChatRef.current?.openChatWithQuestion(question);
  };

  return (
    <div className={styles.screen}>
      {contextHolder}
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
          style={{ width: 120 }}
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
          苏州工业园区"智汇民意"民情分析平台
        </span>

        <Button type="link" className={styles.logoutBtn} onClick={handleLogout}>
          退出登录
        </Button>
      </div>

      {/* 内容 */}
      <div className={styles.contentWrap}>
        {/* 地图 - 传递地图类型和工单数据 */}
        <Map
          currentMapSelectType={currentMapSelectType}
          currentGroupType={currentGroupType}
          currentMapType={currentMapType}
          ticketData={ticketData}
          showStation={showStation} // 独立控制驿站显示
          onDrillDown={(nextMapType) => {
            setCurrentMapType(nextMapType);
            // 获取新地图类型的工单数据
            getTicketCountData();
          }}
          onAskQuestion={handleAskQuestion} // 添加问题回调
        />
        {/* 左侧 */}
        <div className={styles.left}>
          <div className={styles.leftItem}>
            <PanelItem
              title="数据来源"
              render={
                <CardOne
                  list={screenData?.oneData?.list || []}
                  total={screenData?.oneData?.total || ""}
                />
              }
            />
          </div>
          <div className={styles.leftItem}>
            <PanelItem
              title="民有所呼 我有所为"
              render={
                <CardTwo
                  list={screenData?.twoData?.list || []}
                  timeRange={timeRange}
                  onHoverItem={onHoverCardTwo}
                />
              }
            />
          </div>
          <div className={styles.leftItem}>
            <Level2TrendPanel
              timeRange={timeRange}
              defautValue={defaultStreet}
            />
          </div>
          <div className={styles.leftItem}>
            <KeyFocusPanel timeRange={timeRange} defautValue={defaultStreet} />
          </div>
          <div className={styles.leftItem}>
            <GovernanceChallengePanel
              timeRange={timeRange}
              defautValue={defaultStreet}
            />
          </div>
          <div className={styles.leftItem}>
            <SocialChallengePanel timeRange={timeRange} />
          </div>
        </div>
        {/* 中间 */}
        <div className={styles.center}>
          <div className={styles.centerItem}>
            <AIChat
              bubuleContent={bubuleContent}
              onRef={(ref) => (aiChatRef.current = ref)} // 设置ref
            />
          </div>
        </div>
        {/* 右侧 */}
        <div className={styles.right}>
          <div className={classNames(styles.rightItem, styles.one)}>
            <PanelItem
              title="人群画像"
              render={
                <Flex
                  justify="center"
                  align="center"
                  className={styles.peopleDraw}
                >
                  <CardThree
                    list={screenData?.threeData?.list || []}
                    onHoverItem={onHoverCardTwo}
                    onIconClick={handleCardThreeIconClick}
                    currentSelectType={currentMapSelectType}
                    currentGroupType={currentGroupType}
                    timeRange={timeRange}
                    // 新增：驿站显示状态控制
                    onStationToggle={setShowStation}
                    showStation={showStation}
                  />
                </Flex>
              }
            />
          </div>
          <div className={styles.rightItem}>
            <GovernanceProfilePanel timeRange={timeRange} />
          </div>
          <div
            className={classNames(styles.rightItem, styles.rightItemSpecial)}
          >
            <div className={styles.rightItemLeft}>
              <PeopleFocusPanel timeRange={timeRange} />
            </div>

            <div className={styles.rightItemRight}>
              <WordCloudPanel timeRange={timeRange}></WordCloudPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Screen;
