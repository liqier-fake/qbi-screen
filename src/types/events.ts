/**
 * 登录状态变更事件详情接口
 */
export interface AuthChangeEventDetail {
  /**
   * 是否已登录
   */
  isLoggedIn: boolean;
}

/**
 * 登录状态变更事件接口
 */
export interface AuthChangeEvent extends CustomEvent {
  /**
   * 事件详情
   */
  detail: AuthChangeEventDetail;
}
