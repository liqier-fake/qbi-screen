import { useRef, useEffect, useState } from "react";
import styles from "./index.module.less";
import digitalman from "./digitalman.png";
import useFullscreen from "../../util/useFullScreen";

// @ts-expect-error 导入外部Chat组件
import { Chat } from "../../../qbiChat/code-web";

/**
 * AI聊天组件
 * 包含数字人图像和聊天功能
 * 点击数字人可全屏显示聊天窗口
 */
const AIChat = () => {
  // 聊天容器的引用
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Chat组件的DOM引用，用于调试和样式调整
  const chatComponentRef = useRef<HTMLDivElement>(null);

  // 全屏状态监听
  const { isFullscreen, toggleFullscreen } = useFullscreen(
    chatContainerRef as React.RefObject<HTMLElement>
  );

  // 组件挂载状态
  const [mounted, setMounted] = useState(false);

  // 处理点击数字人事件
  const handleDigitalmanClick = () => {
    toggleFullscreen();
  };

  // 检查和应用Chat组件样式
  useEffect(() => {
    setMounted(true);

    // 将样式应用到Chat组件
    const applyStyles = () => {
      if (!chatComponentRef.current) return;

      const chatRoot = chatComponentRef.current.querySelector(
        '[class*="chat-root"], [class*="chat-container"]'
      );
      if (chatRoot) {
        chatRoot.classList.add("chat-container");
      }

      // 查找消息列表容器
      const messagesContainer = chatComponentRef.current.querySelector(
        '[class*="messages-list"], [class*="chat-messages"], [class*="conversation"]'
      );
      if (messagesContainer) {
        messagesContainer.classList.add("message-container");
      }

      // 查找输入区域
      const inputArea = chatComponentRef.current.querySelector(
        '[class*="input-area"], [class*="composer"], [class*="chat-input"]'
      );
      if (inputArea) {
        inputArea.classList.add("input-container");
      }
    };

    // 初次渲染后应用样式
    const initialStyleTimer = setTimeout(applyStyles, 500);

    // 创建MutationObserver以监听DOM变化
    const observer = new MutationObserver(applyStyles);

    // 在组件挂载后开始观察
    if (chatComponentRef.current) {
      observer.observe(chatComponentRef.current, {
        childList: true,
        subtree: true,
      });
    }

    // 清理函数
    return () => {
      clearTimeout(initialStyleTimer);
      observer.disconnect();
    };
  }, [mounted, isFullscreen]);

  return (
    <div className={styles.AIChat}>
      <div className={styles.AIChatIframe} ref={chatContainerRef}>
        {/* 添加ref以获取Chat组件的DOM元素 */}
        <div ref={chatComponentRef} className={styles.chatWrapper}>
          <Chat
            apiUrl={import.meta.env.VITE_BASE_URL}
            apiKey={import.meta.env.VITE_CHAT_TOKEN}
          />
        </div>

        {/* 全屏时显示的退出按钮 */}
        {isFullscreen && (
          <div className={styles.exitFullscreenBtn} onClick={toggleFullscreen}>
            退出全屏
          </div>
        )}
      </div>

      {/* 数字人图像容器，全屏模式下不显示 */}
      {!isFullscreen && (
        <div className={styles.imgContainer}>
          <img
            src={digitalman}
            alt="数字人"
            className={styles.img}
            onClick={handleDigitalmanClick}
            title="点击进入全屏聊天"
          />
          <div className={styles.promptText}>点击进入全屏聊天</div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
