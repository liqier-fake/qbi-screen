import ComModal, { ComModalProps } from "../ComModal";
import styles from "./index.module.less";
import ComContent from "../ComContent";
export interface DetailModalProps extends ComModalProps {
  formData: Array<{
    key: string;
    label: string;
    value: any;
    type?: "comcontent" | "text" | "render";
    render?: (value: any) => React.ReactNode;
  }>;
}

const DetailModal = ({ formData, ...rest }: DetailModalProps) => {
  return (
    <ComModal {...rest}>
      <div className={styles.detailForm}>
        {formData?.map((item) => (
          <div className={styles.formItem} key={item.key}>
            <div className={styles.formLabel}>
              {item.label ? `${item.label}:` : ""}
            </div>
            <div className={styles.formContent}>
              {(() => {
                if (!item.value) {
                  return "-";
                }

                switch (item.type) {
                  case "comcontent":
                    return <ComContent content={item.value} />;
                  case "render":
                    return item?.render?.(item.value);
                  case "text":
                  default:
                    return <span className={styles.text}>{item.value}</span>;
                }
              })()}
            </div>
          </div>
        ))}
        {rest?.children}
      </div>
    </ComModal>
  );
};

export default DetailModal;
