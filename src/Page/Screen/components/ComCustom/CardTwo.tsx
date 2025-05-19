import { memo, useEffect, useMemo, useState } from "react";
import styles from "./index.module.less";
import { ComCustomItemType } from "./types";
import CategoryModal from "../CategoryModal";
import { apiGetTicketCount, TimeRange } from "../../api";

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

  const categoryList = useMemo(() => {
    return (
      categories.find((item) => item?.name === record?.title)?.subcategories ||
      []
    );
  }, [categories, record]);
  const showModal = (item: ComCustomItemType) => {
    setOpen(true);
    setRecord(item);
  };

  const onMouseEnter = (item: ComCustomItemType) => {
    onHoverItem?.(`${item.title}分类有${item.value}件`);
  };

  const onMouseLeave = () => {
    // onHoverItem?.("");
  };

  return (
    <div className={styles.comCustom}>
      <div className={styles.cardTwo}>
        {list.map((item, i) => (
          <div
            className={styles.showItemContent}
            key={i}
            onClick={() => showModal(item)}
            onMouseEnter={() => onMouseEnter(item)}
            onMouseLeave={() => onMouseLeave()}
          >
            <span className={styles.showItemTitle}>{item.value}</span>
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
