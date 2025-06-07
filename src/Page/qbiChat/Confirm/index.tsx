import { Modal, ModalProps } from "antd";
import styles from "./index.module.less";
import classNames from "classnames";
interface ConfirmProps extends ModalProps {
  titleText: string;
  contentText: string;
}

function Confirm(props: ConfirmProps) {
  return (
    <Modal
      {...props}
      width={"400px"}
      className={styles.confirm}
      destroyOnClose
      closeIcon={null}
      // 添加防止滚动条闪烁的配置
      getContainer={false} // 渲染到当前容器而不是body，避免影响整个页面
      maskStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "none", // 禁用模糊效果避免重排
      }}
      maskClosable={false} // 防止意外点击关闭
      keyboard={false} // 禁用ESC键关闭
      wrapClassName="confirm-modal-wrap" // 添加自定义类名便于样式控制
      footer={
        <div className={styles.footer}>
          <span
            className={classNames(styles.button, styles.cancel)}
            onClick={props.onCancel}
          >
            取消
          </span>
          <span
            className={classNames(styles.button, styles.ok)}
            onClick={props.onOk}
          >
            确定
          </span>
        </div>
      }
    >
      <div className={styles.content}>
        <span className={styles.title}>{props.titleText}</span>
        <p className={styles.contentText}>{props.contentText}</p>
      </div>
    </Modal>
  );
}

export default Confirm;
