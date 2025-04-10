import styles from "./index.module.less";
import digitalman from "./digitalman.png";

// @ts-expect-error Chat组件可能来自外部库，类型定义不完整
import { Chat } from "../../../qbiChat/code-web";
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
      <img src={digitalman} alt="" className={styles.img} onClick={showModal} />
      <Modal
        width={"50%"}
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
          />
        </div>
      </Modal>
    </div>
  );
};

export default AIChat;
