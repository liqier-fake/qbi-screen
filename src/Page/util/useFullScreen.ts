import { useState, useCallback, useEffect, RefObject } from "react";

// 定义全屏API的类型
interface FullscreenDocument extends Document {
  fullscreenElement: Element | null;
  webkitFullscreenElement: Element | null;
  mozFullScreenElement: Element | null;
  msFullscreenElement: Element | null;
  exitFullscreen: () => Promise<void>;
  webkitExitFullscreen: () => Promise<void>;
  mozCancelFullScreen: () => Promise<void>;
  msExitFullscreen: () => Promise<void>;
}

interface FullscreenElement extends HTMLElement {
  requestFullscreen: () => Promise<void>;
  webkitRequestFullscreen: () => Promise<void>;
  mozRequestFullScreen: () => Promise<void>;
  msRequestFullscreen: () => Promise<void>;
}

/**
 * 全屏管理hook
 * @param {RefObject<HTMLElement>} targetRef - 需要全屏显示的DOM元素引用，默认为整个文档
 * @returns {Object} 包含全屏状态和控制方法的对象
 */
const useFullscreen = (targetRef?: RefObject<HTMLElement>) => {
  // 全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 检查当前是否处于全屏状态
  const checkFullscreen = useCallback(() => {
    const doc = document as FullscreenDocument;
    const fullscreenElement =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    return !!fullscreenElement;
  }, []);

  // 进入全屏
  const enterFullscreen = useCallback(() => {
    const element = targetRef?.current || document.documentElement;
    console.log("element 进入全屏", element);

    if (!element) return Promise.reject(new Error("目标元素不存在"));

    const fullscreenElement = element as FullscreenElement;

    if (fullscreenElement.requestFullscreen) {
      return fullscreenElement.requestFullscreen();
    } else if (fullscreenElement.webkitRequestFullscreen) {
      return fullscreenElement.webkitRequestFullscreen();
    } else if (fullscreenElement.mozRequestFullScreen) {
      return fullscreenElement.mozRequestFullScreen();
    } else if (fullscreenElement.msRequestFullscreen) {
      return fullscreenElement.msRequestFullscreen();
    }

    return Promise.reject(new Error("全屏API不受支持"));
  }, [targetRef]);

  // 退出全屏
  const exitFullscreen = useCallback(() => {
    const doc = document as FullscreenDocument;

    if (doc.exitFullscreen) {
      return doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      return doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      return doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      return doc.msExitFullscreen();
    }

    return Promise.reject(new Error("全屏API不受支持"));
  }, []);

  // 切换全屏状态
  const toggleFullscreen = useCallback(() => {
    if (checkFullscreen()) {
      return exitFullscreen();
    } else {
      return enterFullscreen();
    }
  }, [checkFullscreen, enterFullscreen, exitFullscreen]);

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(checkFullscreen());
    };

    // 注册各种浏览器前缀的全屏变化事件
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // 初始化状态
    setIsFullscreen(checkFullscreen());

    // 清理事件监听
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, [checkFullscreen]);

  return {
    isFullscreen, // 当前是否全屏状态
    toggleFullscreen, // 切换全屏
    enterFullscreen, // 进入全屏
    exitFullscreen, // 退出全屏
  };
};

export default useFullscreen;
