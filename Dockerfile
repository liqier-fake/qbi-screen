# 构建阶段
FROM node:20-alpine as build

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产环境阶段
FROM nginx:stable-alpine as production

# 从构建阶段复制构建好的文件到nginx服务目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制nginx配置文件
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"] 