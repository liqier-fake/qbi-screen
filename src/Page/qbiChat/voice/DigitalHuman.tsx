import React, { useRef, useEffect } from "react";
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
  /** 是否循环播放 */
  loop?: boolean;
  /** 是否静音 */
  muted?: boolean;
  /** 组件自定义类名 */
  className?: string;
  /** 控制播放状态，true播放，false暂停 */
  play?: boolean;
  /** 播放开始回调 */
  onPlayStart?: () => void;
  /** 播放结束回调 */
  onPlayEnd?: () => void;
  /** 播放错误回调 */
  onError?: (error: Error | Event) => void;
}

/**
 * 数字人视频组件实例接口
 */
export interface DigitalHumanInstance {
  /** 播放视频 */
  playVideo: () => void;
  /** 暂停视频 */
  pauseVideo: () => void;
}

/**
 * 数字人视频组件
 *
 * 用于展示数字人视频，通过play属性控制播放状态
 */
const DigitalHuman = React.forwardRef<DigitalHumanInstance, DigitalHumanProps>(
  (
    {
      videoSrc,
      width = "300px",
      height = "500px",
      loop = false,
      muted = true,
      className = "",
      play = false,
      onPlayStart,
      onPlayEnd,
      onError,
    },
    ref
  ) => {
    // 视频引用
    const videoRef = useRef<HTMLVideoElement>(null);

    // 播放视频
    const playVideo = () => {
      if (videoRef.current) {
        // 如果视频已结束，先重置时间
        if (videoRef.current.ended) {
          videoRef.current.currentTime = 0;
        }

        videoRef.current
          .play()
          .then(() => {
            if (onPlayStart) {
              onPlayStart();
            }
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
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };

    // 暴露组件方法
    React.useImperativeHandle(ref, () => ({
      playVideo,
      pauseVideo,
    }));

    // 根据play属性控制视频播放/暂停
    useEffect(() => {
      if (play) {
        playVideo();
      } else {
        pauseVideo();
      }
    }, [play]);

    // 处理视频播放结束
    const handleVideoPlayEnd = () => {
      if (onPlayEnd) {
        onPlayEnd();
      }
    };

    // 组件卸载时暂停视频
    useEffect(() => {
      return () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.src = "";
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
          onPlay={onPlayStart}
          onEnded={handleVideoPlayEnd}
          onError={(e) =>
            onError && onError(e.nativeEvent || new Error("视频播放错误"))
          }
        >
          <source src={videoSrc} type="video/webm" />
          您的浏览器不支持 WebM 视频格式。
        </video>
      </div>
    );
  }
);

// 设置组件名称，便于调试
DigitalHuman.displayName = "DigitalHuman";

export default DigitalHuman;
