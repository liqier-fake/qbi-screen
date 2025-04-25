import styles from "./index.module.less";
import digitalman from "./digitalman.png";
import { Flex, Modal } from "antd";
import { useState } from "react";
import { Chat } from "../../../qbiChat";

import close from "./close.png";
import icon from "./icon.png";

// import { Chat } from "../../../qbiChat/index.ts";
// import { Chat } from "../../../qbiChat";

/**
 * AI聊天组件
 * 提供一个可点击的数字人图标，并在点击后弹出聊天窗口
 */
const AIChat = () => {
  // 控制弹窗显示状态
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className={styles.AIChat}>
      <div className={styles.AIChatIframe}>
        {/* <Chat
          apiUrl={import.meta.env.VITE_BASE_URL}
          apiKey={import.meta.env.VITE_CHAT_TOKEN}
        /> */}
      </div>
      {!isModalOpen && (
        <Flex
          justify="flex-end"
          align="flex-start"
          className={styles.imgContainer}
          onClick={showModal}
        >
          <img src={icon} alt="icon" className={styles.img} />
          <img src={digitalman} alt="数字人助手" className={styles.img} />
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
