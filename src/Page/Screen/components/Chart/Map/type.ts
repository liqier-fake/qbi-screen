// 导出枚举以便父组件使用
export enum MapTypeEnum {
  area = "area", // 园区
  jjhstreet = "jjhstreet", // 金鸡湖街道
  wtstreet = "wtstreet", // 唯亭街道
  lfstreet = "lfstreet", // 娄葑街道
  spstreet = "spstreet", // 胜浦街道
  xtstreet = "xtstreet", // 斜塘街道
}

export enum MapSelectTypeEnum {
  "dayDistribution" = "日间休息点分布",
  "nightDistribution" = "夜间休息点分布",
  "workDistribution" = "工作点分布",
  "liveDistribution" = "居住点分布",
  "newGroupCount" = "新就业群体数量",
  "image" = "画像",
  "site" = "驿站",
  "number" = "工单数量",
}
// 群体类型
export enum GroupTypeEnum {
  "rideHailing" = "网约车群体",
  "foodDelivery" = "外卖群体",
  "courier" = "快递群体",
  "designatedDriver" = "代驾群体",
}

// 导出常量，让父组件可以使用地图类型名称
export const MapTypeNames: Record<MapTypeEnum, string> = {
  [MapTypeEnum.area]: "苏州工业园区",
  [MapTypeEnum.jjhstreet]: "金鸡湖街道",
  [MapTypeEnum.wtstreet]: "唯亭街道",
  [MapTypeEnum.lfstreet]: "娄葑街道",
  [MapTypeEnum.spstreet]: "胜浦街道",
  [MapTypeEnum.xtstreet]: "斜塘街道",
};

// 街道名称到枚举的映射 - 导出给父组件使用
export const streetNameToEnum: Record<string, MapTypeEnum> = {
  金鸡湖街道: MapTypeEnum.jjhstreet,
  唯亭街道: MapTypeEnum.wtstreet,
  娄葑街道: MapTypeEnum.lfstreet,
  胜浦街道: MapTypeEnum.spstreet,
  斜塘街道: MapTypeEnum.xtstreet,
  苏州工业园区: MapTypeEnum.area,
};

// 定义地图层级路径
export interface MapBreadcrumb {
  type: MapTypeEnum;
  name: string;
}
export interface TicketCountData {
  name: string;
  count: number;
}

// 定义驿站信息接口
export interface StationInfo {
  name: string;
  position: [number, number];
  // 可以添加更多驿站相关信息字段
  address?: string;
  contact?: string;
  services?: string; // 修改为string类型，与实际数据匹配
  siteName?: string; // 添加siteName字段
  district?: string; // 添加区域字段
  id?: number;
  type?: string;
  remarks?: string;
  x?: number;
  y?: number;
}

// 定义聚合点接口
export interface ClusterInfo {
  position: [number, number];
  count: number;
  stations: StationInfo[];
}

// 定义画像数据类型
export interface ProfileData {
  data_type: string;
  group_type: string;
  percentage: number;
  profile_category: string;
  profile_subcategory: string;
  region_name: string;
}

// 定义ECharts参数类型
export interface EChartsParams {
  componentType: string;
  seriesType: string;
  seriesId?: string;
  seriesName?: string;
  name: string;
  dataIndex: number;
  data: {
    name: string;
    value: number | number[];
    stationInfo?: StationInfo;
    isCluster?: boolean;
    count?: number;
    stations?: StationInfo[];
    allData?: ProfileData[]; // 使用具体的类型替代any
  };
  value: number | number[];
  color: string;
  event?: {
    stop: () => void;
    event?: MouseEvent;
  };
}

// 定义地图配置类型
export interface MapViewConfig {
  center?: [number, number];
  zoom?: number;
  roam?: boolean;
}

// 定义地图图层类型
export interface MapGeoLayer {
  map: string;
  aspectScale: number;
  zoom: number;
  roam: boolean;
  layoutCenter: [string, string];
  layoutSize: string;
  silent?: boolean;
  center?: [number, number];
  [key: string]: unknown;
}

// 定义Map组件的props接口
export interface MapProps {
  currentMapType: MapTypeEnum; // 当前地图类型
  ticketData?: TicketCountData[][]; // 工单数据
  onDrillDown?: (nextMapType: MapTypeEnum) => void; // 添加下钻回调函数
  selectKey?: MapSelectTypeEnum;
  onAskQuestion?: (question: string) => void; // 添加提问回调函数
  currentMapSelectType: MapSelectTypeEnum; // 当前地图选择类型
  // 新增：独立的驿站显示控制
  showStation?: boolean; // 是否显示驿站图层
}
