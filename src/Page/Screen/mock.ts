import { random } from "lodash";

export const oneData = {
  total: "20700",
  list: [
    {
      title: "12345",
      value: "3520",
    },
    {
      title: "寒山闻钟",
      value: "4124",
    },
    {
      title: "阳光信访",
      value: "5890",
    },
    {
      title: "人民网留言板",
      value: "2785",
    },
    {
      title: "领导信箱",
      value: "3013",
    },
    {
      title: "公民监督",
      value: "1368",
    },
  ],
};

export const twoData = {
  list: [
    {
      title: "城市温度",
      value: "5200",
    },
    {
      title: "治理精度",
      value: "7300",
    },
    {
      title: "民生厚度",
      value: "4800",
    },
    {
      title: "工作效率",
      value: "3400",
    },
  ],
};

export const threeData = {
  list: [
    {
      title: "新市民劳动者",
      value: 625364,
    },
    {
      title: "新就业群体",
      value: 16573,
    },
    {
      title: "青年群体",
      value: 725877,
    },
    {
      title: "困难群体",
      value: 818,
    },
    {
      title: "重点人员",
      value: 3086,
    },
  ],
};

export const lineData = {
  xData: [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
    "一月",
    "二月",
    "三月",
    "四月",
  ],
  lineData: [
    {
      name: "退役军人优先",
      data: [
        120, 180, 150, 90, 70, 130, 120, 899, 750, 620, 430, 280, 190, 340, 450,
        530,
      ],
    },
    {
      name: "规划建设",
      data: [
        140, 190, 160, 45, 80, 150, 140, 190, 230, 310, 420, 390, 450, 320, 280,
        210,
      ],
    },
    {
      name: "交通管理",
      data: [
        130, 200, 140, 99, 90, 460, 130, 200, 310, 270, 330, 380, 420, 490, 380,
        290,
      ],
    },
    // {
    //   name: "道路设施",
    //   data: [
    //     150, 34, 130, 400, 100, 160, 150, 34, 95, 185, 265, 340, 390, 420, 370,
    //     290,
    //   ],
    // },
    // {
    //   name: "市容面貌",
    //   data: [
    //     110, 266, 170, 80, 110, 170, 110, 266, 310, 270, 220, 370, 420, 380,
    //     350, 310,
    //   ],
    // },
    // {
    //   name: "市容面貌",
    //   data: [
    //     110, 266, 170, 80, 110, 170, 110, 266, 320, 280, 330, 380, 410, 370,
    //     330, 290,
    //   ],
    // },
    // {
    //   name: "测试",
    //   data: [
    //     110, 266, 170, 80, 110, 170, 110, 266, 340, 290, 240, 290, 340, 390,
    //     430, 370,
    //   ],
    // },
    // {
    //   name: "车市",
    //   data: [
    //     110, 266, 170, 80, 110, 170, 110, 189, 250, 310, 370, 420, 380, 340,
    //     300, 270,
    //   ],
    // },
  ],
};

export const peopleOption = [
  { label: "新市民劳动者", value: "新市民劳动者" },
  { label: "新就业群体", value: "新就业群体" },
  { label: "青年群体", value: "青年群体" },
  { label: "困难群体", value: "困难群体" },
  { label: "重点人员", value: "重点人员" },
];

export const areaOption = [
  { label: "全部", value: "all" },
  { label: "娄葑街道", value: "娄葑街道" },
  { label: "斜塘街道", value: "斜塘街道" },
  { label: "唯亭街道", value: "唯亭街道" },
  { label: "胜浦街道", value: "胜浦街道" },
  { label: "金鸡湖街道", value: "金鸡湖街道" },
];

