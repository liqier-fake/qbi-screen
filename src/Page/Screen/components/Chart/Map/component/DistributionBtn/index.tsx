import { useState } from "react";
import styles from "./index.module.less";
import classNames from "classnames";
import { MapSelectTypeEnum } from "../../type";

interface DistributionBtnProps {
  current?: number | string;
  options?: {
    key: string;
    name: string;
  }[];
  onSelect: (type: string) => void;
  className?: string;
}

const DistributionBtnList = ({
  className,
  current,
  options = [
    {
      key: MapSelectTypeEnum.dayDistribution,
      name: MapSelectTypeEnum.dayDistribution,
    },
    {
      key: MapSelectTypeEnum.nightDistribution,
      name: MapSelectTypeEnum.nightDistribution,
    },
    {
      key: MapSelectTypeEnum.liveDistribution,
      name: MapSelectTypeEnum.liveDistribution,
    },
    {
      key: MapSelectTypeEnum.workDistribution,
      name: MapSelectTypeEnum.workDistribution,
    },
  ],
  onSelect,
}: DistributionBtnProps) => {
  const [selected, setSelected] = useState<string | number>(current || "");

  const handleSelect = (key: string) => {
    if (selected === key) {
      setSelected(current || "");
      onSelect("");
      return;
    }
    setSelected(key);
    onSelect(key);
  };

  const getBtnActive = (key: string) => {
    if (selected === key) {
      return styles.active;
    }
    return "";
  };

  return (
    <div className={classNames(styles.distributionBtnList, className)}>
      {options.map((item) => {
        return (
          <div
            key={item.key}
            className={classNames(
              styles.distributionBtn,
              getBtnActive(item.key)
            )}
            onClick={() => handleSelect(item.key)}
          >
            {item.name}
          </div>
        );
      })}
    </div>
  );
};

export default DistributionBtnList;
