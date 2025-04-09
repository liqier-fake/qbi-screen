import React, { memo, useEffect, useRef, useState } from "react";
import styles from "./index.module.less";

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
  scrollSpeed?: number; // 滚动速度(px/s)
  scrollHeight?: number; // 容器高度
}

const ComTable = <T extends TableRecord = TableRecord>({
  columns,
  dataSource,
  className,
  autoScroll = true,
  scrollSpeed = 50,
}: ComTableProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLTableSectionElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  // 创建双倍数据以实现无缝滚动
  const doubleData = [...dataSource, ...dataSource];

  useEffect(() => {
    if (!autoScroll || !containerRef.current || !contentRef.current) return;

    // 动画帧id
    let animationFrameId: number;
    // 上一次时间戳，计算滚动距离
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
      // 滚动距离
      const pixelsToScroll = (scrollSpeed * deltaTime) / 1000;

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

    return () => {
      // 取消动画帧
      cancelAnimationFrame(animationFrameId);
    };
  }, [autoScroll, isPaused, scrollSpeed]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);

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
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    textAlign: column.align || "left",
                  }}
                >
                  {column.render
                    ? column.render(record[column.dataIndex], record)
                    : record[column.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default memo(ComTable);
