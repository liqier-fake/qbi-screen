import React, { useState, useEffect } from "react";
import FlipNumber from "./index";

/**
 * FlipNumber组件使用示例
 * 展示了不同场景下如何使用折叠翻牌组件
 */
const FlipNumberDemo: React.FC = () => {
  // 基础数字示例
  const [count, setCount] = useState(0);

  // 大数值示例
  const [largeNumber, setLargeNumber] = useState(12345);

  // 模拟实时数据变化
  const [realTimeData, setRealTimeData] = useState(9876);

  // 演示计时器
  const [timer, setTimer] = useState(60);

  // 自定义测试数字
  const [testNumber, setTestNumber] = useState(0);

  // 自动递增计数器
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => (prevCount + 1) % 10);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 模拟大数值随机变化
  useEffect(() => {
    const interval = setInterval(() => {
      setLargeNumber(Math.floor(10000 + Math.random() * 90000));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 模拟实时数据递减
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData((prevData) => {
        // 随机减少1-20的值
        const newValue = prevData - Math.floor(1 + Math.random() * 20);
        return newValue > 0 ? newValue : 9999;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 倒计时
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          return 60;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: "#061a30",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ marginBottom: "30px" }}>折叠翻牌效果组件示例</h2>

      <section style={{ marginBottom: "40px" }}>
        <h3>基础示例：</h3>
        <FlipNumber value={count} />
        <div style={{ marginTop: "10px", opacity: 0.7, fontSize: "14px" }}>
          每3秒自动递增
        </div>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h3>指定位数（补零）：</h3>
        <FlipNumber value={count} length={3} />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h3>倒计时效果：</h3>
        <FlipNumber
          value={timer}
          length={2}
          fontSize={42}
          width={60}
          height={80}
          backgroundColor="#1a3c5e"
        />
        <div style={{ marginTop: "10px", opacity: 0.7, fontSize: "14px" }}>
          每秒倒计时
        </div>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h3>自定义样式：</h3>
        <FlipNumber
          value={count}
          fontSize={32}
          width={60}
          height={90}
          color="#ffd700"
          backgroundColor="#333"
        />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h3>大数值：</h3>
        <FlipNumber
          value={largeNumber}
          length={5}
          duration={600}
          delay={50}
          width={45}
          height={70}
          backgroundColor="#112a42"
        />
        <div style={{ marginTop: "10px", opacity: 0.7, fontSize: "14px" }}>
          每5秒随机变化
        </div>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h3>实时数据：</h3>
        <FlipNumber
          value={realTimeData}
          length={4}
          duration={400}
          width={50}
          height={75}
          color="#33ff33"
          backgroundColor="#222"
        />
        <div style={{ marginTop: "10px", opacity: 0.7, fontSize: "14px" }}>
          每2秒随机减少
        </div>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h3>自定义速度与交互：</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
          <div>
            <p>慢速翻转 (1000ms)：</p>
            <FlipNumber
              value={testNumber}
              duration={1000}
              backgroundColor="#3a5068"
              width={50}
              height={75}
            />
          </div>
          <div>
            <p>快速翻转 (200ms)：</p>
            <FlipNumber
              value={testNumber}
              duration={200}
              backgroundColor="#3a5068"
              width={50}
              height={75}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginLeft: "20px",
            }}
          >
            <button
              onClick={() => setTestNumber((prev) => prev + 1)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2c83c4",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              增加数字
            </button>
            <button
              onClick={() =>
                setTestNumber((prev) => (prev - 1 >= 0 ? prev - 1 : 0))
              }
              style={{
                padding: "8px 16px",
                backgroundColor: "#c43e2c",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              减少数字
            </button>
            <button
              onClick={() => setTestNumber(0)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#555",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              重置为0
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FlipNumberDemo;
