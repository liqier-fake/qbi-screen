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
      closeIcon={null}
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
