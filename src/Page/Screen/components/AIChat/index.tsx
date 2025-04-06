import styles from "./index.module.less";
import digitalman from "./digitalman.png";

// @ts-ignore
import { Chat } from "../../../qbiChat/code-web";

const AIChat = () => {
  return (
    <div className={styles.AIChat}>
      <div className={styles.AIChatIframe}>
        <Chat
          apiUrl={import.meta.env.VITE_BASE_URL}
          apiKey={import.meta.env.VITE_CHAT_TOKEN}
        />
      </div>
      <img src={digitalman} alt="" className={styles.img} />
    </div>
  );
};

export default AIChat;
