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

// 全局音频缓存，用于存储已请求过的文本对应的音频URL
const audioCache: Record<string, string> = {};

/**
 * 语音播报组件
 * 提供文本转语音播放功能，支持播放、暂停操作，自动缓存已请求的音频
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

  // 引用
  const audioRef = useRef<HTMLAudioElement | null>(null); // 音频元素引用

  /**
   * 处理音频播放结束
   */
  const handleAudioEnded = () => {
    console.log("音频播放完成");
    setIsPlaying(false);

    // 通知播放状态变化
    if (onPlayStatusChange) {
      onPlayStatusChange(false);
    }

    // 延迟调用播放结束回调，确保数字人视频能完整播放完最后一个动作
    if (onPlayEnd) {
      setTimeout(() => {
        onPlayEnd();
      }, 500); // 增加500ms延迟，让视频动作完成
    }
  };

  /**
   * 处理音频错误
   */
  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error("音频播放错误:", e);
    setIsPlaying(false);
    setIsLoading(false);

    // 通知播放状态变化
    if (onPlayStatusChange) {
      onPlayStatusChange(false);
    }

    if (onError) {
      onError(new Error("音频播放错误"));
    }
  };

  /**
   * 尝试播放音频
   */
  const playAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);

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

        // 通知播放状态变化
        if (onPlayStatusChange) {
          onPlayStatusChange(false);
        }

        if (onError) {
          onError(err instanceof Error ? err : new Error(String(err)));
        }
      });
  };

  /**
   * 调用TTS API获取音频
   */
  const fetchAudio = async () => {
    // 检查文本是否有效
    if (!text || text.trim() === "") {
      if (onError) {
        onError(new Error("无有效文本内容"));
      }
      return;
    }

    // 检查缓存中是否已存在该文本对应的音频
    if (audioCache[text]) {
      setAudioUrl(audioCache[text]);
      if (audioRef.current) {
        audioRef.current.src = audioCache[text];
        playAudio();
      }
      return;
    }

    setIsLoading(true);

    // 先通知外部开始加载
    // if (onPlayStatusChange) {
    //   onPlayStatusChange(true);
    // }

    try {
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

      // 缓存音频URL
      audioCache[text] = url;

      // 设置音频URL并加载
      setAudioUrl(url);

      if (audioRef.current) {
        audioRef.current.src = url;
        playAudio();
      }
    } catch (error) {
      console.error("获取音频失败:", error);
      setIsPlaying(false);
      setIsLoading(false);

      // 通知播放状态变化
      if (onPlayStatusChange) {
        onPlayStatusChange(false);
      }

      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  };

  /**
   * 播放/暂停切换
   */
  const togglePlay = () => {
    // 加载中不允许操作
    if (isLoading) return;

    if (isPlaying && audioRef.current) {
      // 暂停播放
      audioRef.current.pause();
      setIsPlaying(false);

      // 通知播放状态变化
      if (onPlayStatusChange) {
        onPlayStatusChange(false);
      }
    } else if (audioUrl && audioRef.current) {
      // 继续播放已加载的音频
      playAudio();
    } else {
      // 开始新的播放 (获取并加载新音频)
      fetchAudio();
    }
  };

  // 当文本变化时，重置播放状态但保留URL（如果缓存中有）
  useEffect(() => {
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // 从缓存中获取URL（如果有）
    if (audioCache[text]) {
      setAudioUrl(audioCache[text]);
      if (audioRef.current) {
        audioRef.current.src = audioCache[text];
      }
    } else {
      setAudioUrl("");
    }

    // 通知播放状态变化
    if (onPlayStatusChange) {
      onPlayStatusChange(false);
    }
  }, [text]);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      // 注意：不清除全局缓存，只释放组件实例相关资源
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

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
        onError={handleAudioError}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default VoicePlayer;
