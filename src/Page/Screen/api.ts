import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BASE_API_URL;
axios.defaults.headers.common["Authorization"] =
  "Bearer " + import.meta.env.VITE_CHAT_TOKEN;

export interface ApiParams {
  time_range: TimeRange;
}

export enum TimeRange {
  last_7_days = "last_7_days",
  last_30_days = "last_30_days",
  this_week = "this_week",
  last_week = "last_week",
  this_month = "this_month",
  last_month = "last_month",
  this_year = "this_year",
  last_year = "last_year",
  all = "all",
}
export enum BaseType {
  // 人群画像
  people_ticket_count = "people_ticket_count",
  // 数据来源
  source_count = "source_count",
  // 民有所呼 我有所为
  level1_count = "level1_count",
}

//  攻坚重点-事件列表
export function apiGetWorkList() {
  return axios({
    url: "/stats/street-category",
    method: "GET",
  });
}

// 攻坚重点-工单详细信息
export function apiGetWorkDetail(params: {
  category: string;
  community: string;
}) {
  return axios({
    url: "/stats/work-orders",
    method: "GET",
    params,
  });
}
// 攻坚重点-工单详细信息

// 基本统计信息 - 人群画像/数据来源/民有所呼 我有所为
export function apiGetStaticBasic(
  params: ApiParams & {
    type: BaseType;
  }
) {
  return axios({
    url: "/stats/basic",
    method: "GET",
    params,
  });
}

// 二级趋势预测
export function apiGetLevel2Trend(
  params: ApiParams & {
    street: string;
    comparison_type: "tb" | "hb" | null;
  }
) {
  return axios({
    url: "/stats/level2",
    method: "GET",
    params,
  });
}
// 攻坚重点
export function apiGetKeyFocus(
  params: ApiParams & {
    street: string;
  }
) {
  return axios({
    url: "/stats/key_focus",
    method: "GET",
    params,
  });
}
// 二级分类-传street /关注人群重点诉求-传group
export function apiGetSocialRisk(
  params: ApiParams & {
    street?: string;
    group?: string;
  }
) {
  return axios({
    url: "/stats/social_risk",
    method: "GET",
    params,
  });
}

// 社区攻坚项目
export function apiGetSocialChallenge(
  params: ApiParams & { page: number; page_size: number }
) {
  return axios({
    url: "/community_improvement",
    method: "GET",
    params,
  });
}

// 社区攻坚项目详情
export function apiGetSocialChallengeDetail(params: { id: string }) {
  return axios({
    url: `/community_improvement/${params.id}`,
    method: "GET",
  });
}

// 治理画像-热力图
export function apiGetGovProfile1(params: ApiParams) {
  return axios({
    url: "/stats/gov_profile1",
    method: "GET",
    params,
  });
}
// 治理画像-折线图
export function apiGetGovProfile2(params: ApiParams) {
  return axios({
    url: "/stats/gov_profile2",
    method: "GET",
    params,
  });
}
// 词云
export function apiGetKeyWords(params: ApiParams) {
  return axios({
    url: "/stats/key_words",
    method: "GET",
    params,
  });
}
// 区域-工单数量统计
export function apiGetTicketCount(
  params: ApiParams & {
    street?: string;
    type?: string;
  }
) {
  return axios({
    url: "/stats/ticket_count",
    method: "GET",
    params,
  });
}
// 根据分类获取工单列表
export function apiGetTicketList(
  params: ApiParams & {
    category?: string;
    word?: string;
    c3?: string;
    smqt?: string;
    c1?: string;
    c2?: string;
    /** 页码 */
    page?: number;
    /** 每页条数 */
    page_size?: number;
    community?: string;
    year?: string;
  }
) {
  return axios({
    url: "/stats/ticket_list",
    method: "GET",
    params,
  });
}
// 获取社区攻坚项目top分类
export function apiGetTopCategory(params: {
  community: string;
  year?: string;
}) {
  return axios({
    url: "/community_improvement/top_category",
    method: "GET",
    params,
  });
}