export const dataSource1 = [
  {
    key: "1",
    time: "2025.01.23",
    content: "偷倒乱倒建筑垃圾",
    category: "规划建设",
    count: 89,
  },
  {
    key: "2",
    time: "2025.02.12",
    content: "工地施工扰民",
    category: "安居保障",
    count: 78,
  },
  {
    key: "3",
    time: "2025.03.01",
    content: "离职后未发放的工资",
    category: "施工管理",
    count: 54,
  },
  {
    key: "4",
    time: "2025.03.02",
    content: "公路建设扰民",
    category: "道路设施",
    count: 45,
  },
  {
    key: "5",
    time: "2025.02.10",
    content: "离职后未发放的工资",
    category: "安居保障",
    count: 12,
  },
  {
    key: "6",
    time: "2025.01.15",
    content: "小区绿化被破坏",
    category: "规划建设",
    count: 33,
  },
  {
    key: "7",
    time: "2025.02.28",
    content: "夜间施工噪音",
    category: "安居保障",
    count: 67,
  },
  {
    key: "8",
    time: "2025.03.10",
    content: "拖欠农民工工资",
    category: "施工管理",
    count: 91,
  },
  {
    key: "9",
    time: "2025.01.30",
    content: "道路坑洼未修复",
    category: "道路设施",
    count: 24,
  },
  {
    key: "10",
    time: "2025.03.05",
    content: "违规搭建广告牌",
    category: "规划建设",
    count: 55,
  },
  {
    key: "11",
    time: "2025.02.20",
    content: "物业乱收费",
    category: "安居保障",
    count: 42,
  },
  {
    key: "12",
    time: "2025.03.15",
    content: "工地安全措施不足",
    category: "施工管理",
    count: 73,
  },
  {
    key: "13",
    time: "2025.01.10",
    content: "路灯长期不亮",
    category: "道路设施",
    count: 18,
  },
  {
    key: "14",
    time: "2025.02.05",
    content: "建筑垃圾堵塞道路",
    category: "规划建设",
    count: 60,
  },
  {
    key: "15",
    time: "2025.03.20",
    content: "租房押金不退",
    category: "安居保障",
    count: 29,
  },
];
export const dataSource2 = [
  {
    key: "1",
    word: "025.01.23",
    content: "偷倒乱倒建筑垃圾",
    reliefCategory: "治理精度/规划建设",
    count: 89,
  },
  {
    key: "2",
    word: "025.02.12",
    content: "工地施工扰民",
    reliefCategory: "治理精度/规划建设",
    count: 78,
  },
  {
    key: "3",
    word: "025.03.01",
    content: "离职后未发放的工资",
    reliefCategory: "城市温度/新市民劳动者服务与保障",
    count: 54,
  },
  {
    key: "4",
    word: "025.03.02",
    content: "公路建设扰民",
    reliefCategory: "治理精度/规划建设",
    count: 45,
  },
  {
    key: "5",
    word: "025.02.10",
    content: "离职后未发放的工资",
    reliefCategory: "城市温度/新市民劳动者服务与保障",
    count: 12,
  },
  {
    key: "6",
    word: "025.01.15",
    content: "小区绿化被破坏",
    reliefCategory: "治理精度/规划建设",
    count: 33,
  },
  {
    key: "7",
    word: "025.02.28",
    content: "夜间施工噪音",
    reliefCategory: "治理精度/规划建设",
    count: 67,
  },
  {
    key: "8",
    word: "025.03.10",
    content: "拖欠农民工工资",
    reliefCategory: "城市温度/新市民劳动者服务与保障",
    count: 91,
  },
  {
    key: "9",
    word: "025.01.30",
    content: "道路坑洼未修复",
    reliefCategory: "治理精度/规划建设",
    count: 24,
  },
  {
    key: "10",
    word: "025.03.05",
    content: "违规搭建广告牌",
    reliefCategory: "治理精度/规划建设",
    count: 55,
  },
  {
    key: "11",
    word: "025.02.20",
    content: "物业乱收费",
    reliefCategory: "治理精度/规划建设",
    count: 42,
  },
  {
    key: "12",
    word: "025.03.15",
    content: "工地安全措施不足",
    reliefCategory: "城市温度/新市民劳动者服务与保障",
    count: 73,
  },
  {
    key: "13",
    word: "025.01.10",
    content: "路灯长期不亮",
    reliefCategory: "治理精度/规划建设",
    count: 18,
  },
  {
    key: "14",
    word: "025.02.05",
    content: "建筑垃圾堵塞道路",
    reliefCategory: "治理精度/规划建设",
    count: 60,
  },
  {
    key: "15",
    word: "025.03.20",
    content: "租房押金不退",
    reliefCategory: "城市温度/新市民劳动者服务与保障",
    count: 29,
  },
];
export const dataSource3 = [
  {
    key: "1",
    community: "唯亭社区",
    keyMatter: "食物过期变质",
    count: 89,
  },
  {
    key: "2",
    community: "淞泽社区",
    keyMatter: "扰乱公共秩序",
    count: 78,
  },
  {
    key: "3",
    community: "东亭社区",
    keyMatter: "房屋质量",
    count: 54,
  },
  {
    key: "4",
    community: "古娄一村社区",
    keyMatter: "改变房屋性质",
    count: 45,
  },
  {
    key: "5",
    community: "古娄二村社区",
    keyMatter: "房屋安全",
    count: 12,
  },
  {
    key: "6",
    community: "湖滨社区",
    keyMatter: "电梯故障",
    count: 63,
  },
  {
    key: "7",
    community: "玲珑湾社区",
    keyMatter: "噪音污染",
    count: 37,
  },
  {
    key: "8",
    community: "翰林苑社区",
    keyMatter: "消防通道堵塞",
    count: 91,
  },
  {
    key: "9",
    community: "新盛社区",
    keyMatter: "违规养犬",
    count: 24,
  },
  {
    key: "10",
    community: "星湖社区",
    keyMatter: "垃圾未分类",
    count: 55,
  },
  {
    key: "11",
    community: "钟南社区",
    keyMatter: "停车位纠纷",
    count: 42,
  },
  {
    key: "12",
    community: "菁英公寓社区",
    keyMatter: "水电费争议",
    count: 18,
  },
  {
    key: "13",
    community: "海尚社区",
    keyMatter: "公共设施损坏",
    count: 76,
  },
  {
    key: "14",
    community: "美颂社区",
    keyMatter: "物业服务质量",
    count: 29,
  },
  {
    key: "15",
    community: "时代广场社区",
    keyMatter: "商铺占道经营",
    count: 50,
  },
];

