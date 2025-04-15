import { CopyOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import copy from "copy-to-clipboard";
import { CSSProperties } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  code: string;
  language: string;
  customStyle?: CSSProperties;
  light?: { [key: string]: CSSProperties };
  dark?: { [key: string]: CSSProperties };
}

export function CodePreview({ code, language, customStyle }: Props) {
  return (
    <div>
      <Button
        type="text"
        icon={<CopyOutlined />}
        onClick={() => {
          const success = copy(code);
          message[success ? "success" : "error"](
            success ? "复制成功" : "复制失败"
          );
        }}
      />
      <SyntaxHighlighter
        customStyle={customStyle}
        language={language}
        style={oneDark}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
