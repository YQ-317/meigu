# 美谷项目部署指南

## 1. 项目结构说明
- 前端静态HTML/JS/CSS（Vercel 静态部署）
- 后端 PHP API 及数据库（Railway 部署）

## 2. 快速开始与部署

### 一、GitHub 初始化
1. `git init`
2. `git add .`
3. `git commit -m "初始化项目"`
4. 在 GitHub 创建仓库，替换仓库地址后推送：
    ```
    git remote add origin https://github.com/你的用户名/你的仓库名.git
    git branch -M main
    git push -u origin main
    ```

### 二、前端部署到 Vercel
1. 登录 Vercel，用 GitHub 账号导入仓库即可。
2. 选择根目录即可部署静态页面。

### 三、后端与数据库部署到 Railway
1. Railway 创建 MySQL（或 PostgreSQL）服务，获取连接参数。
2. Railway 新建 PHP 项目，目录为 `/api`，自动检测部署。
3. 在 Railway 项目 `Environment` 页，分别设置：
   - `DB_HOST`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASS`
4. 部署后，后端 API 域名为 `https://xxx.up.railway.app/api/xxx.php`

### 四、前后端通信
- 前端 JS 里的 API 访问地址需统一指向 Railway API 域名
- 例如：`fetch('https://xxx.up.railway.app/api/your-api.php')`

## 3. 其他说明
- `.gitignore` 已配置忽略常见敏感文件
- PHP 数据库配置见 `api/config.php`
- 如有疑问欢迎联系开发者或在 Issue 区提问

