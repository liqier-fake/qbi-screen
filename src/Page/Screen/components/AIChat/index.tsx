import styles from "./index.module.less";
import digitalman from "./digitalman.png";

const AIChat = () => {
  return (
    <div className={styles.AIChat}>
      <iframe
        src="https://qbi-dev.ifqb.com/"
        className={styles.AIChatIframe}
      ></iframe>
      <img src={digitalman} alt="" className={styles.img} />
    </div>
  );
};

export default AIChat;
