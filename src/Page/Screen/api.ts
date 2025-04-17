import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BASE_API_URL;
axios.defaults.headers.common["Authorization"] =
  "Bearer " + import.meta.env.VITE_CHAT_TOKEN;

//  攻坚重点-事件列表
export function apiGetWorkList() {
  return axios({
    url: "/v1/stats/street-category",
    method: "GET",
  });
}

// 攻坚重点-工单详细信息
export function apiGetWorkDetail(params: { category: string; street: string }) {
  return axios({
    url: "/v1/stats/work-orders",
    method: "GET",
    params,
  });
}
