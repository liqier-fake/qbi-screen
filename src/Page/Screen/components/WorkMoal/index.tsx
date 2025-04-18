import { Flex, Modal, ModalProps, Table, Typography } from "antd";

import styles from "./index.module.less";
import { worckColumns } from "../../columns";
import { useEffect, useRef, useState } from "react";
import markdownit from "markdown-it";
import close from "./close.png";

interface WorkModalProps extends ModalProps {
  textTitle: string;
  workAiComment: string;
  workDetail: any[];
}

const WorkModal = ({
  workAiComment,
  workDetail = [],
  textTitle,
  ...rest
}: WorkModalProps) => {
  // 直接在组件中实现自动滚动逻辑
  const [userScrolled, setUserScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // 初始化 markdown-it
  const md = markdownit({
    html: true, // 允许 HTML 标签
    breaks: true, // 转换换行符为 <br>
    linkify: true, // 自动转换 URL 为链接
  });
  // 处理滚动事件
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    // 如果用户向上滚动（不在底部），则标记为用户已滚动
    if (scrollHeight - scrollTop - clientHeight > 20) {
      setUserScrolled(true);
    } else {
      // 如果滚动到底部，重置用户滚动状态
      setUserScrolled(false);
    }
  };
  // 滚动到底部
  const scrollToBottom = () => {
    if (scrollContainerRef.current && !userScrolled) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };
  // 内容变化时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [workAiComment]);

  // 当模态框打开时重置
  useEffect(() => {
    if (rest.open) {
      setUserScrolled(false);
    }
  }, [rest.open]);

  return (
    <Modal
      {...rest}
      destroyOnClose
      width={"60%"}
      centered
      footer={null}
      className={styles.workModal}
      closeIcon={null}
    >
      <div className={styles.workModalContent}>
        <h2 className={styles.workModalTitle}>{textTitle}</h2>

        <div className={styles.divider}>AI总结</div>
        <Flex
          className={styles.workMsg}
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <Typography style={{ width: "100%", height: "100%" }}>
            <div
              dangerouslySetInnerHTML={{ __html: md.render(workAiComment) }}
            />
          </Typography>
        </Flex>

        <div className={styles.divider}>工单详情</div>
        <Table
          dataSource={workDetail || []}
          columns={worckColumns}
          loading={rest.loading}
          pagination={false}
          scroll={{ y: 249 }}
        />
        <div
          className={styles.closeIcon}
          onClick={(e) => {
            rest?.onCancel?.(
              e as unknown as React.MouseEvent<HTMLButtonElement>
            );
          }}
        >
          <img src={close} alt="关闭" />
        </div>
      </div>
    </Modal>
  );
};

export default WorkModal;
