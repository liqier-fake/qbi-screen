import { Bubble, Sender } from "@ant-design/x";
import { Button, Flex } from "antd";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { DislikeOutlined, LikeOutlined, UserOutlined } from "@ant-design/icons";
import { BubbleType, ChatProps } from "../common";

import "./chat.less";

import RenderBubbleContent from "./RenderBubbleContent";
import useChat from "../useChat";
import VoicePlayer from "../voice";
import DigitalHuman, { DigitalHumanInstance } from "../voice/DigitalHuman";
import broadcaster from "./digital.mp4";

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
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number>(-1);
  // 当前正在播放的消息索引
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number>(-1);
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
    setTimeout(() => {
      chatRef.current?.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }, []);

  // 监听音频播放状态，控制数字人播放
  useEffect(() => {
    if (isAudioPlaying) {
      // 如果有音频在播放，启动数字人
      if (videoRef.current) {
        videoRef.current.playVideo();
        console.log("启动数字人视频");
      }
    } else {
      // 如果没有音频在播放，添加延迟再暂停数字人
      // 这样可以确保数字人的动作完成
      if (videoRef.current) {
        // 延迟暂停，确保动作完整性
        const timer = setTimeout(() => {
          videoRef.current?.pauseVideo();
          console.log("暂停数字人视频");
        }, 800); // 延迟800ms暂停，确保动作完成

        return () => clearTimeout(timer); // 清理定时器
      }
    }
  }, [isAudioPlaying]);

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
          scrollToBottom();
          return newList;
        }
        return bl;
      });
    }
  }, [msgList, sendOver, scrollToBottom]);

  /**
   * 提交消息处理函数
   * @param value 用户输入的消息
   */
  const onSubmit = (value: string) => {
    try {
      const trimmedValue = value.trim();
      if (!trimmedValue) return; // 防止发送空消息

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
    setSelectedMessageIndex(-1);
    // 停止所有播放
    setIsAudioPlaying(false);
  };

  // 处理音频播放状态变化
  const handleAudioPlayStatusChange = (isPlaying: boolean) => {
    console.log("音频播放状态变化:", isPlaying);
    setIsAudioPlaying(isPlaying);

    // 如果开始播放，强制启动数字人视频
    if (isPlaying && videoRef.current) {
      videoRef.current.playVideo();
    }
  };

  // 处理消息播放开始
  const handlePlayStart = (index: number) => {
    setPlayingMessageIndex(index);
    setSelectedMessageIndex(index);

    // 暂停其他正在播放的消息
    if (playingMessageIndex !== -1 && playingMessageIndex !== index) {
      setSelectedMessageIndex(-1);
    }
  };

  // 处理消息播放结束
  const handlePlayEnd = () => {
    setPlayingMessageIndex(-1);
    setSelectedMessageIndex(-1);
  };

  // 处理右侧数字人视频播放开始
  const handleMainVideoPlayStart = () => {
    console.log("右侧数字人视频开始播放");
  };

  // 处理右侧数字人视频播放结束
  const handleMainVideoPlayEnd = () => {
    console.log("右侧数字人视频播放结束");
  };

  // 处理右侧数字人视频错误
  const handleMainVideoError = (error: Error | Event) => {
    console.error("右侧数字人视频错误:", error);
  };

  const askAvatar: React.CSSProperties = {
    color: "#f56a00",
    backgroundColor: "#fde3cf",
  };

  const replayAvatar: React.CSSProperties = {
    color: "#fff",
    backgroundColor: "#87d068",
  };

  return (
    <Flex justify="space-between" className="chat-container">
      <Flex
        gap="0"
        vertical
        justify="space-between"
        className="chat-wrap"
        ref={chatRef}
      >
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

          {bubbleList.length > 0 && (
            <div className="chat-actions">
              <button onClick={clearChatHistory} className="clear-history-btn">
                清空聊天记录
              </button>
            </div>
          )}
        </Flex>
        <Flex vertical gap="middle" className="chat-list">
          {bubbleList.map(({ type, msg }, index) => (
            <div
              key={index}
              className={`chat-bubble-item ${
                selectedMessageIndex === index ? "selected" : ""
              }`}
            >
              <Bubble
                className="chat-bubule"
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
                footer={
                  type === "replay" &&
                  msg.sendOver && (
                    <Flex align="center" gap="small">
                      <VoicePlayer
                        text={(msg as ReplayMessage).msg
                          .filter((item) => item.type === "normal")
                          .map((item) => item.content)
                          .join(" ")}
                        onPlayStart={() => handlePlayStart(index)}
                        onPlayEnd={handlePlayEnd}
                        onError={(error) => console.error("播放错误:", error)}
                        onPlayStatusChange={handleAudioPlayStatusChange}
                      />
                      <Button
                        size="large"
                        type="text"
                        style={{
                          color: "#fff",
                        }}
                        icon={<LikeOutlined />}
                      />
                      <Button
                        size="large"
                        type="text"
                        style={{
                          color: "#fff",
                        }}
                        icon={<DislikeOutlined />}
                      />
                    </Flex>
                  )
                }
              />
            </div>
          ))}
        </Flex>

        <Sender
          className="chat-sender"
          placeholder="询问任何问题"
          loading={isSending && !sendOver}
          disabled={isSending && !sendOver}
          value={message}
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </Flex>

      {/* 右侧数字人区域 */}
      <div className="digital-human-container">
        <DigitalHuman
          ref={videoRef}
          videoSrc={broadcaster}
          width="100%"
          height="100%"
          loop={false}
          muted={true}
          onPlayStart={handleMainVideoPlayStart}
          onPlayEnd={handleMainVideoPlayEnd}
          onError={handleMainVideoError}
          showControls={false}
        />
      </div>
    </Flex>
  );
}

export default memo(Chat);
