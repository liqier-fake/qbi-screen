/**
 * 自定义组件类型接口
 */
export interface ComData {
  type: "cardOne" | "cardTwo" | "cardThree";
  data: ComCustomType;
}

/**
 * 自定义组件数据类型接口
 */
export interface ComCustomType {
  list: ComCustomItemType[];
  total?: string;
}

/**
 * 自定义组件项目类型接口
 */
export interface ComCustomItemType {
  value: string | number;
  title: string;
  icon?: React.ReactNode;
}
