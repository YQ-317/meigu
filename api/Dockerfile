# 使用官方 PHP 镜像
FROM php:8.2-cli

# 复制项目代码到容器内
COPY . /app

# 设置工作目录
WORKDIR /app

# 安装所需扩展、Composer等（如有）
RUN docker-php-ext-install mysqli pdo pdo_mysql

# 启动内置服务器
CMD ["php", "-S", "0.0.0.0:10000"]
