import React from "react";
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
}

const ComTable = <T extends TableRecord = TableRecord>({
  columns,
  dataSource,
  className,
}: ComTableProps<T>) => {
  return (
    <div className={`${styles.tableWrapper} ${className || ""}`}>
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
        {/* 表格内容 */}
        <tbody>
          {dataSource.map((record, rowIndex) => (
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

export default ComTable;
