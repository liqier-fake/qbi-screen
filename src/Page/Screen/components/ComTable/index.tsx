import React, { memo, useEffect, useRef, useState } from "react";
import styles from "./index.module.less";
import { Tooltip } from "antd";

// 定义表格数据类型
export interface TableRecord {
  [key: string]: string | number | React.ReactNode;
}

// 定义列的接口
export interface Column<T extends TableRecord = TableRecord> {
  title: string; // 列标题
  dataIndex: keyof T; // 数据索引
  render?: (text: T[keyof T], record: T) => React.ReactNode; // 自定义渲染函数
  width?: number; // 列宽
  align?: "left" | "center" | "right"; // 对齐方式
}

// 定义表格组件的Props
export interface ComTableProps<T extends TableRecord = TableRecord> {
  columns: Column<T>[]; // 列配置
  dataSource: T[]; // 数据源
  className?: string; // 自定义类名
  autoScroll?: boolean; // 是否开启自动滚动
  scrollSpeed?: number; // 滚动间隔(ms)，表示每行滚动的时间间隔
  scrollHeight?: number; // 容器高度
  scrollByRow?: boolean; // 是否按行滚动
  scrollDuration?: number; // 滚动动画持续时间(ms)
  onRowClick?: (record: T, index: number) => void; // 行点击事件回调函数
  rowClassName?: string | ((record: T, index: number) => string); // 自定义行类名
}

