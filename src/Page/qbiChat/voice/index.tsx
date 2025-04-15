import React, { useState, useRef, useEffect } from "react";
import "./index.less";
import { LoadingOutlined } from "@ant-design/icons";
import play from "./start.png";
import pause from "./pause.png";

/**
 * VoicePlayer组件属性定义
 */
interface VoicePlayerProps {
  /** 要播放的文本内容 */
  text: string;
  /** 自定义类名 */
  className?: string;
  /** 播放开始回调 */
  onPlayStart?: () => void;
  /** 播放结束回调 */
  onPlayEnd?: () => void;
  /** 错误处理回调 */
  onError?: (error: Error) => void;
  /** 播放状态变化回调 */
  onPlayStatusChange?: (isPlaying: boolean) => void;
}

/**
 * 语音播报组件
 * 提供文本转语音播放功能，支持播放、暂停操作
 */
const VoicePlayer: React.FC<VoicePlayerProps> = ({
  text,
  className = "",
  onPlayStart,
  onPlayEnd,
  onError,
  onPlayStatusChange,
}) => {
  // 状态管理
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // 是否正在播放
  const [isLoading, setIsLoading] = useState<boolean>(false); // 是否正在加载
  const [audioUrl, setAudioUrl] = useState<string>(""); // 音频URL
  const [audioError, setAudioError] = useState<boolean>(false); // 音频加载是否出错
  const [audioFinished, setAudioFinished] = useState<boolean>(false); // 音频是否播放完成

  // 引用
  const audioRef = useRef<HTMLAudioElement | null>(null); // 音频元素引用

  // 当文本变化时，重置状态
  useEffect(() => {
    setIsPlaying(false);
    setAudioUrl("");
    setAudioError(false);
    setAudioFinished(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // 通知播放状态变化
    if (onPlayStatusChange) {
      onPlayStatusChange(false);
    }
  }, [text, onPlayStatusChange]);

  // 处理音频播放结束
  const handleAudioEnded = () => {
    console.log("音频播放完成");
    setIsPlaying(false);
    setAudioFinished(true);

    // 延迟调用播放结束回调，确保数字人视频能完整播放完最后一个动作
    setTimeout(() => {
      // 通知播放状态变化
      if (onPlayStatusChange) {
        onPlayStatusChange(false);
      }
      if (onPlayEnd) {
        onPlayEnd();
      }
    }, 500); // 增加500ms延迟，让视频动作完成
  };

  // 处理音频错误
  const handleAudioError = (e: Event) => {
    console.error("音频播放错误:", e);
    setIsPlaying(false);
    setIsLoading(false);
    setAudioError(true);
    setAudioFinished(true);

    // 通知播放状态变化
    if (onPlayStatusChange) {
      onPlayStatusChange(false);
    }
    if (onError) {
      onError(new Error("音频播放错误"));
    }
  };

  // 处理音频加载事件
  const handleAudioCanPlay = () => {
    // 音频已加载并可以播放
    if (audioRef.current && !isPlaying && !audioError) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setAudioFinished(false);

          // 通知播放状态变化
          if (onPlayStatusChange) {
            onPlayStatusChange(true);
          }

          if (onPlayStart) {
            onPlayStart();
          }
        })
        .catch((err) => {
          console.error("播放时出错:", err);
          setIsPlaying(false);
          setIsLoading(false);
          setAudioError(true);
          setAudioFinished(true);

          // 通知播放状态变化
          if (onPlayStatusChange) {
            onPlayStatusChange(false);
          }

          if (onError) {
            onError(err instanceof Error ? err : new Error(String(err)));
          }
        });
    }
  };

  // 处理音频播放进度
  const handleTimeUpdate = () => {
    if (audioRef.current && onPlayStatusChange && isPlaying) {
      // 每次时间更新时确保播放状态为true
      // 这样可以防止数字人视频在音频播放过程中意外停止
      onPlayStatusChange(true);
    }
  };

  // 调用TTS API获取音频
  const fetchAudio = async () => {
    if (!text || text.trim() === "") {
      if (onError) {
        onError(new Error("无有效文本内容"));
      }
      return;
    }

    setIsLoading(true);
    setAudioError(false);
    setAudioFinished(false);

    try {
      // 先通知外部开始加载
      if (onPlayStatusChange) {
        onPlayStatusChange(true);
      }

      const response = await fetch("https://qbi-dev.ifqb.com/v1/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      // 获取音频blob
      const audioBlob = await response.blob();

      // 验证blob是否为有效的音频文件
      if (audioBlob.size === 0) {
        throw new Error("接收到空的音频数据");
      }

      // 创建音频URL
      const url = URL.createObjectURL(audioBlob);

      // 设置音频URL（加载音频）
      setAudioUrl(url);

      // 音频加载和播放将通过事件监听器处理
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = url;
        // play() 将在 canplay 事件中调用
      }
    } catch (error) {
      console.error("获取音频失败:", error);
      setIsPlaying(false);
      setIsLoading(false);
      setAudioError(true);
      setAudioFinished(true);

      // 通知播放状态变化
      if (onPlayStatusChange) {
        onPlayStatusChange(false);
      }

      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  };

  // 播放/暂停切换
  const togglePlay = () => {
    if (isLoading) return;

    if (isPlaying && audioRef.current) {
      // 暂停播放
      audioRef.current.pause();
      setIsPlaying(false);
      // 通知播放状态变化
      if (onPlayStatusChange) {
        onPlayStatusChange(false);
      }
      // 如果已经播放完成，重置状态
      if (audioFinished) {
        setAudioFinished(false);
      }
    } else if (audioUrl && audioRef.current && !audioError) {
      // 继续播放已加载的音频
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioFinished(false);

          // 通知播放状态变化
          if (onPlayStatusChange) {
            onPlayStatusChange(true);
          }

          if (onPlayStart) {
            onPlayStart();
          }
        })
        .catch((err) => {
          console.error("播放时出错:", err);
          setIsPlaying(false);
          setAudioError(true);
          setAudioFinished(true);

          // 通知播放状态变化
          if (onPlayStatusChange) {
            onPlayStatusChange(false);
          }

          if (onError) {
            onError(err instanceof Error ? err : new Error(String(err)));
          }
        });
    } else {
      // 开始新的播放 (获取并加载新音频)
      fetchAudio();
    }
  };

  // 设置音频事件监听器
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("canplay", handleAudioCanPlay);
      audio.addEventListener("error", handleAudioError);
      audio.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (audio) {
        audio.removeEventListener("canplay", handleAudioCanPlay);
        audio.removeEventListener("error", handleAudioError);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [audioRef.current, isPlaying]); // 添加isPlaying作为依赖

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className={`voice-player ${className}`}>
      {/* 播放控制按钮 */}
      <div className="voice-control-button" onClick={togglePlay}>
        <div className="voice-control-button-content">
          {isLoading ? (
            <LoadingOutlined style={{ marginRight: "5px" }} />
          ) : isPlaying ? (
            <img src={pause} alt="pause" />
          ) : (
            <img src={play} alt="play" />
          )}
          <span>语音播报</span>
        </div>
      </div>

      {/* 音频元素 */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default VoicePlayer;
