import React, { useState, useRef, useEffect } from "react";
import { Button } from "antd";
import "./index.less";

/**
 * 数字人视频组件的属性接口
 */
export interface DigitalHumanProps {
  /** 视频源文件 */
  videoSrc: string;
  /** 视频容器宽度 */
  width?: string | number;
  /** 视频容器高度 */
  height?: string | number;
  /** 是否显示播放控制按钮 */
  showControls?: boolean;
  /** 播放开始回调 */
  onPlayStart?: () => void;
  /** 播放结束回调 */
  onPlayEnd?: () => void;
  /** 播放错误回调 */
  onError?: (error: Error | Event) => void;
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 是否循环播放 */
  loop?: boolean;
  /** 是否静音 */
  muted?: boolean;
  /** 组件自定义类名 */
  className?: string;
}

/**
 * 数字人视频组件实例接口
 */
export interface DigitalHumanInstance {
  /** 播放视频 */
  playVideo: () => void;
  /** 暂停视频 */
  pauseVideo: () => void;
  /** 切换视频播放状态 */
  toggleVideoPlay: () => void;
}

/**
 * 数字人视频组件
 *
 * 用于展示数字人视频，提供播放控制功能
 */
const DigitalHuman = React.forwardRef<DigitalHumanInstance, DigitalHumanProps>(
  (
    {
      videoSrc,
      width = "300px",
      height = "500px",
      showControls = false,
      onPlayStart,
      onPlayEnd,
      onError,
      autoPlay = false,
      loop = true,
      muted = true,
      className = "",
    },
    ref
  ) => {
    // 视频引用
    const videoRef = useRef<HTMLVideoElement>(null);
    // 视频是否正在播放
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    // 处理视频加载完成
    const handleVideoLoaded = () => {
      console.log("数字人视频加载完成");

      // 如果需要自动播放，尝试播放视频
      if (autoPlay) {
        playVideo();
      }
    };

    // 处理视频播放开始
    const handleVideoPlayStart = () => {
      console.log("数字人视频开始播放");
      setIsPlaying(true);
      if (onPlayStart) {
        onPlayStart();
      }
    };

    // 处理视频播放结束
    const handleVideoPlayEnd = () => {
      console.log("数字人视频播放结束");
      setIsPlaying(false);
      if (onPlayEnd) {
        onPlayEnd();
      }
    };

    // 处理视频错误
    const handleVideoError = (
      error: React.SyntheticEvent<HTMLVideoElement, Event>
    ) => {
      console.error("数字人视频错误:", error);
      setIsPlaying(false);
      if (onError) {
        // 传递原始错误对象
        onError(error.nativeEvent || new Error("视频播放错误"));
      }
    };

    // 播放视频
    const playVideo = () => {
      if (videoRef.current && !isPlaying) {
        // 不每次都重置播放位置，保持连贯性
        // 只有当视频已经结束或者刚初始化时才重置
        if (videoRef.current.ended || videoRef.current.currentTime === 0) {
          videoRef.current.currentTime = 0;
        }

        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error("视频播放失败:", err);
            if (onError) {
              onError(err instanceof Error ? err : new Error(String(err)));
            }
          });
      }
    };

    // 暂停视频
    const pauseVideo = () => {
      if (videoRef.current && isPlaying) {
        // 延迟暂停视频，给一个完成当前动作的缓冲时间
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }, 200);
      }
    };

    // 切换视频播放状态
    const toggleVideoPlay = () => {
      if (isPlaying) {
        pauseVideo();
      } else {
        playVideo();
      }
    };

    // 暴露组件方法
    React.useImperativeHandle(ref, () => ({
      playVideo,
      pauseVideo,
      toggleVideoPlay,
    }));

    // 组件卸载时暂停视频
    useEffect(() => {
      return () => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      };
    }, []);

    return (
      <div className={`digital-human ${className}`} style={{ width, height }}>
        <video
          ref={videoRef}
          id="broadcasterVideo"
          loop={loop}
          muted={muted}
          playsInline
          onLoadedData={handleVideoLoaded}
          onPlay={handleVideoPlayStart}
          onEnded={handleVideoPlayEnd}
          onError={handleVideoError}
        >
          <source src={videoSrc} type="video/webm" />
          您的浏览器不支持 WebM 视频格式。
        </video>

        {showControls && (
          <Button
            type="primary"
            onClick={toggleVideoPlay}
            className="video-control-button"
          >
            {isPlaying ? "暂停" : "播放"}
          </Button>
        )}
      </div>
    );
  }
);

// 设置组件名称，便于调试
DigitalHuman.displayName = "DigitalHuman";

export default DigitalHuman;
