import { Typography } from "antd";
import styles from "./index.module.less";
import markdownit from "markdown-it";
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
interface ComContentProps {
  content: string;
  markdown?: boolean;
  maxHeight?: number;
  ghost?: boolean;
}

const ComContent = ({
  content,
  markdown = false,
  maxHeight = 160,
  ghost = false,
}: ComContentProps) => {
  const [userScrolled, setUserScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // 记录上一次内容，用于判断是否真正变化
  const prevContentRef = useRef<string>("");
  // 滚动防抖定时器
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 标记是否正在执行自动滚动
  const isAutoScrollingRef = useRef<boolean>(false);
  // 记录内容高度，用于判断是否需要滚动
  const prevHeightRef = useRef<number>(0);
  // 记录是否是首次加载
  const isInitialLoadRef = useRef<boolean>(true);

  // 初始化 markdown-it
  const md = markdownit({
    html: true, // 允许 HTML 标签
    breaks: true, // 转换换行符为 <br>
    linkify: true, // 自动转换 URL 为链接
  });

  // 处理滚动事件（添加防抖机制）
  const handleScroll = () => {
    if (!markdown) {
      return;
    }

    // 如果是自动滚动触发的事件，忽略它
    if (isAutoScrollingRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    // 清除之前的定时器
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    // 设置新的定时器（150ms防抖）
    scrollTimerRef.current = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // 使用更大的阈值判断是否在底部，提高稳定性
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;

      if (!isAtBottom) {
        // 用户已向上滚动
        setUserScrolled(true);
      } else {
        // 用户滚动到了底部
        setUserScrolled(false);
      }
    }, 150);
  };

  // 平滑滚动到底部
  const smoothScrollToBottom = (container: HTMLDivElement) => {
    // 标记开始自动滚动
    isAutoScrollingRef.current = true;

    // 添加平滑滚动类
    container.style.scrollBehavior = "smooth";

    // 滚动到底部
    container.scrollTop = container.scrollHeight;

    // 滚动结束后重置样式和标记
    setTimeout(() => {
      container.style.scrollBehavior = "auto";
      isAutoScrollingRef.current = false;
    }, 300); // 滚动动画持续时间
  };

  // 内容变化时的滚动处理
  useEffect(() => {
    if (!markdown) {
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    // 检查内容是否真正变化
    const hasContentChanged = prevContentRef.current !== content;

    // 更新内容引用
    prevContentRef.current = content;

    // 如果内容没有变化，不进行任何操作
    if (!hasContentChanged) return;

    // 获取当前滚动位置信息
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    const currentHeight = container.scrollHeight;

    // 计算内容高度变化
    const heightDifference = currentHeight - prevHeightRef.current;
    prevHeightRef.current = currentHeight;

    // 首次加载或用户未手动滚动时，滚动到底部
    if (isInitialLoadRef.current) {
      // 首次加载延迟更长时间等待渲染完成
      isInitialLoadRef.current = false;

      setTimeout(() => {
        if (container) {
          smoothScrollToBottom(container);
        }
      }, 100);
      return;
    }

    // 只在以下情况滚动到底部：
    // 1. 用户没有手动滚动（userScrolled为false）
    // 2. 用户已经在底部（isAtBottom为true）
    // 3. 内容高度增加（增量输出）
    if ((!userScrolled || isAtBottom) && heightDifference > 0) {
      // 使用requestAnimationFrame确保在浏览器下一次重绘前执行
      requestAnimationFrame(() => {
        if (container) {
          smoothScrollToBottom(container);
        }
      });
    }
  }, [content, userScrolled, markdown]);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={classNames(styles.comContentWrap, {
        [styles.ghost]: ghost,
      })}
    >
      <div
        className={styles.comContent}
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ maxHeight: maxHeight }}
      >
        {markdown ? (
          <Typography style={{ width: "100%", height: "100%" }}>
            <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
          </Typography>
        ) : (
          content
        )}
      </div>
      <span className={classNames(styles.leftTop, styles.icon)}> </span>
      <span className={classNames(styles.rightTop, styles.icon)}> </span>
      <span className={classNames(styles.leftBottom, styles.icon)}> </span>
      <span className={classNames(styles.rightBottom, styles.icon)}> </span>
    </div>
  );
};

export default ComContent;
