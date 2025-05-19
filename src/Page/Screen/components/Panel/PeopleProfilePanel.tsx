import React from "react";
import { Flex } from "antd";
import { CardThree } from "../ComCustom";
import PanelItem from "../PanelItem";
import styles from "../../index.module.less";

/**
 * 人群画像面板组件
 * @param {Object} props - 组件属性
 * @param {Object} props.data - 人群画像数据
 * @returns {JSX.Element} 人群画像面板组件
 */
const PeopleProfilePanel: React.FC<{
  data: any;
}> = ({ data }) => {
  return (
    <PanelItem
      title="人群画像"
      render={
        <Flex justify="center" align="center" className={styles.peopleDraw}>
          <CardThree list={data.list} />
        </Flex>
      }
    />
  );
};

export default PeopleProfilePanel;
