/**
 * 按分类统计工单数量详情弹窗
 */
import { useMemo, useState, useEffect } from "react";
import ComModal, { ComModalProps } from "../ComModal";
import { WorkListModal } from "../WorkMoal";
import styles from "./index.module.less";
import classNames from "classnames";
import { Tooltip } from "antd";
import { apiGetTicketList, TimeRange } from "../../api";
import columns from "./columns";

interface CategoryItem {
  count: number;
  name: string;
}

interface SubCategory {
  name: string;
  total?: number;
  items: CategoryItem[];
}

interface Category {
  name: string;
  subcategories: SubCategory[];
}

export interface CategoryModalProps extends ComModalProps {
  categoryList: Category[];
  timeRange: TimeRange;
}

/**
 * 按分类统计工单数量详情弹窗
 */
const CategoryModal = ({
  categoryList = [],
  timeRange,
  ...rest
}: CategoryModalProps) => {
  // 当前选中的分类
  const [current, setCurrent] = useState<string>("");
  // 工单弹窗是否打开
  const [open, setOpen] = useState<boolean>(false);
  // 当前选中的分类名
  const [currentCategory, setCurrentCategory] = useState<string>("");

  // 初始化选中第一个分类
  useEffect(() => {
    if (categoryList && categoryList.length > 0 && categoryList[0]?.name) {
      setCurrent(categoryList[0].name);
    }
  }, [categoryList]);

  // 获取右侧子分类列表
  const rightList = useMemo(() => {
    if (!current) return [];
    return categoryList?.find((c) => c?.name === current)?.subcategories || [];
  }, [categoryList, current]);

  // 计算当前分类下所有子分类的总工单数
  const currentCategoryTotal = useMemo(() => {
    if (!current) return 0;

    const currentCategory = categoryList?.find((c) => c?.name === current);
    if (!currentCategory) return 0;

    // 计算当前分类下所有子分类的总和
    return (currentCategory.subcategories || []).reduce(
      (subTotal, subCategory) => {
        // 计算当前子分类下所有项目的总和
        const subCategorySum = (subCategory.items || []).reduce(
          (itemTotal, item) => {
            return itemTotal + (item.count || 0);
          },
          0
        );
        return subTotal + subCategorySum;
      },
      0
    );
  }, [categoryList, current]);

  // 渲染左侧主分类项
  const renderOne = (name: string) => {
    return (
      <div
        className={classNames(
          styles.one,
          current === name ? styles.oneActive : ""
        )}
        onClick={() => {
          setCurrent(name);
        }}
      >
        {name?.length > 12 ? (
          <Tooltip title={name}>
            <div className={styles.oneTitle}>{name}</div>
          </Tooltip>
        ) : (
          name
        )}
      </div>
    );
  };

  // 渲染右侧子分类项及其子项
  const renderTwo = (name: string, total: number, items: CategoryItem[]) => {
    return (
      <div className={styles.two}>
        <div
          className={styles.title}
          onClick={() => {
            showTicketModal(name, total);
          }}
        >
          <span className={styles.titleName}>{name}</span>
          <span className={styles.titleTotal}>{total}</span>
        </div>
        <div className={styles.content}>
          {items?.map((item, index) => {
            const { count, name } = item;
            return (
              <div
                className={styles.items}
                key={`${name}-${index}`}
                onClick={() => {
                  showTicketModal(name, count);
                }}
              >
                <span className={styles.itemName}>{name}：</span>
                <span className={styles.itemCount}>{count}</span>
                <span className={styles.itemUnit}>个</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * 显示工单详情弹窗
   * @param category 分类名称
   * @param total 工单总数
   */
  const showTicketModal = (category: string, total: number) => {
    if (!total) {
      return;
    }
    setOpen(true);
    setCurrentCategory(category);
  };

  /**
   * 关闭工单详情弹窗
   */
  const handleCloseTicketModal = () => {
    setOpen(false);
    setCurrentCategory("");
  };

  return (
    <ComModal {...rest}>
      <div className={styles.categoryModal}>
        <div className={styles.left}>
          {categoryList?.map((item) => {
            return renderOne(item.name);
          })}
        </div>
        <div className={styles.right}>
          <div className={styles.rightTitle}>
            <span className={styles.rightTitleName}>总数据</span>
            <span
              className={styles.rightTitleTotal}
              onClick={() => {
                showTicketModal(current, currentCategoryTotal);
              }}
            >
              {currentCategoryTotal}
            </span>
          </div>
          <div className={styles.rightList}>
            {rightList?.map((r: SubCategory) => {
              const total = r.items?.reduce((a, c) => {
                return a + c.count;
              }, 0);
              return renderTwo(r.name, total, r?.items);
            })}
          </div>
        </div>
      </div>

      <WorkListModal
        title="按分类统计工单数量详情"
        open={open}
        onCancel={handleCloseTicketModal}
        columns={columns}
        fetchDataApi={apiGetTicketList}
        fetchParams={{
          category: currentCategory,
          time_range: timeRange,
        }}
        pagination={{
          defaultCurrent: 1,
          defaultPageSize: 10,
        }}
      />
    </ComModal>
  );
};

export default CategoryModal;
