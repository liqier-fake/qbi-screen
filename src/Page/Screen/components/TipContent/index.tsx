import React from "react";
import styles from "./index.module.less";

import VoicePlayer from "../../../qbiChat/voice";
import ComContent from "../ComContent";

interface TipContentProps {
  content: string;
}

const TipContent: React.FC<TipContentProps> = ({ content }) => {
  return (
    <div className={styles.tipContent}>
      <div className={styles.content}>
        <ComContent content={content} markdown ghost maxHeight={130} />
      </div>
      <VoicePlayer className={styles.voicePlayer} text={content} />
    </div>
  );
};

export default TipContent;
