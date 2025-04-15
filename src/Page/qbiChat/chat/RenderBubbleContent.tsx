import type { BubbleProps } from "@ant-design/x";
import { Collapse, Typography } from "antd";

import { BubbleReplayType, ToolName, ToolSectionType } from "../common";

import "./chat.less";
import markdownit from "markdown-it";
// import { useMemo } from "react";
import { ThoughtChain } from "@ant-design/x";
import { DownCircleFilled, LoadingOutlined } from "@ant-design/icons";
import ChartView from "../chat-content/chat-view";

const ToolSection = (msg: ToolSectionType) => {
  /**
   * 尝试格式化代码字符串
   * @param codeString 代码字符串
   * @returns 格式化后的代码
   */
  const formatCodeString = (codeString: string) => {
    if (!codeString) return "";

    try {
      // 1. 尝试解析 JSON
      const parsed =
        typeof codeString === "string" ? JSON.parse(codeString) : codeString;

      // 2. 获取 code 内容
      const codeContent = parsed?.code || parsed?.query || parsed;

      // 3. 处理代码格式
      if (typeof codeContent === "string") {
        return (
          codeContent
            // 替换连续的换行为单个换行
            .replace(/\n\s*\n/g, "\n")
            // 替换多个空格为单个空格
            .replace(/\s+/g, " ")
            // 处理特殊的格式情况
            .replace(/([=({])\s/g, "$1")
            .replace(/\s([})])/g, "$1")
            // 在适当的位置添加换行
            .replace(/([;)])\s/g, "$1\n")
            .trim()
        );
      }

      return JSON.stringify(codeContent, null, 2);
    } catch {
      return codeString;
    }
  };

  // 添加解析SQL执行结果的函数
  const renderSqlResult = () => {
    if (msg.name !== "execute_sql" || !msg.result) return null;

    try {
      const resultData =
        typeof msg.result === "string" ? JSON.parse(msg.result) : msg.result;

      // 检查结果是否包含chart_values和chart_type
      if (resultData.chart_values && resultData.chart_type) {
        // 将chart_values转换为ChartView期望的数据格式
        const chartData = resultData.chart_values.map((item: any) => ({
          name: item.name,
          type: item.type,
          value: Number(item.value), // 确保value是数字类型
        }));

        return (
          <div className="chart-container">
            <Typography.Text type="secondary">图表可视化</Typography.Text>
            <ChartView
              data={chartData}
              type={resultData.chart_type}
              sql={formatCodeString(msg.toolContent) || ""}
            />
          </div>
        );
      }
      return null;
    } catch (error) {
      console.error("解析SQL执行结果出错:", error);
      return null;
    }
  };

  // 初始化 markdown-it
  const md = markdownit({
    html: true, // 允许 HTML 标签
    breaks: true, // 转换换行符为 <br>
    linkify: true, // 自动转换 URL 为链接
  });

  return (
    <div className="tool-messages">
      {msg.result && (
        <div className="tool-section">
          <div className="code-block">
            {msg.name !== "execute_sql" && (
              <Typography>
                <div
                  dangerouslySetInnerHTML={{ __html: md.render(msg.result) }}
                />
              </Typography>
            )}
          </div>
          {msg.name === "execute_sql" && renderSqlResult()}
        </div>
      )}
    </div>
  );
};

// 创建 markdown 渲染函数
const RenderBubbleContent: BubbleProps["messageRender"] = (content: string) => {
  // const contentPaseResul = useMemo(() => {
  //   if (!content) return { thinkList: [], list: [], sendOver: false };
  //   let c: BubbleReplayType = {};
  //   try {
  //     c = JSON.parse(content);
  //   } catch (err) {
  //     console.log(err, "RenderBubbleContent parse error");
  //     c = { sendOver: false, msg: [] };
  //   }

  //   return {
  //     thinkList: c?.msg?.filter((item) => item.type === "tool") || [],
  //     list: c?.msg?.filter((item) => item.type === "normal") || [],
  //     sendOver: c?.sendOver,
  //   };
  // }, [content]);

  const getContentPaseResul = (content: string) => {
    if (!content) return { thinkList: [], list: [], sendOver: false };
    let c: BubbleReplayType = {};
    try {
      c = JSON.parse(content);
    } catch (err) {
      console.log(err, "RenderBubbleContent parse error");
      c = { sendOver: false, msg: [] };
    }

    return {
      thinkList: c?.msg?.filter((item) => item.type === "tool") || [],
      list: c?.msg?.filter((item) => item.type === "normal") || [],
      sendOver: c?.sendOver,
    };
  };

  const { thinkList, list, sendOver } = getContentPaseResul(content);

  // 初始化 markdown-it
  const md = markdownit({
    html: true, // 允许 HTML 标签
    breaks: true, // 转换换行符为 <br>
    linkify: true, // 自动转换 URL 为链接
  });

  return (
    <div>
      {thinkList.length > 0 && (
        <Collapse defaultActiveKey={["thinking"]}>
          <Collapse.Panel
            header={
              !sendOver ? (
                <div>
                  正在分析
                  <LoadingOutlined />
                </div>
              ) : (
                <div>
                  分析完成 <DownCircleFilled style={{ color: "#1890ff" }} />
                </div>
              )
            }
            key="thinking"
          >
            <ThoughtChain
              size="small"
              styles={{
                itemContent: {
                  width: "90%",
                },
              }}
              items={thinkList.map((item) => {
                const { tool } = item;
                return {
                  title: ToolName[tool.name as keyof typeof ToolName],
                  icon: tool.toolLoading ? (
                    <LoadingOutlined />
                  ) : (
                    <DownCircleFilled style={{ color: "#1890ff" }} />
                  ),
                  content: <ToolSection {...tool} />,
                  key: tool.toolId,
                };
              })}
            />
          </Collapse.Panel>
        </Collapse>
      )}

      {list.map((item) => {
        const { content: normalContent } = item;
        return (
          <Typography>
            <div
              dangerouslySetInnerHTML={{ __html: md.render(normalContent) }}
            />
          </Typography>
        );
      })}
    </div>
  );
};

export default RenderBubbleContent;
