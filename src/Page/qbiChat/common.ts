export interface AIMessageEvent {
  /**
   * 事件类型，可能的值：
   * - "ai_message": 表示大模型生成的消息。
   * - "tool_message": 表示工具执行的结果。
   */
  event: "ai_message" | "tool_message";

  /**
   * 任务ID，标识当前任务。
   */
  task_id: string;

  /**
   * 消息ID，标识当前消息。
   */
  id: string;

  /**
   * 消息类型，可能的值：
   * - "tool_call": 表示开始执行工具调用。
   * - "tool_arguments": 表示模型生成的消息正在发送给工具。
   * - 空字符串：表示大模型输出的普通消息。
   */
  type: "tool_calls" | "tool_arguments" | "";

  /**
   * 工具调用的名称。当 type 为 "tool_call" 时，此字段表示工具调用的名称。
   */
  name: string;

  /**
   * 消息内容。当 event 为 "ai_message" 时，表示大模型生成的内容；
   * 当 event 为 "tool_message" 时，表示工具执行的结果。
   */
  content: string;

  /**
   * 工具ID，标识当前使用的工具。
   */
  tool_id: string;

  /**
   * 工具调用ID，标识当前工具调用的唯一ID。
   */
  tool_call_id: string;

  /**
   * 消息创建的时间戳。
   */
  created_at: number;

  /**
   * 完成原因，可能的值：
   * - 当 type 为 "tool_call" 时，表示 "tool_arguments" 消息生成已结束。
   * - "stop": 表示整个 workflow 执行结束。
   * - 空字符串：表示未结束。
   */
  finish_reason: "stop" | "tool_calls" | "";

  conversation_id: string;
}

export interface ChatParma {
  query: string;
  conversation_id: string;
}

export type funV = () => void;

export type BubbleType =
  | { type: "replay"; msg: BubbleReplayType }
  | { type: "ask"; msg: string };

export type BubbleReplayType = {
  msg?: MsgListType[];
  sendOver?: boolean;
};

export enum ToolName {
  "execute_sql" = "数据处理",
  "execute_python" = "数据分析",
  "question_analysis" = "问题分析",
  "knowledge_retrieval" = "知识检索",
}

export enum ToolName_Field {
  "execute_sql" = "code",
  "execute_python" = "query",
}

export interface MsgListType {
  type: "normal" | "tool";
  content: string;
  tool: ToolSectionType;
}

export interface ToolSectionType {
  toolContent: string;
  result: string;
  name: string;
  toolLoading: boolean;
  toolId: string;
}

export interface ChatProps {
  apiUrl: string;
  apiKey: string;
  className?: string;
  showAvatar?: boolean;
  tipStr?: React.ReactNode;
  tips?: string[];
}
