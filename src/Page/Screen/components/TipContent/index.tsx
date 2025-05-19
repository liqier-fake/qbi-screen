import React from "react";
import styles from "./index.module.less";

import VoicePlayer from "../../../qbiChat/voice";

interface TipContentProps {
  content: string;
}

const TipContent: React.FC<TipContentProps> = ({ content }) => {
  return (
    <div className={styles.tipContent}>
      <div className={styles.content}>{content}</div>
      <VoicePlayer className={styles.voicePlayer} text={content} />
    </div>
  );
};

export default TipContent;
