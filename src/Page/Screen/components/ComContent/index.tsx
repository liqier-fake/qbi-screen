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
  // 初始化 markdown-it
  const md = markdownit({
    html: true, // 允许 HTML 标签
    breaks: true, // 转换换行符为 <br>
    linkify: true, // 自动转换 URL 为链接
  });

  // 处理滚动事件
  const handleScroll = () => {
    if (!markdown) {
      return;
    }

    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    // 如果用户向上滚动（不在底部），则标记为用户已滚动
    if (scrollHeight - scrollTop - clientHeight > 5) {
      // 减小判断阈值，提高精确度
      setUserScrolled(true);
    } else {
      // 如果滚动到底部，重置用户滚动状态
      setUserScrolled(false);
    }
  };

  // 内容变化时滚动到底部
  useEffect(() => {
    if (!markdown) {
      return;
    }

    // 如果内容没有实质变化，不触发滚动
    if (prevContentRef.current === content) {
      return;
    }

    // 更新内容引用
    prevContentRef.current = content;

    // 滚动到底部，使用requestAnimationFrame确保DOM更新后再滚动
    const scrollToBottom = () => {
      if (scrollContainerRef.current && !userScrolled) {
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            container.scrollTop = container.scrollHeight;
          }
        });
      }
    };

    // 延迟执行滚动，等待内容渲染完成
    const timeoutId = setTimeout(scrollToBottom, 10);
    return () => clearTimeout(timeoutId);
  }, [content, userScrolled, markdown]);

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
        style={{ height: maxHeight }}
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
