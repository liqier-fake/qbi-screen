import { memo, useEffect, useMemo, useState } from "react";
import styles from "./index.module.less";
import { ComCustomItemType } from "./types";
import CategoryModal from "../CategoryModal";
import { apiGetTicketCount, TimeRange } from "../../api";
import { useHoverSummary } from "./useHoverSummary";
import { getCategoryLevelOneDescription } from "./categoryDescriptions";
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";
import { useNumberAnimation } from "./useNumberAnimation";

// 确保与CategoryModal组件中使用的Category类型定义一致
// 如果无法导入，可以使用与源组件一致的类型定义
interface CategoryBase {
  name: string;
  count: number;
}

// 避免多次定义Category类型造成冲突
type CategoryType = CategoryBase;

interface CardTwoProps {
  list: ComCustomItemType[];
  timeRange: TimeRange;
  onHoverItem?: (content: string) => void;
}

/**
 * 卡片二组件
 * @param list 列表数据
 */
const CardTwo = ({ list = [], timeRange, onHoverItem }: CardTwoProps) => {
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState<ComCustomItemType | null>(null);
  const [categories, setCategories] = useState<
    { name: string; subcategories: CategoryType[] }[]
  >([]);
  // 存储实际值（不变）
  const [realValues, setRealValues] = useState<number[]>([]);

  // 获取分类数据
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await apiGetTicketCount({
        time_range: timeRange,
        street: "",
        type: "category",
      });
      const categories = data?.data?.categories || [];
      setCategories(categories);
    };
    fetchData();
  }, [timeRange]);

  // 初始化实际数据
  useEffect(() => {
    // 计算实际值
    const actualValues = list.map((item) => Number(item.value) || 0);
    // 保存实际值
    setRealValues(actualValues);
  }, [list]);

  // 使用自定义Hook处理数字动效
  const animatedValues = useNumberAnimation(realValues);

  // 根据当前选中记录获取对应的子分类列表
  const categoryList = useMemo(() => {
    return (
      categories.find((item) => item?.name === record?.title)?.subcategories ||
      []
    );
  }, [categories, record]);

  // 显示模态框
  const showModal = (item: ComCustomItemType) => {
    setOpen(true);
    setRecord(item);
  };

  // 定义获取项目内容的函数
  const getItemContent = (): string => {
    return list.map((l) => `${l.title}:${l.value}`)?.toString();
  };
  // 使用自定义Hook处理hover事件
  const { onMouseEnter, onMouseLeave } = useHoverSummary(
    onHoverItem,
    getItemContent,
    getCategoryLevelOneDescription
  );

  return (
    <div className={styles.comCustom}>
      <div className={styles.cardTwo}>
        {list.map((item, i) => (
          <div
            className={styles.showItemContent}
            key={i}
            onClick={() => showModal(item)}
            onMouseEnter={() => onMouseEnter(item)}
            onMouseLeave={onMouseLeave}
          >
            <span className={styles.showItemTitle}>
              <Odometer
                value={
                  Array.isArray(animatedValues) ? animatedValues[i] || 0 : 0
                }
                format="(d)"
                duration={1000}
              />
            </span>
            <span className={styles.showItemValue}>{item.title}</span>
          </div>
        ))}
      </div>
      <CategoryModal
        timeRange={timeRange}
        categoryList={categoryList as any} // 使用类型断言解决类型冲突问题
        open={open}
        onCancel={() => setOpen(false)}
        title={record?.title}
      />
    </div>
  );
};

export default memo(CardTwo);
