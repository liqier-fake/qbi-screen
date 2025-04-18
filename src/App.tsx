import "./App.less";
import Screen from "./Page/Screen";
import { ConfigProvider } from "antd";

function App() {
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
      <div className="app">
        <Screen />
      </div>
    </ConfigProvider>
  );
}

export default App;
