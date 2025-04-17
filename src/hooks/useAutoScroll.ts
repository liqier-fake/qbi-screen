import { useEffect, useRef, useState, DependencyList } from "react";

/**
 * 自动滚动到底部的自定义Hook
 * @param dependencies - 依赖数组，当这些值变化时触发自动滚动
 * @param scrollThreshold - 判断是否在底部的阈值（像素），默认为20
 * @param initialScrollState - 初始滚动状态，默认为false
 * @returns - 包含ref和事件处理函数的对象
 */
const useAutoScroll = (
  dependencies: DependencyList = [],
  scrollThreshold: number = 20,
  initialScrollState: boolean = false
) => {
  // 用户是否手动滚动的状态
  const [userScrolled, setUserScrolled] = useState(initialScrollState);
  // 滚动容器引用
  const scrollRef = useRef<HTMLElement | null>(null);

  /**
   * 处理滚动事件
   * 检测用户是否手动滚动，并相应更新状态
   */
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // 如果用户向上滚动（不在底部），则标记为用户已滚动
    if (scrollHeight - scrollTop - clientHeight > scrollThreshold) {
      setUserScrolled(true);
    } else {
      // 如果滚动到底部，重置用户滚动状态
      setUserScrolled(false);
    }
  };

  /**
   * 滚动到底部
   * 只有当用户未手动滚动时才执行
   */
  const scrollToBottom = () => {
    if (scrollRef.current && !userScrolled) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  /**
   * 重置滚动状态
   * 可用于外部强制重置滚动状态
   */
  const resetScrollState = () => {
    setUserScrolled(false);
  };

  // 监听依赖变化，自动滚动到底部
  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);

  return {
    scrollRef,
    handleScroll,
    scrollToBottom,
    resetScrollState,
    userScrolled,
    setUserScrolled,
  };
};

export default useAutoScroll;
