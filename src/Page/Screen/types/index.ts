/**
 * 工单记录类型定义
 */
export interface TicketRecord {
  challenge_score?: number;
  date?: string;
  c1?: string;
  c2?: string;
  c3?: string;
  category?: string;
  content?: string;
  address_detail?: string;
  smqt?: string;
  ds1?: string;
  impact_scope?: string;
  sentiment?: string;
  threaten?: string;
  word?: string; // 新增词云相关字段
  [key: string]: string | number | boolean | undefined; // 允许其他字段但限制类型
}

/**
 * 分类项目类型
 */
export interface CategoryItem {
  count: number;
  name: string;
}

/**
 * 子分类类型
 */
export interface SubCategory {
  name: string;
  total?: number;
  items: CategoryItem[];
}

/**
 * 分类类型
 */
export interface Category {
  name: string;
  subcategories: SubCategory[];
}
