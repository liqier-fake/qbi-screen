import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";

export interface BaseChartRef {
  // 暴露图表实例供外部使用
  getChartInstance: () => echarts.ECharts | null;
}

interface BaseChartProps {
  // 图表配置项
  option: EChartsOption;
  // 图表容器样式
  style?: React.CSSProperties;
  // CSS类名
  className?: string;
  // 图表主题，可选
  theme?: string;
  // 是否开启自适应容器大小
  autoResize?: boolean;
  // 图表加载状态
  loading?: boolean;
  // 图表实例创建后的回调函数
  onChartReady?: (instance: echarts.ECharts) => void;
}

/**
 * 基础 ECharts 图表组件
 * 通过 ref 抛出图表实例，支持外部访问
 * @param props - 组件属性
 * @param ref - 转发的引用
 * @returns React 组件
 */
const BaseChart = forwardRef<BaseChartRef, BaseChartProps>(
  (
    {
      option,
      style = { height: "100%", width: "100%" },
      className,
      theme,
      autoResize = true,
      loading = false,
      onChartReady,
    },
    ref
  ) => {
    // 图表容器引用
    const chartRef = useRef<HTMLDivElement>(null);
    // 图表实例引用
    const chartInstance = useRef<echarts.ECharts | null>(null);

    // 暴露图表实例给父组件
    useImperativeHandle(
      ref,
      () => ({
        getChartInstance: () => chartInstance.current,
      }),
      [chartInstance]
    );

    /**
     * 处理窗口大小变化
     */
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    // 初始化图表
    useEffect(() => {
      // 将 initChart 函数移到 useEffect 内部
      const initChart = () => {
        if (!chartRef.current) return;

        if (chartInstance.current) {
          chartInstance.current.dispose();
        }

        const newChart = echarts.init(chartRef.current, theme);
        chartInstance.current = newChart;
        newChart.setOption(option);

        // 通知父组件图表已准备就绪
        if (onChartReady) {
          onChartReady(newChart);
        }
      };

      initChart();

      if (autoResize) {
        window.addEventListener("resize", handleResize);
      }

      return () => {
        if (autoResize) {
          window.removeEventListener("resize", handleResize);
        }
        chartInstance.current?.dispose();
      };
    }, [theme, autoResize, option, onChartReady]);

    // 更新图表配置
    useEffect(() => {
      if (chartInstance.current) {
        chartInstance.current.setOption(option);
      }
    }, [option]);

    // 更新加载状态
    useEffect(() => {
      if (chartInstance.current) {
        if (loading) {
          chartInstance.current.showLoading();
        } else {
          chartInstance.current.hideLoading();
        }
      }
    }, [loading]);

    return <div ref={chartRef} style={style} className={className} />;
  }
);

// 添加组件显示名称，方便调试
BaseChart.displayName = "BaseChart";

export default BaseChart;
