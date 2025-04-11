import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// import postcssPxtorem from "postcss-pxtorem";
import autoprefixer from "autoprefixer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 配置别名
    },
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer(), // 自动添加浏览器前缀
        // postcssPxtorem({
        //   rootValue: 614.4, // 设计稿宽度/10（如设计稿375px，则写37.5）
        //   propList: ["*"], // 转换所有属性的px单位
        //   selectorBlackList: [".chat-wrap"], // 过滤掉.norem开头的class
        // }),
      ],
    },
  },
});