export const dataSource4 = [
  {
    street: "娄葑街道",
    community: "金益社区",
    project: "解决小区健身设施老化问题",
    content: "小区健身器材使用多年，存在安全隐患，需更新换代。",
  },
  {
    street: "娄葑街道",
    community: "莲香社区",
    project: "整治小区宠物粪便问题",
    content: "居民反映宠物随地排泄现象严重，影响环境卫生。",
  },
  {
    street: "娄葑街道",
    community: "新城社区",
    project: "优化小区绿化布局",
    content: "现有绿化缺乏规划，部分区域植被过密影响采光。",
  },
  {
    street: "娄葑街道",
    community: "东港社区",
    project: "规范小区快递收发管理",
    content: "快递随意堆放，存在丢失风险，需设立统一收发点。",
  },
  {
    street: "娄葑街道",
    community: "香堤社区",
    project: "解决小区夜间照明不足问题",
    content: "部分区域路灯损坏，夜间出行存在安全隐患。",
  },
  {
    street: "娄葑街道",
    community: "湖滨社区",
    project: "整治小区乱晾晒现象",
    content: "居民在公共区域随意晾晒衣物，影响小区美观。",
  },
  {
    street: "娄葑街道",
    community: "星辰社区",
    project: "优化垃圾分类投放点布局",
    content: "现有投放点位置不合理，造成居民投放不便。",
  },
  {
    street: "娄葑街道",
    community: "春晓社区",
    project: "解决小区儿童活动场地不足问题",
    content: "现有儿童设施数量少，无法满足居民需求。",
  },
  {
    street: "娄葑街道",
    community: "夏莲社区",
    project: "整治小区商业广告乱张贴问题",
    content: "楼道、电梯内小广告泛滥，影响居住环境。",
  },
  {
    street: "娄葑街道",
    community: "秋韵社区",
    project: "优化小区停车管理系统",
    content: "外来车辆随意进入，占用业主停车资源。",
  },
  {
    street: "娄葑街道",
    community: "冬梅社区",
    project: "解决小区公共座椅不足问题",
    content: "老年人缺乏休息场所，需增加公共座椅。",
  },
  {
    street: "娄葑街道",
    community: "翠园社区",
    project: "整治小区噪音扰民问题",
    content: "早晚装修、广场舞等噪音影响居民休息。",
  },
  {
    street: "娄葑街道",
    community: "紫荆社区",
    project: "优化小区安防系统",
    content: "监控设备老化，存在安全盲区。",
  },
  {
    street: "娄葑街道",
    community: "百合社区",
    project: "解决小区公共卫生间卫生问题",
    content: "公共卫生间清洁不及时，影响使用体验。",
  },
  {
    street: "娄葑街道",
    community: "牡丹社区",
    project: "整治小区违规搭建问题",
    content: "部分居民私自搭建阳光房、围栏等设施。",
  },
  {
    street: "娄葑街道",
    community: "玫瑰社区",
    project: "优化小区水系景观维护",
    content: "人工湖水质变差，喷泉设备损坏。",
  },
  {
    street: "娄葑街道",
    community: "银杏社区",
    project: "解决小区无障碍设施不足问题",
    content: "残疾人、老年人出行存在障碍。",
  },
  {
    street: "娄葑街道",
    community: "梧桐社区",
    project: "整治小区商业网点油烟问题",
    content: "餐饮店铺油烟排放影响居民生活。",
  },
  {
    street: "娄葑街道",
    community: "松柏社区",
    project: "优化小区消防通道管理",
    content: "消防通道常被占用，存在安全隐患。",
  },
  {
    street: "娄葑街道",
    community: "竹园社区",
    project: "解决小区公共WiFi覆盖问题",
    content: "居民反映公共区域缺乏无线网络服务。",
  },
];

