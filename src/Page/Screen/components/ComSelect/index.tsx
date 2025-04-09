import classNames from "classnames";
import styles from "./index.module.less";
import { memo } from "react";

interface ComSelectProps {
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  value: string;
  className?: string;
}

const ComSelect = ({ options, onChange, value, className }: ComSelectProps) => {
  return (
    <div className={classNames(styles.comSelect, className)}>
      {options.map((o) => {
        return (
          <div
            key={o.value}
            className={classNames(styles.option, {
              [styles.active]: o.value === value,
            })}
            onClick={() => {
              onChange(o.value);
            }}
          >
            <span className={styles.label}>{o.label}</span>
            <span className={styles.arrow}></span>
          </div>
        );
      })}
    </div>
  );
};

export default memo(ComSelect);
