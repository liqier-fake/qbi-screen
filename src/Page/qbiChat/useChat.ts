import { useState } from "react";
import {
  EventSourceMessage,
  fetchEventSource,
} from "@microsoft/fetch-event-source";
import cloneDeep from "lodash/cloneDeep";
import { MsgListType, AIMessageEvent, ChatParma, funV } from "./common";

/**
 * 聊天钩子函数，用于管理与AI聊天的状态和操作
 * @param url API端点路径
 * @returns 聊天相关的状态和方法
 */
function useChat(apiUrl: string, apiKey: string) {
  // 控制器，用于取消请求
  const [ctrl, setCtrl] = useState<AbortController | null>(null);

  // 标记消息发送是否完成
  const [sendOver, setSendOver] = useState<boolean>(false);

  const [conversationId, setConversationId] = useState<string>("");

  const [msgList, setMsgList] = useState<MsgListType[]>([]);

  const resetState = () => {
    setMsgList([]);
    setSendOver(false);
  };

  // // 用于保存 msgList 的引用
  // const msgListRef = useRef<MsgListType[]>([]);

  // useEffect(() => {
  //   msgListRef.current = msgList;
  // }, [msgList]);

  const handleMessage = (msg: EventSourceMessage) => {
    const res: AIMessageEvent = JSON.parse(msg.data);
    const {
      event,
      type,
      content,
      name,
      finish_reason,
      conversation_id,
      tool_id,
      tool_call_id,
    } = res;

    console.log(res, "res");

    if (conversationId !== conversation_id) {
      setConversationId(conversation_id);
    }

    const isNewMsg = (
      msgList: MsgListType[],
      finish_reason: string,
      type: string,
      event: string
    ): boolean => {
      const last = msgList[msgList.length - 1];
      if (!msgList.length) return true;
      if (finish_reason === "tool_calls") return false;
      if (event === "tool_message") return false;

      let currentType = "";
      switch (type) {
        case "tool_calls":
          currentType = "tool";
          break;
        case "tool_arguments":
          currentType = "tool";
          break;
        case "":
          currentType = "normal";
          break;
        default:
          break;
      }

      return (
        currentType !== last?.type ||
        (currentType === "tool" && type === "tool_calls")
      );
    };

    setMsgList((prevList) => {
      const isNew = isNewMsg(prevList, finish_reason, type, event);
      const newList = [...prevList];

      const msgItem: MsgListType = isNew
        ? ({
            type: "",
            content: "",
            tool: {
              toolContent: "",
              result: "",
              name: "",
              toolLoading: false,
              toolId: "",
            },
          } as unknown as MsgListType)
        : cloneDeep(prevList[prevList.length - 1]);

      if (finish_reason === "tool_calls") {
        msgItem.tool.toolLoading = false;
      }
      if (event === "tool_message") {
        msgItem.tool.result += content;

        // tool_id == tool_call_id 当前工具调用结束
        newList.map((item) => {
          if (item.tool.toolId === tool_call_id) {
            item.tool.toolLoading = false;
          }
        });
      }
      if (!finish_reason && event === "ai_message") {
        switch (type) {
          case "tool_calls":
            msgItem.type = "tool";
            msgItem.tool.name = name;
            msgItem.tool.toolLoading = true;
            msgItem.tool.toolId = tool_id;
            break;
          case "tool_arguments":
            msgItem.tool.toolContent += content;
            break;
          case "":
            msgItem.type = "normal";
            msgItem.content += content;
            break;
        }
      }

      if (isNew) {
        newList.push(msgItem);
      } else {
        newList[newList.length - 1] = msgItem;
      }

      return newList;
    });

    if (finish_reason === "stop") {
      console.log("生成结束");
    }
  };

  const sendMessage = (
    msg: ChatParma,
    mtd?: { close?: funV; error?: funV; success?: funV }
  ) => {
    const ctr = new AbortController();
    setCtrl(ctr);
    setSendOver(false);
    fetchEventSource(`${apiUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify(msg),
      signal: ctr.signal,
      onmessage(msg) {
        handleMessage(msg);
      },
      onclose() {
        mtd?.close?.();

        // 直接更新状态，但保留消息列表
        setSendOver(true);

        // 如果需要清空消息列表，应该由外部明确触发
        // 而不是在异步回调中自动进行
        // setMsgList([]);
      },
      onerror(err) {
        console.error("请求出错:", err);

        // **终止请求，防止无限重试**
        console.log(ctrl, "ctrl");
        cancelMessage();
        // **更新状态，避免 UI 持续 loading**
        setSendOver(true);

        // **调用错误回调**
        mtd?.error?.();

        // **阻止自动重试**
        throw new Error("请求失败，终止 fetchEventSource");
      },
    });
  };

  const cancelMessage = () => {
    if (ctrl) {
      console.log("取消请求", ctrl);
      ctrl.abort(); // 终止请求
      setCtrl(null); // 避免多次取消
    }
    setSendOver(false);
  };

  return {
    sendMessage,
    msgList,
    cancelMessage,
    sendOver,
    conversationId,
    setConversationId,
    resetState,
    setSendOver,
  };
}

export default useChat;
