import { useEffect, useState } from "react";
import "./App.less";
import Screen from "./Page/Screen";
import Login from "./Page/Login";
import { ConfigProvider } from "antd";
import LoadingScreen from "./components/LoadingScreen";
import { AuthChangeEvent } from "./types/events";

/**
 * 应用主组件
 * 处理登录验证和路由控制
 */
function App() {
  // 登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 是否正在检查登录状态
  const [isChecking, setIsChecking] = useState(true);
  // 是否正在进行页面切换（登录或退出）
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  /**
   * 组件挂载时检查登录状态
   */
  useEffect(() => {
    // 从本地存储中检查登录状态
    const loginStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loginStatus);

    // 模拟网络延迟，确保加载组件有足够时间显示
    // setTimeout(() => {
    setIsChecking(false);
    // }, 800);

    // 监听存储变化，处理登录状态变更
    const handleStorageChange = () => {
      const newLoginStatus = localStorage.getItem("isLoggedIn") === "true";

      // 状态发生变化时，显示加载动画
      if (newLoginStatus !== isLoggedIn) {
        setIsPageTransitioning(true);

        // 延迟更新状态，给加载动画留出显示时间
        // setTimeout(() => {
        setIsLoggedIn(newLoginStatus);
        setIsPageTransitioning(false);
        // }, 800);
      }
    };

    // 添加存储事件监听器
    window.addEventListener("storage", handleStorageChange);

    // 清理函数
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isLoggedIn]);

  /**
   * 监听自定义事件，用于处理登录和登出状态
   */
  useEffect(() => {
    // 登录状态变化的处理函数
    const handleAuthChange = (event: AuthChangeEvent) => {
      setIsPageTransitioning(true);

      // 根据事件详情更新登录状态
      // setTimeout(() => {
      setIsLoggedIn(event.detail.isLoggedIn);
      setIsPageTransitioning(false);
      // }, 800);
    };

    // 添加自定义事件监听器
    window.addEventListener("authChange", handleAuthChange as EventListener);

    // 清理函数
    return () => {
      window.removeEventListener(
        "authChange",
        handleAuthChange as EventListener
      );
    };
  }, []);

  /**
   * 渲染内容
   * 如果正在检查登录状态或页面过渡，显示加载页面
   * 否则根据登录状态显示对应组件
   */
  const renderContent = () => {
    // 检查登录状态或页面过渡期间，显示加载组件
    if (isChecking || isPageTransitioning) {
      return (
        <LoadingScreen
          text={isChecking ? "系统初始化中..." : "页面加载中..."}
        />
      );
    }

    // 根据登录状态返回对应组件
    return isLoggedIn ? <Screen /> : <Login />;
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            // Link按钮样式定制
            colorLink: "#fff", // 链接按钮颜色
            colorLinkHover: "#fff", // 链接按钮悬停颜色
            colorLinkActive: "#fff", // 链接按钮激活颜色
            linkHoverBg: "transparent", // 链接按钮悬停背景透明
          },
        },
      }}
    >
      <div className="app">{renderContent()}</div>
    </ConfigProvider>
  );
}

export default App;
