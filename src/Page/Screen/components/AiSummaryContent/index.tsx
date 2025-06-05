import { useEffect, useRef, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import ComContent from "../ComContent";

interface AiSummaryContentProps {
  /**
   * 需要生成总结的数据
   */
  data: Record<string, unknown>[];
}

/**
 * AI总结内容组件
 */
const AiSummaryContent = ({ data }: AiSummaryContentProps) => {
  // AI总结
  const [aiSummary, setAiSummary] = useState<string>("");
  // AI总结加载状态
  const [aiLoading, setAiLoading] = useState(false);
  // 中断控制器
  const ctrlRef = useRef<AbortController | null>(null);

  /**
   * 生成AI总结
   */
  const generateAiSummary = (data: Record<string, unknown>[]) => {
    // 如果没有数据，则不生成总结
    if (!data || data.length === 0) {
      setAiSummary("没有数据可供总结");
      return;
    }

    // 设置加载状态为true
    setAiLoading(true);

    // 取消之前的请求
    if (ctrlRef.current) {
      ctrlRef.current.abort();
      ctrlRef.current = null;
    }

    // 创建新的控制器
    const ctr = new AbortController();
    ctrlRef.current = ctr;

    // 将数据中的内容提取出来，作为AI总结的输入
    const content = data
      .map((item) => {
        // 假设数据中有content字段
        if (item.content) return item.content;
        // 如果没有content字段，尝试将对象转为字符串
        return JSON.stringify(item);
      })
      .join("\n");

    // 重置AI总结
    setAiSummary("");
    // 使用fetchEventSource请求AI总结
    fetchEventSource(`${import.meta.env.VITE_BASE_API_URL}/process-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + import.meta.env.VITE_CHAT_TOKEN,
      },
      body: JSON.stringify({
        task: "summary+breakdown",
        content,
      }),
      signal: ctr.signal,
      onmessage(msg) {
        try {
          const res = JSON.parse(msg.data);
          setAiSummary((prev) => prev + (res.content || ""));
          // 如果收到消息，说明已经开始生成内容，可以关闭loading
          if (res.content) {
            setAiLoading(false);
          }
        } catch (error) {
          console.error("解析AI总结数据失败:", error);
          setAiLoading(false);
        }
      },
      onclose() {
        console.log("AI总结请求关闭");
        setAiLoading(false);
      },
      onerror(err) {
        console.error("AI总结请求出错:", err);
        setAiSummary("AI总结生成失败，请稍后再试");
        setAiLoading(false);
        // 阻止自动重试
        throw new Error("请求失败，终止 fetchEventSource");
      },
    });
  };

  useEffect(() => {
    generateAiSummary(data);
    return () => {
      // 组件卸载时，取消请求
      if (ctrlRef.current) {
        ctrlRef.current.abort();
        ctrlRef.current = null;
      }
    };
  }, [data]);

  return (
    <>
      <ComContent
        content={aiLoading ? "加载中..." : aiSummary || ""}
        markdown={true}
        // maxHeight={350}
      />
    </>
  );
};

export default AiSummaryContent;
