import { memo, useEffect, useMemo, useState } from "react";
import styles from "./index.module.less";
import { ComCustomItemType } from "./types";
import CategoryModal from "../CategoryModal";
import { apiGetTicketCount, TimeRange } from "../../api";
import { useHoverSummary } from "./useHoverSummary";
import { getCategoryLevelOneDescription } from "./categoryDescriptions";
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";
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
  const [categories, setCategories] = useState<any[]>([]);

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
  const getItemContent = (item: ComCustomItemType): string => {
    return `${item.title}分类有${item.value}件`;
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
                value={Number(item.value)}
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
        categoryList={categoryList}
        open={open}
        onCancel={() => setOpen(false)}
        title={record?.title}
      />
    </div>
  );
};

export default memo(CardTwo);
