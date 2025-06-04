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

interface CardThreeProps {
  list: ComCustomItemType[];
  onHoverItem?: (content: string) => void;
  onIconClick?: () => void;
  currentSelectType?: MapSelectTypeEnum; // 添加当前选择类型参数
  timeRange: TimeRange; // 添加时间范围参数，使用TimeRange类型
}

/**
 * 卡片三组件
 * @param list 列表数据
 * @param onHoverItem hover回调
 * @param onIconClick 图标点击回调
 * @param timeRange 时间范围
 */
const CardThree = ({
  list = [],
  onHoverItem,
  onIconClick,
  currentSelectType,
  timeRange,
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

  const mapOptions = useMemo(() => {
    return Object.values(MapSelectTypeEnum).map((item) => ({
      label: item,
      value: item,
    }));
  }, []);

  return (
    <div className={styles.comCustom}>
      <div className={styles.cardThree}>
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
              {/* {showIcon && (
                <EnvironmentOutlined
                  className={styles.clickableIcon}
                  style={{
                    fontSize: 20,
                    color:
                      currentSelectType === MapSelectTypeEnum.number
                        ? "grey"
                        : "#0cb4f0",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onIconClick?.();
                  }}
                />
              )} */}

              {showIcon && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onMouseEnter={(e) => e.stopPropagation()}
                  onMouseLeave={(e) => e.stopPropagation()}
                  className={styles.clickableIcon}
                >
                  <Select
                    defaultValue={currentSelectType}
                    options={mapOptions}
                    onChange={onIconClick}
                    style={{ width: 120 }}
                  />
                </div>
              )}

              <img src={threeIcon} alt="" />
              <Flex justify="center" align="center">
                <span className={styles.title}>
                  <Odometer
                    value={
                      Array.isArray(animatedValues) ? animatedValues[i] || 0 : 0
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
      </WorkListModal>
    </div>
  );
};

export default memo(CardThree);
