import styles from "./index.module.less";
import digitalman from "./digitalman.png";
import { Flex, Modal } from "antd";
import { useEffect, useState, useRef } from "react";
import { Chat } from "../../../qbiChat";

import close from "./close.png";
import icon from "./icon.png";
import TipContent from "../TipContent";

// import { Chat } from "../../../qbiChat/index.ts";
// import { Chat } from "../../../qbiChat";

/**
 * AI聊天组件
 * 提供一个可点击的数字人图标，并在点击后弹出聊天窗口
 */
const AIChat = ({ bubuleContent }: { bubuleContent: string }) => {
  // 控制弹窗显示状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTipContent, setShowTipContent] = useState(false);
  // 创建对tipContent的引用
  const tipContentRef = useRef<HTMLDivElement>(null);

  // 当bubuleContent变化时显示气泡
  useEffect(() => {
    if (bubuleContent) {
      setShowTipContent(true);
    }
  }, [bubuleContent]);

  // 添加点击事件监听器，当点击除tipContent外的区域时隐藏提示
  useEffect(() => {
    // 点击事件处理函数
    const handleClickOutside = (event: MouseEvent) => {
      // 检查点击的元素是否在tipContent之外
      if (
        tipContentRef.current &&
        !tipContentRef.current.contains(event.target as Node)
      ) {
        setShowTipContent(false);
      }
    };

    // 添加全局点击事件监听
    document.addEventListener("mousedown", handleClickOutside);

    // 组件卸载时移除事件监听
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * 显示聊天弹窗
   */
  const showModal = () => {
    setIsModalOpen(true);
  };

  /**
   * 关闭聊天弹窗
   */
  const handleOk = () => {
    setIsModalOpen(false);
  };

  // 移除时间戳，只显示实际内容
  const displayContent = bubuleContent.split("_")[0];

  return (
    <div className={styles.AIChat}>
      <div className={styles.AIChatIframe}>
        {/* <Chat
          apiUrl={import.meta.env.VITE_BASE_URL}
          apiKey={import.meta.env.VITE_CHAT_TOKEN}
        /> */}
      </div>

      {showTipContent && bubuleContent && (
        <div
          className={styles.tipContent}
          ref={tipContentRef}
          key={bubuleContent}
        >
          <TipContent content={displayContent} />
        </div>
      )}

      {!isModalOpen && (
        <Flex
          justify="flex-end"
          align="flex-start"
          className={styles.imgContainer}
          onClick={showModal}
        >
          {!showTipContent && (
            <img src={icon} alt="icon" className={styles.imgIcon} />
          )}
          <img
            src={digitalman}
            alt="数字人助手"
            className={styles.imgDigital}
          />
        </Flex>
      )}
      <Modal
        className={styles.aiChatModal}
        width={"60%"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        maskClosable={false}
        closable={false}
        destroyOnClose={true}
        centered={true}
        transitionName=""
      >
        <div className={styles.chatModalContent}>
          <Chat
            apiUrl={import.meta.env.VITE_BASE_URL}
            apiKey={import.meta.env.VITE_CHAT_TOKEN}
            tips={[
              "请帮我分析一下胜浦街道，民生诉求最高的几类事项",
              "请帮我从新市民劳动者群体中，筛选10条含极端扬言的工单",
              '按月统计"违规占用消防通道"，工单量数据的变化情况',
            ]}
          />
          <div
            className={styles.closeIcon}
            onClick={() => setIsModalOpen(false)}
          >
            <img src={close} alt="关闭" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AIChat;
