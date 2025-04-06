/**
 * rem响应式布局适配函数
 * 基于设计图标准：2180/6144
 */

export function initRem(designWidth: number, baseFontSize: number) {
  const setRem = () => {
    // 获取当前视口宽度
    const clientWidth =
      document.documentElement.clientWidth || window.innerWidth;
    // 计算根元素字体大小
    const fontSize = (clientWidth / designWidth) * baseFontSize;
    // 设置根元素字体大小
    document.documentElement.style.fontSize = `${fontSize}px`;
  };

  // 初始化时执行一次
  setRem();

  // 监听窗口大小变化，动态调整rem基准值
  window.addEventListener("resize", setRem);
  window.addEventListener("orientationchange", setRem);

  return () => {
    // 清理监听器
    window.removeEventListener("resize", setRem);
    window.removeEventListener("orientationchange", setRem);
  };
}
