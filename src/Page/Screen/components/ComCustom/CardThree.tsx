import { memo, useEffect, useState, useCallback, useMemo } from "react";
import styles from "./index.module.less";
import threeIcon from "./img/three_icon.png";
import { Flex, Select, Tag } from "antd";
import { ComCustomItemType } from "./types";
import { useHoverSummary } from "./useHoverSummary";
import { getPeopleGroupDescription } from "./categoryDescriptions";
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";
import { useNumberAnimation } from "./useNumberAnimation";
import {
  EnvironmentOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";

// 导入地图选择类型枚举
import { MapSelectTypeEnum } from "../Chart/Map/Map";
import {
  apiGetTicketList,
  TimeRange,
  apiGetStaticBasic,
  BaseType,
} from "../../api";
import WorkListModal from "../WorkMoal";
import columns from "../CategoryModal/columns";
import DividerTitle from "../DividerTitle";
import { compact } from "lodash";
import { GroupTypeEnum } from "../Chart/Map/type";

interface CardThreeProps {
  list: ComCustomItemType[];
  onHoverItem?: (content: string) => void;
  onIconClick?: () => void;
  currentSelectType?: MapSelectTypeEnum; // 添加当前选择类型参数
  timeRange: TimeRange; // 添加时间范围参数，使用TimeRange类型
  // 新增：驿站显示控制回调
  onStationToggle?: (showStation: boolean) => void;
  // 新增：当前驿站显示状态
  showStation?: boolean;
}

/**
 * 卡片三组件
 * @param list 列表数据
 * @param onHoverItem hover回调
 * @param onIconClick 图标点击回调
 * @param currentSelectType 当前选择类型
 * @param timeRange 时间范围
 * @param onStationToggle 驿站显示状态控制回调
 * @param showStation 当前驿站显示状态
 */
const CardThree = ({
  list = [],
  onHoverItem,
  onIconClick,
  currentSelectType,
  timeRange,
  onStationToggle,
  showStation = false,
}: CardThreeProps) => {
  // 存储实际值（不变）
  const [realValues, setRealValues] = useState<number[]>([]);
  // 工单列表弹窗状态
  const [workListOpen, setWorkListOpen] = useState(false);
  // 当前选中的人群类型
  const [selectedSmqt, setSelectedSmqt] = useState("");

  const [total, setTotal] = useState(0);

  const [smqtList, setSmqtList] = useState<
    {
      key: string;
      count: number;
    }[]
  >([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // 计算单个卡片宽度（包含间距）
  const itemWidth = 100 / 5; // 每个卡片占容器宽度的 1/5
  const slideWidth = itemWidth; // 每次滑动一个卡片的宽度

  // 计算最大可滚动次数
  const maxScrolls = Math.max(0, list.length - 5); // 5是一屏显示的数量

  // 处理上一个
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return 0;
      return prev - 1;
    });
  }, []);

  // 处理下一个
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= maxScrolls) return maxScrolls;
      return prev + 1;
    });
  }, [maxScrolls]);

  // 初始化实际数据
  useEffect(() => {
    // 计算实际值
    const actualValues = list.map((item) => Number(item.value) || 0);
    // 保存实际值
    setRealValues(actualValues);
  }, [list]);

  // 使用自定义Hook处理数字动效
  const animatedValues = useNumberAnimation(realValues);

  // 定义获取项目内容的函数
  const getItemContent = (): string => {
    return list.map((l) => `${l.title}:${l.value}`)?.toString();
  };

  // 使用自定义Hook处理hover事件
  const { onMouseEnter, onMouseLeave } = useHoverSummary(
    onHoverItem,
    getItemContent,
    getPeopleGroupDescription
  );

  // 处理点击事件，打开工单列表
  const handleItemClick = (item: ComCustomItemType) => {
    setSelectedSmqt(item.title);
    setWorkListOpen(true);

    if (item.title === "新就业群体") {
      apiGetStaticBasic({
        type: BaseType.new_employment_group_count,
        time_range: timeRange,
      }).then((res) => {
        setSmqtList(res.data?.data || []);
      });
    }
  };

  // 使用useCallback缓存关闭弹窗函数
  const handleCloseWorkList = useCallback(() => {
    setWorkListOpen(false);
    setSelectedSmqt("");
  }, []);

  // 构建请求参数
  const modalParams = {
    smqt: selectedSmqt,
    time_range: timeRange,
  };

  const showSmqtList = useMemo(() => {
    return selectedSmqt === "新就业群体" && smqtList.length > 0;
  }, [selectedSmqt, smqtList]);

  // 修改：从select选项中移除驿站选项和新就业群体数量选项
  const mapOptions = useMemo(() => {
    const group = Object.values(GroupTypeEnum).map((item) => {
      return {
        label: item,
        value: item,
      };
    });

    return [
      ...group,
      {
        label: MapSelectTypeEnum.image,
        value: MapSelectTypeEnum.image,
      },
      {
        label: MapSelectTypeEnum.newGroupCount,
        value: MapSelectTypeEnum.newGroupCount,
      },
    ];
  }, []);

  // 新增：处理驿站图标点击
  const handleStationIconClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // 切换驿站显示状态
      onStationToggle?.(!showStation);
    },
    [showStation, onStationToggle]
  );

  return (
    <div className={styles.comCustom}>
      <div className={styles.cardThree}>
        <div
          className={`${styles.switchButton} ${styles.prevButton}`}
          onClick={handlePrev}
        >
          <LeftOutlined />
        </div>

        <div
          className={`${styles.switchButton} ${styles.nextButton}`}
          onClick={handleNext}
        >
          <RightOutlined />
        </div>

        <div className={styles.listWrapper}>
          <div
            className={styles.listContainer}
            style={{
              transform: `translateX(-${currentIndex * slideWidth}%)`,
            }}
          >
            {list.map((item, i) => {
              const showIcon = item.title === "新就业群体";

              return (
                <div
                  className={styles.listItem}
                  key={i}
                  onMouseEnter={(e) => {
                    return;
                    // 检查事件源是否来自选择框区域
                    const target = e.target as HTMLElement;
                    if (!target.closest(`.${styles.clickableIcon}`)) {
                      onMouseEnter(item);
                    }
                  }}
                  onMouseLeave={(e) => {
                    return;
                    // 检查事件源是否来自选择框区域
                    const target = e.target as HTMLElement;
                    if (!target.closest(`.${styles.clickableIcon}`)) {
                      onMouseLeave();
                    }
                  }}
                  style={{ position: "relative", cursor: "pointer" }}
                  onClick={(e) => {
                    // 检查事件源是否来自选择框区域
                    const target = e.target as HTMLElement;
                    if (!target.closest(`.${styles.clickableIcon}`)) {
                      handleItemClick(item);
                    }
                  }}
                >
                  {showIcon && (
                    <EnvironmentOutlined
                      className={styles.clickableIcon}
                      style={{
                        fontSize: 20,
                        // 修改：根据驿站显示状态改变颜色，增加更明显的视觉反馈
                        color: showStation ? "#0cb4f0" : "#666",
                        // 增加过渡效果
                        transition: "color 0.3s ease",
                      }}
                      onClick={handleStationIconClick}
                    />
                  )}

                  {showIcon && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseEnter={(e) => e.stopPropagation()}
                      onMouseLeave={(e) => e.stopPropagation()}
                      className={styles.clickableSelect}
                    >
                      <Select
                        defaultValue={currentSelectType}
                        options={compact(mapOptions) || []}
                        onChange={onIconClick}
                        style={{ width: 100 }}
                      />
                    </div>
                  )}

                  <img src={threeIcon} alt="" />
                  <Flex justify="center" align="center">
                    <span className={styles.title}>
                      <Odometer
                        value={
                          Array.isArray(animatedValues)
                            ? animatedValues[i] || 0
                            : 0
                        }
                        format="(d)"
                        duration={1000}
                      />
                    </span>
                    <span className={styles.value}>人</span>
                  </Flex>
                  <span className={styles.value}>{item.title}</span>
                </div>
              );
            })}
          </div>

          <WorkListModal
            title={selectedSmqt}
            open={workListOpen}
            onCancel={handleCloseWorkList}
            columns={columns}
            showAiSummary={false}
            fetchDataApi={apiGetTicketList}
            fetchParams={modalParams}
            pagination={{
              defaultCurrent: 1,
              defaultPageSize: 10,
            }}
            onDataLoaded={(data) => {
              setTotal(data?.total || 0);
            }}
            tableProps={{
              scroll: { y: 300 },
            }}
          >
            {showSmqtList && (
              <div>
                <DividerTitle title="构成群体" />
                {smqtList?.map((item) => (
                  <Tag color="blue" key={item.key}>
                    {item.key} : {item.count} 人
                  </Tag>
                ))}
              </div>
            )}
            <DividerTitle title="工单数量" />
            <Tag color="blue">
              {selectedSmqt} : {total}
            </Tag>
            <DividerTitle title="工单详情" />
          </WorkListModal>
        </div>
      </div>
    </div>
  );
};

export default memo(CardThree);
