import { Bubble, Sender } from "@ant-design/x";
import { Flex } from "antd";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  DislikeOutlined,
  LikeOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { BubbleType, ChatProps } from "../common";

import "./chat.less";

import RenderBubbleContent from "./RenderBubbleContent";
import useChat from "../useChat";
import VoicePlayer from "../voice";
// 引入类型但不使用组件
import DigitalHuman, { DigitalHumanInstance } from "../voice/DigitalHuman";
import broadcaster from "./digital.webm";
import clearChat from "./delete.png";
import Confirm from "../Confirm";
// 定义消息类型
interface MessageItem {
  type: string;
  content: string;
  tool: {
    toolContent: string;
    result: string;
    name: string;
    toolLoading: boolean;
    toolId: string;
  };
}

// 定义回复消息类型
interface ReplayMessage {
  sendOver: boolean;
  msg: MessageItem[];
}

/**
 * 聊天组件，用于展示聊天界面和处理聊天逻辑
 * 实现了用户提问和AI回答的交互功能
 */
function Chat({
  apiUrl,
  apiKey,
  showAvatar = false,
  tipStr,
  tips = [
    "斜塘街道，治理挑战指数最大的社区是哪个？",
    "请帮我从新市民劳动者群体中，筛选10条含极端扬言的工单",
  ],
}: ChatProps) {
  // 存储聊天气泡列表
  const [bubbleList, setBubbleList] = useState<BubbleType[]>([]);
  // 当前输入的消息
  const [message, setMessage] = useState<string>("");
  // 是否正在发送消息
  const [isSending, setIsSending] = useState<boolean>(false);
  // 聊天区域引用，用于滚动操作
  const chatRef = useRef<HTMLDivElement>(null);
  // 当前选中的消息索引，用于语音播放
  // const [selectedMessageIndex, setSelectedMessageIndex] = useState<number>(-1);
  // 当前正在播放的消息索引
  // const [playingMessageIndex, setPlayingMessageIndex] = useState<number>(-1);
  // 数字人组件引用
  const videoRef = useRef<DigitalHumanInstance>(null);
  // 是否有语音在播放
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  const {
    sendMessage,
    cancelMessage,
    sendOver,
    conversationId,
    setConversationId,
    msgList,
    setSendOver,
  } = useChat(apiUrl, apiKey);

  /**
   * 从localStorage加载聊天记录
   */
  useEffect(() => {
    const savedChat = localStorage.getItem("chatHistory");
    if (savedChat) {
      try {
        const parsedChat = JSON.parse(savedChat);
        setBubbleList(parsedChat);
      } catch (error) {
        console.error("加载聊天记录失败:", error);
      }
    }
  }, []);

  /**
   * 将聊天记录保存到localStorage
   */
  useEffect(() => {
    if (bubbleList.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(bubbleList));
    }
  }, [bubbleList]);

  const scrollToBottom = useCallback(() => {
    if (!chatRef.current) return;
    const { scrollHeight, clientHeight, scrollTop } = chatRef.current;

    if (scrollHeight - scrollTop - clientHeight > 20) {
      setTimeout(() => {
        chatRef.current?.scrollTo({
          top: chatRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 200);
    }
  }, []);

  useEffect(() => {
    if (msgList.length) {
      // 更新最后一个AI回复气泡
      setBubbleList((bl) => {
        const lastIndex = bl.length - 1;
        if (lastIndex >= 0 && bl[lastIndex].type === "replay") {
          const newList = [...bl];
          newList[lastIndex] = {
            type: "replay",
            msg: { sendOver, msg: msgList },
          };

          // 有消息更新时，确保不会干扰当前播放状态
          // // 如果当前没有播放中的消息，且有正在播放的音频，强制停止
          // if (playingMessageIndex === -1 && isAudioPlaying) {
          //   console.log(
          //     "检测到状态不一致：没有选中消息但有音频在播放，强制停止"
          //   );
          //   setIsAudioPlaying(false);
          // }

          scrollToBottom();
          return newList;
        }
        return bl;
      });
    }
  }, [msgList, sendOver, scrollToBottom, isAudioPlaying]);

  /**
   * 提交消息处理函数
   * @param value 用户输入的消息
   */
  const onSubmit = (value: string) => {
    try {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        alert("请先输入搜索信息");
        setIsClearModalOpen(true);
        return;
      } // 防止发送空消息

      console.log("准备发送消息:", trimmedValue);
      setMessage("");
      setIsSending(true);
      // 创建新的气泡列表
      const newBubbles: BubbleType[] = [
        ...bubbleList,
        { type: "ask", msg: trimmedValue },
        // 添加一个空的AI回复气泡，用于显示加载状态
        { type: "replay", msg: { sendOver: true, msg: [] } },
      ];

      setBubbleList(newBubbles);

      // 发送消息到服务器
      sendMessage(
        {
          query: trimmedValue,
          conversation_id: conversationId,
        },
        {
          error: () => {
            console.error("发送消息失败");
            setIsSending(false);
            setBubbleList((bl) => {
              const newList = [...bl];
              newList[newList.length - 1] = {
                type: "replay",
                msg: {
                  sendOver: true,
                  msg: [
                    {
                      type: "normal",
                      content: "出错了，请稍后再试",
                      tool: {
                        toolContent: "",
                        result: "",
                        name: "",
                        toolLoading: false,
                        toolId: "",
                      },
                    },
                  ],
                },
              };
              return newList;
            });
          },
          close: () => {
            console.log("消息发送完成，关闭连接");
            setIsSending(false);
            setSendOver(true);
          },
        }
      );
    } catch (error) {
      console.error("消息提交过程中出错:", error);
      setIsSending(false);
    }
  };

  /**
   * 输入框变化处理函数
   * @param value 输入的值
   */
  const onChange = (value: string) => {
    setMessage(value);
  };

  /**
   * 取消发送消息
   */
  const onCancel = () => {
    console.log("取消发送消息");
    cancelMessage();
    setIsSending(false);
  };

  /**
   * 清空聊天记录
   */
  const clearChatHistory = () => {
    setBubbleList([]);
    localStorage.removeItem("chatHistory");
    setConversationId("");
    setIsSending(false);
    setSendOver(false);
    // 停止所有播放
    setIsAudioPlaying(false);
    setIsDeleteModalOpen(false);
  };

  const askAvatar: React.CSSProperties = {
    color: "#f56a00",
    backgroundColor: "#fde3cf",
  };

  const replayAvatar: React.CSSProperties = {
    color: "#fff",
    backgroundColor: "#87d068",
  };

  // 视频启动播放
  const handleAudioPlayStatusChange = (isPlaying: boolean) => {
    setIsAudioPlaying(isPlaying);
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <Flex justify="space-between" className="chat-container">
      <Flex gap="0" vertical justify="space-between" className="chat-wrap">
        <Flex vertical>
          {bubbleList.length === 0 && (
            <div className="chat-welcome">
              {tipStr || (
                <Flex
                  vertical
                  gap="small"
                  align="start"
                  className="chat-welcome-content"
                >
                  <div className="chat-welcome-title">你好，我是您的AI助手</div>
                  <span className="chat-welcome-subtitle">
                    如果还没想好，您可以试着问我:
                  </span>
                </Flex>
              )}
              <Flex vertical gap="small" align="start" className="chat-tips">
                {tips?.map((tip, index) => (
                  <span
                    key={index}
                    className="chat-tip"
                    onClick={() => onSubmit(tip)}
                  >
                    {tip}
                  </span>
                ))}
              </Flex>
            </div>
          )}
        </Flex>
        <Flex vertical gap="middle" className="chat-list" ref={chatRef}>
          {bubbleList.map(({ type, msg }, index) => (
            <div key={index} className={`chat-bubble-item`}>
              <Bubble
                className={`chat-bubule ${type === "ask" ? "ask" : "replay"}`}
                placement={type === "ask" ? "end" : "start"}
                content={type === "ask" ? msg : JSON.stringify(msg)}
                messageRender={
                  type === "replay" ? RenderBubbleContent : (c) => c
                }
                avatar={
                  showAvatar
                    ? {
                        icon: <UserOutlined />,
                        style: type === "ask" ? askAvatar : replayAvatar,
                      }
                    : undefined
                }
                styles={{
                  content: { maxWidth: "80%" },
                }}
                loading={type === "replay" && !msg.msg?.length}
              />
              {(type === "replay" && msg.msg?.length && msg.sendOver && (
                <Flex align="center" gap="small" className="chat-bubble-footer">
                  <VoicePlayer
                    text={(msg as ReplayMessage).msg
                      .filter((item) => item.type === "normal")
                      .map((item) => item.content)
                      .join(" ")}
                    onError={(error) => console.error("播放错误:", error)}
                    onPlayStatusChange={handleAudioPlayStatusChange}
                  />
                  <LikeOutlined style={{ color: "#fff", cursor: "pointer" }} />
                  <DislikeOutlined
                    style={{ color: "#fff", cursor: "pointer" }}
                  />
                </Flex>
              )) ||
                ""}
            </div>
          ))}
        </Flex>

        <Flex justify="space-between" className="chat-sender-wrap">
          {bubbleList.length > 0 && (
            <div className="chat-actions" onClick={handleDelete}>
              <img src={clearChat} alt="clearChat" />
            </div>
          )}
          <Sender
            className="chat-sender"
            placeholder="请输入你的问题"
            loading={isSending && !sendOver}
            disabled={isSending && !sendOver}
            value={message}
            onChange={onChange}
            onSubmit={onSubmit}
            onCancel={onCancel}
            actions={(_, info) => {
              const { SendButton, LoadingButton } = info.components;

              if (isSending && !sendOver) {
                return <LoadingButton type="default" disabled />;
              }
              return (
                <SendButton
                  onClick={() => {
                    if (!message) {
                      setIsClearModalOpen(true);
                      return;
                    }
                  }}
                  style={{
                    background:
                      "linear-gradient(270deg, #43CDFF 0%, #03FCE3 100%)",
                    fontWeight: 600,
                    padding: "3px 15px",
                    height: "auto",
                    color: "#000",
                  }}
                  icon={<SendOutlined />}
                  shape="default"
                  iconPosition="end"
                >
                  发送
                </SendButton>
              );
            }}
          />
        </Flex>
      </Flex>

      {/* 右侧数字人区域 */}
      <div className="digital-human-container">
        <DigitalHuman
          ref={videoRef}
          videoSrc={broadcaster}
          width="100%"
          height="100%"
          loop={true}
          muted={true}
          play={isAudioPlaying}
        />
      </div>

      <Confirm
        centered
        open={isDeleteModalOpen}
        titleText="永久删除对话"
        contentText="删除后，该对话将不可恢复。确认删除吗？"
        onOk={clearChatHistory}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
      <Confirm
        centered
        open={isClearModalOpen}
        titleText="提示"
        contentText="请先输入搜索信息"
        onOk={() => setIsClearModalOpen(false)}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </Flex>
  );
}

export default memo(Chat);
