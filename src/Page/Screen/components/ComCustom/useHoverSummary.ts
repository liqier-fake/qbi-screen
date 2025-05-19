import { useRef, useEffect } from "react";
import { ComCustomItemType } from "./types";
import { fetchEventSource } from "@microsoft/fetch-event-source";

/**
 * 获取AI总结的自定义Hook
 * @param onHoverItem 悬停回调函数
 * @param getItemContent 获取悬停项内容的函数
 * @param getCategoryDescription 获取分类描述的函数
 * @returns 返回鼠标事件处理函数
 */
export const useHoverSummary = (
  onHoverItem?: (content: string) => void,
  getItemContent?: (item: ComCustomItemType) => string,
  getCategoryDescription?: (title: string) => string
) => {
  // 添加计时器引用
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // 添加当前hover的项
  const currentHoverRef = useRef<ComCustomItemType | null>(null);
  // 添加控制器引用，用于取消请求
  const ctrlRef = useRef<AbortController | null>(null);

  /**
   * 获取并处理AI总结内容
   * @param item 当前hover的项
   */
  const fetchSummary = async (item: ComCustomItemType) => {
    try {
      // 获取对应的分类描述
      const description = getCategoryDescription
        ? getCategoryDescription(item.title)
        : "";

      // 构建内容
      const content = getItemContent
        ? getItemContent(item)
        : `${item.title}: ${item.value}`;

      // 组合内容：如果有分类描述，则将其作为背景信息放在前面，然后是具体内容
      const fullContent = description
        ? `${description}。此外，${content}`
        : content;

      console.log("正在请求AI总结，内容:", fullContent);

      // 取消之前的请求
      if (ctrlRef.current) {
        ctrlRef.current.abort();
        ctrlRef.current = null;
      }

      // 创建新的控制器
      const ctr = new AbortController();
      ctrlRef.current = ctr;

      // 获取API基础URL
      const baseApiUrl = import.meta.env.VITE_BASE_API_URL || "";
      const apiUrl = `${baseApiUrl}/process-data`;

      console.log("调用API URL:", apiUrl);

      // 初始化总结内容
      let summaryResult = "";

      // 使用fetchEventSource请求AI总结
      fetchEventSource(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + import.meta.env.VITE_CHAT_TOKEN,
        },
        body: JSON.stringify({
          task: "summary",
          content: fullContent,
        }),
        signal: ctr.signal,
        onmessage(msg) {
          try {
            console.log("收到API响应消息:", msg.data);
            const res = JSON.parse(msg.data);
            summaryResult += res.content || "";

            // 如果当前hover项仍然是这个项目，则更新显示
            if (
              currentHoverRef.current &&
              currentHoverRef.current.title === item.title &&
              onHoverItem
            ) {
              console.log("更新AI总结内容:", summaryResult);
              onHoverItem(summaryResult);
            }
          } catch (error) {
            console.error("解析AI总结数据失败:", error);
          }
        },
        onclose() {
          console.log("AI总结请求关闭");
        },
        onerror(err) {
          console.error("AI总结请求出错:", err);
          // 发生错误时显示基本信息
          if (
            currentHoverRef.current &&
            currentHoverRef.current.title === item.title &&
            onHoverItem
          ) {
            const basicContent = getItemContent
              ? getItemContent(item)
              : item.title;
            onHoverItem(basicContent);
          }
          // 阻止自动重试
          throw new Error("请求失败，终止 fetchEventSource");
        },
      });
    } catch (error) {
      console.error("获取AI总结失败:", error);
      // 发生错误时显示基本信息
      if (
        currentHoverRef.current &&
        currentHoverRef.current.title === item.title &&
        onHoverItem
      ) {
        const basicContent = getItemContent ? getItemContent(item) : item.title;
        onHoverItem(basicContent);
      }
    }
  };

  /**
   * 鼠标进入事件处理
   * @param item 当前hover的项目
   */
  const onMouseEnter = (item: ComCustomItemType) => {
    // 清除上一个计时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // 取消进行中的API请求
    if (ctrlRef.current) {
      ctrlRef.current.abort();
      ctrlRef.current = null;
    }

    // 保存当前hover的项
    currentHoverRef.current = item;

    // 设置1秒后获取AI总结
    timerRef.current = setTimeout(() => {
      // 在等待AI请求时显示加载状态
      if (onHoverItem) {
        onHoverItem("加载中...");
      }

      // 然后获取AI总结
      fetchSummary(item);
    }, 1000);
  };

  /**
   * 鼠标离开事件处理
   */
  const onMouseLeave = () => {
    // 清除计时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    return;

    // 取消API请求
    if (ctrlRef.current) {
      ctrlRef?.current?.abort();
      ctrlRef.current = null;
    }

    // 清除当前hover项
    currentHoverRef.current = null;
  };

  // 组件卸载时清除计时器和取消请求
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (ctrlRef.current) {
        ctrlRef?.current?.abort();
        ctrlRef.current = null;
      }
    };
  }, []);

  return {
    onMouseEnter,
    onMouseLeave,
  };
};