const ComTable = <T extends TableRecord = TableRecord>({
  columns,
  dataSource,
  className,
  autoScroll = true,
  scrollSpeed = 3000, // 默认3秒滚动一行，增加间隔时间
  scrollByRow = true, // 默认按行滚动
  scrollDuration = 1200, // 默认滚动动画持续1.2秒
  onRowClick, // 行点击事件回调
  rowClassName, // 自定义行类名
}: ComTableProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLTableSectionElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false); // 新增状态，标记是否正在滚动

  // 创建双倍数据以实现无缝滚动
  const doubleData = [...dataSource, ...dataSource];

  // 处理行点击事件
  const handleRowClick = (record: T, rowIndex: number) => {
    // 计算实际的数据索引，处理双倍数据的情况
    const actualIndex = rowIndex % dataSource.length;

    // 如果提供了点击回调，则调用它
    if (onRowClick) {
      onRowClick(record, actualIndex);
    }
  };

  // 获取行的类名
  const getRowClassName = (record: T, index: number) => {
    let customClassName = "";

    // 处理自定义行类名
    if (rowClassName) {
      if (typeof rowClassName === "function") {
        customClassName = rowClassName(record, index % dataSource.length);
      } else {
        customClassName = rowClassName;
      }
    }

    return `${styles.tableRow} ${customClassName}`;
  };

  useEffect(() => {
    if (!autoScroll || !containerRef.current || !contentRef.current) return;

    let timerId: NodeJS.Timeout | null = null;
    let animationFrameId: number | null = null;

    // 按行滚动
    if (scrollByRow) {
      const scrollToNextRow = () => {
        if (isPaused || isScrolling) return; // 如果正在滚动或暂停，则不执行下一次滚动

        setIsScrolling(true); // 标记开始滚动

        // 计算下一行索引
        const nextRowIndex = (currentRowIndex + 1) % dataSource.length;
        setCurrentRowIndex(nextRowIndex);

        // 获取行元素
        const rowElements = contentRef.current?.querySelectorAll("tr");
        if (rowElements && rowElements.length > 0) {
          // 计算下一行的位置
          const rowToScrollTo = rowElements[nextRowIndex];
          if (rowToScrollTo) {
            // 设置滚动位置，使用自定义CSS动画实现更平滑的滚动
            const customScrollBehavior = () => {
              const startTime = performance.now();
              const startScrollTop = containerRef.current!.scrollTop;
              const targetScrollTop = rowToScrollTo.offsetTop;
              const scrollDistance = targetScrollTop - startScrollTop;

              // 使用 easeInOutQuad 缓动函数使滚动更平滑
              const easeInOutQuad = (t: number): number => {
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
              };

              const animateScroll = (currentTime: number) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / scrollDuration, 1);
                const easedProgress = easeInOutQuad(progress);

                containerRef.current!.scrollTop =
                  startScrollTop + scrollDistance * easedProgress;

                if (progress < 1) {
                  requestAnimationFrame(animateScroll);
                } else {
                  // 滚动完成
                  setTimeout(() => {
                    setIsScrolling(false); // 标记滚动结束
                  }, 100); // 小延迟确保滚动完全结束

                  // 当滚动到最后一行时，无缝切换到第一组数据
                  if (nextRowIndex === dataSource.length - 1) {
                    // 延迟重置，等待滚动动画完成
                    setTimeout(() => {
                      containerRef.current?.scrollTo({
                        top: 0,
                        behavior: "auto",
                      });
                    }, 200);
                  }
                }
              };

              requestAnimationFrame(animateScroll);
            };

            customScrollBehavior();
          }
        }
      };

      // 开始定时滚动
      timerId = setInterval(scrollToNextRow, scrollSpeed);
    } else {
      // 平滑滚动逻辑，降低滚动速度
      let lastTimestamp: number;

      const scroll = (timestamp: number) => {
        if (!containerRef.current || !contentRef.current || isPaused) {
          lastTimestamp = timestamp;
          animationFrameId = requestAnimationFrame(scroll);
          return;
        }

        if (!lastTimestamp) {
          lastTimestamp = timestamp;
        }

        // 间隔时间
        const deltaTime = timestamp - lastTimestamp;
        // 滚动距离，降低滚动速度系数 (从1/2000改为1/5000)
        const pixelsToScroll = (1 * deltaTime) / 5000;

        // 设置滚动距离
        setScrollTop((prevScrollTop) => {
          const content = contentRef.current!;
          const maxScroll = content.scrollHeight / 2; // 只需要滚动一半的高度

          let newScrollTop = prevScrollTop + pixelsToScroll;

          // 当滚动到第一组数据的底部时，重置到顶部
          if (newScrollTop >= maxScroll) {
            newScrollTop = 0;
          }

          return newScrollTop;
        });

        lastTimestamp = timestamp;
        animationFrameId = requestAnimationFrame(scroll);
      };

      // 开始滚动
      animationFrameId = requestAnimationFrame(scroll);
    }

    return () => {
      // 清理定时器和动画帧
      if (timerId) clearInterval(timerId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [
    autoScroll,
    isPaused,
    scrollSpeed,
    currentRowIndex,
    dataSource.length,
    scrollByRow,
    isScrolling,
    scrollDuration,
  ]);

  // 同步滚动位置到容器 (用于平滑滚动模式)
  useEffect(() => {
    if (!scrollByRow && containerRef.current) {
      containerRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop, scrollByRow]);

  return (
    <div
      className={`${styles.tableWrapper} ${className || ""}`}
      ref={containerRef}
    >
      <table className={styles.table}>
        {/* 表头 */}
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                style={{
                  width: column.width,
                  textAlign: column.align || "left",
                }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        {/* 表格内容 - 使用双倍数据 */}
        <tbody
          ref={contentRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {doubleData.map((record, rowIndex) => (
            <tr
              key={rowIndex}
              className={getRowClassName(record, rowIndex)}
              onClick={() => handleRowClick(record, rowIndex)}
              style={{ cursor: onRowClick ? "pointer" : "default" }}
            >
              {columns.map((column, colIndex) => {
                const cellContent = column.render
                  ? column.render(record[column.dataIndex], record)
                  : record[column.dataIndex];
                
                return (
                  <Tooltip
                    key={`${rowIndex}-${colIndex}`}
                    title={typeof cellContent === 'string' || typeof cellContent === 'number' ? cellContent : ''}
                    placement="topLeft"
                  >
                    <td
                      style={{
                        textAlign: column.align || "left",
                      }}
                    >
                      {cellContent}
                    </td>
                  </Tooltip>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default memo(ComTable);
