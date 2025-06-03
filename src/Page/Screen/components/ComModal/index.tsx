import { Modal, ModalProps } from "antd";
import styles from "./index.module.less";
import close from "./close.png";
import formulaIcon from "./formula.png";
export interface ComModalProps extends ModalProps {
  showCloseIcon?: boolean;
  height?: string;
}
const ComModal = (props: ComModalProps) => {
  const {
    title,
    children,
    onCancel,
    width = "50%",
    showCloseIcon = false,
    height = "65vh",
    ...rest
  } = props;

  return (
    <Modal
      {...rest}
      destroyOnClose
      centered
      footer={null}
      className={styles.comModal}
      closeIcon={null}
      title={null}
      width={width}
    >
      <div className={styles.comModalContent} style={{ height }}>
        {title && <h2 className={styles.comModalTitle}>{title}</h2>}
        <div className={styles.comModalContentInner}>{children}</div>
        {showCloseIcon && (
          <div className={styles.formulaIcon}>
            <img src={formulaIcon} alt="公式" />
          </div>
        )}
        <div
          className={styles.closeIcon}
          onClick={(e) => {
            onCancel?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
          }}
        >
          <img src={close} alt="关闭" />
        </div>
      </div>
    </Modal>
  );
};

export default ComModal;