// 定义数据类型接口
export interface ListItem {
  title: string;
  value: string | number;
}

export interface DataItem {
  key: string;
  content?: string;
  count: number;
  [key: string]: any; // 其他可能的字段
}

export interface LineDataItem {
  name: string;
  data: number[];
}

export interface ScreenDataType {
  oneData: {
    total: string;
    list: ListItem[];
  };
  twoData: {
    list: ListItem[];
  };
  threeData: {
    list: ListItem[];
  };
  lineData: {
    xData: string[];
    lineData: LineDataItem[];
  };
  dataSource1: DataItem[];
  dataSource2: DataItem[];
  dataSource3: DataItem[];
  wordTableData?: any[];
  wordCloudData?: Array<{ category: string; count: number }>;
  keyFocusData?: any[];
  twoCateGoryDataSource?: any[];
  socialRiskDataSource?: any[];
  heatmapData?: Array<{
    categories: Array<{
      c3: string;
      count: number;
    }>;
    group: string;
    total: number;
  }>;
  govProfile2LineData?: {
    xData: string[];
    lineData: Array<{
      name: string;
      data: number[];
    }>;
  };
  level2TrendLineData?: {
    xData: string[];
    lineData: Array<{
      name: string;
      data: number[];
    }>;
  };
}

// 创建初始数据的工厂函数
export const createMockData = (): ScreenDataType => {
  return {
    oneData: {
      total: "10000",
      list: [
        { title: "12345", value: "1842" },
        { title: "寒山闻钟", value: "1203" },
        { title: "阳光信访", value: "1567" },
        { title: "人民网留言板", value: "932" },
        { title: "领导信箱", value: "2055" },
        { title: "公民监督", value: "2401" },
      ],
    },
    twoData: {
      list: [
        { title: "城市温度", value: "1200" },
        { title: "治理精度", value: "1406" },
        { title: "民生厚度", value: "2134" },
        { title: "工作效率", value: "1000" },
      ],
    },
    threeData: {
      list: [
        { title: "新市民劳动者", value: 2625 },
        { title: "新就业群体", value: 1605 },
        { title: "青年群体", value: 2725 },
        { title: "困难群体", value: 1211 },
        { title: "重点人员", value: 3086 },
      ],
    },
    lineData, // 使用已有的lineData
    dataSource1, // 使用已有的dataSource1
    dataSource2, // 使用已有的dataSource2
    dataSource3, // 使用已有的dataSource3
  };
};

// 数据更新函数
export const updateMockData = (prevData: ScreenDataType): ScreenDataType => {
  return {
    // 更新oneData
    oneData: {
      total: (Number(prevData.oneData.total) + 6).toString(),
      list: prevData.oneData.list.map((item) => ({
        ...item,
        value: (Number(item.value) + random(1, 5)).toString(),
      })),
    },

    // 更新twoData
    twoData: {
      list: prevData.twoData.list.map((item) => ({
        ...item,
        value: (Number(item.value) + random(1, 10)).toString(),
      })),
    },

    // 更新threeData
    threeData: {
      list: prevData.threeData.list.map((item) => ({
        ...item,
        value: Number(item.value) + random(1, 20),
      })),
    },

    // 更新lineData
    lineData: {
      xData: prevData.lineData.xData,
      lineData: prevData.lineData.lineData.map((item) => ({
        name: item.name,
        data: item.data.map(() => random(1, 1000)),
      })),
    },

    // 更新表格数据
    dataSource1: prevData.dataSource1.map((item) => ({
      ...item,
      count: item.count + random(1, 5),
    })),

    dataSource2: prevData.dataSource2.map((item) => ({
      ...item,
      count: item.count + random(1, 5),
    })),

    dataSource3: prevData.dataSource3.map((item) => ({
      ...item,
      count: item.count + random(1, 5),
    })),
  };
};
