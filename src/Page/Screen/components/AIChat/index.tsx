import styles from "./index.module.less";
import digitalman from "./digitalman.png";

// @ts-expect-error Chat组件可能来自外部库，类型定义不完整
import { Chat } from "../../../qbiChat/code-web.js";
import { Modal } from "antd";
import { useState } from "react";

const AIChat = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.AIChat}>
      <div className={styles.AIChatIframe}>
        <Chat
          apiUrl={import.meta.env.VITE_BASE_URL}
          apiKey={import.meta.env.VITE_CHAT_TOKEN}
        />
      </div>
      {!isModalOpen && (
        <img
          src={digitalman}
          alt=""
          className={styles.img}
          onClick={showModal}
        />
      )}
      <Modal
        width={"80%"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        maskClosable={true}
        closable={false}
      >
        <div className={styles.chatModalContent}>
          <Chat
            apiUrl={import.meta.env.VITE_BASE_URL}
            apiKey={import.meta.env.VITE_CHAT_TOKEN}
            tips={[
              "请帮我分析一下胜浦街道，民生诉求最高的几类事项",
              "请帮我从新市民劳动者群体中，筛选10条含极端扬言的工单",
              " 按月统计”违规占用消防通道“，工单量数据的变化情况",
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AIChat;
