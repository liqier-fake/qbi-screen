import React, { memo } from "react";
import { CardOne } from "../ComCustom";
import PanelItem from "../PanelItem";

/**
 * 数据来源面板组件
 * @param {Object} props - 组件属性
 * @param {Object} props.data - 数据来源数据
 * @returns {JSX.Element} 数据来源面板组件
 */
const DataSourcePanel: React.FC<{
  data: any;
}> = ({ data }) => {
  return (
    <PanelItem
      title="数据来源"
      render={<CardOne list={data.list} total={data.total} />}
    />
  );
};

export default memo(DataSourcePanel);
