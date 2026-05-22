# Dropbox - 极简图片上传

苹果风格极简图片上传网站。Next.js 15 + Express + Sharp + Framer Motion。

## 项目结构

```
image-upload-site/
├── client/                  # Next.js 15 前端
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css  # 全局样式 + 毛玻璃 + 暗色模式
│   │   │   ├── layout.tsx   # 根布局 + 元数据
│   │   │   └── page.tsx     # 首页
│   │   ├── components/
│   │   │   ├── ThemeProvider.tsx  # 主题上下文
│   │   │   ├── ThemeToggle.tsx    # 深色模式切换
│   │   │   ├── Navbar.tsx         # 导航栏
│   │   │   ├── Hero.tsx           # 首屏区域
│   │   │   ├── UploadZone.tsx     # 上传核心组件
│   │   │   ├── ProgressBar.tsx    # 进度条
│   │   │   ├── Features.tsx       # 功能介绍
│   │   │   ├── UploadHistory.tsx  # 上传历史
│   │   │   └── Footer.tsx         # 页脚
│   │   └── lib/
│   │       └── utils.ts          # 工具函数
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── postcss.config.mjs
├── server/                  # Express.js 后端
│   ├── src/
│   │   └── index.ts         # API 服务入口
│   ├── package.json
│   └── tsconfig.json
├── uploads/                 # 上传文件存储
│   ├── originals/
│   └── thumbnails/
├── .env                     # 环境变量
├── .env.example
├── .gitignore
├── package.json             # 根 monorepo 脚本
└── README.md
```

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Next.js 15 (App Router) |
| UI 库 | React 19 |
| 样式 | Tailwind CSS 3 |
| 动画 | Framer Motion 11 |
| 拖拽上传 | react-dropzone |
| 图标 | lucide-react |
| 后端框架 | Express.js 4 |
| 文件上传 | Multer |
| 图片处理 | Sharp |
| 类型 | TypeScript 5 |

## 功能

- 拖拽 + 点击上传，支持多选（最多20张）
- 支持 JPG / PNG / WebP / HEIC
- 自动压缩大图并生成缩略图
- 毛玻璃 UI + 深色模式
- 上传进度条 + 成功动画
- 上传历史记录 + 一键复制链接
- 移动端优先响应式设计

## Windows 本地开发

### 1. 安装 Node.js

下载安装 Node.js 20 LTS: https://nodejs.org

验证安装：
```bash
node -v   # 应显示 v20.x.x
npm -v    # 应显示 10.x.x
```

### 2. 安装依赖

```bash
cd E:\照片apk\image-upload-site
npm install
npm run install:all
```

### 3. 配置环境变量

已自动生成 .env，如需修改端口或跨域设置，编辑根目录 `.env`

### 4. 启动开发服务器

```bash
# 同时启动前后端（推荐）
npm run dev

# 或分别启动
npm run dev:server   # 后端 http://localhost:4000
npm run dev:client   # 前端 http://localhost:3000
```

### 5. 访问

浏览器打开 http://localhost:3000

## VSCode 推荐插件

| 插件 | 用途 |
|---|---|
| Tailwind CSS IntelliSense | Tailwind 类名补全 |
| ES7+ React/Redux/React-Native snippets | React 代码片段 |
| Prettier - Code formatter | 代码格式化 |
| ESLint | 代码检查 |
| Thunder Client | API 调试（替代 Postman） |
| Error Lens | 行内显示错误 |
| Pretty TypeScript Errors | TypeScript 错误可读化 |

## 部署

### 前端 → Vercel

1. 注册 https://vercel.com
2. 点击 "New Project" → 导入 Git 仓库
3. **Root Directory** 设置为 `client`
4. **Framework Preset** 选择 `Next.js`
5. 添加环境变量：
   ```
   NEXT_PUBLIC_API_URL = https://你的后端域名
   ```
6. 点击 Deploy
7. 获得域名：`https://你的项目名.vercel.app`

### 后端 → Railway

1. 注册 https://railway.app
2. 点击 "New Project" → "Deploy from GitHub repo"
3. **Root Directory** 设置为 `server`
4. **Start Command** 设置为 `npm start`
5. **Build Command** 设置为 `npm run build`
6. 添加环境变量：
   ```
   PORT=4000
   NODE_ENV=production
   CORS_ORIGIN=https://你的前端域名.vercel.app
   MAX_FILE_SIZE=20971520
   UPLOAD_DIR=../uploads
   ```
7. 点击 Deploy
8. 获得域名：`https://你的项目名.up.railway.app`
9. **重要**：Railway 文件系统短暂存储，生产环境建议挂载 Volume 或用 S3。

### 后端 → Render（备选）

1. 注册 https://render.com
2. 点击 "New Web Service"
3. 连接 Git 仓库
4. **Root Directory**: `server`
5. **Build Command**: `npm install && npm run build`
6. **Start Command**: `npm start`
7. 添加环境变量（同上）
8. 可在 Render Dashboard → Disk 添加持久化磁盘挂载到 `/app/uploads`

### 前后端联通

部署完成后：
1. 获取后端域名（Railway/Render 提供）
2. 在 Vercel 环境变量中设置 `NEXT_PUBLIC_API_URL` 为后端域名
3. 在 Railway/Render 环境变量中设置 `CORS_ORIGIN` 为前端域名
4. 重新部署（Vercel 修改环境变量后需 Redeploy）

### 自定义域名

**Vercel：**
1. Vercel Dashboard → Settings → Domains
2. 添加域名，设置 DNS A 记录指向 `76.76.21.21`
3. 或 CNAME 指向 `cname.vercel-dns.com`

**Railway：**
1. Railway Dashboard → Settings → Custom Domain
2. 添加域名，设置 CNAME 指向 Railway 提供的域名

## API 文档

### POST /upload

**Request:** `multipart/form-data`
- `images`: 图片文件（可多个），最大 20MB/个

**Response:**
```json
{
  "success": true,
  "message": "成功上传 1 个文件",
  "file": {
    "originalName": "photo.jpg",
    "fileName": "uuid.jpg",
    "size": 2048576,
    "url": "https://.../uploads/originals/uuid.jpg",
    "thumbnailUrl": "https://.../uploads/thumbnails/uuid.jpg"
  },
  "files": [...]
}
```

### GET /health

返回服务状态。

## 常见问题

| 问题 | 解决 |
|---|---|
| `npm install` 失败 | 删除 node_modules 和 package-lock.json 后重试 |
| 端口被占用 | 修改 .env 中 PORT 值 |
| CORS 报错 | 检查 CORS_ORIGIN 是否正确设置 |
| 上传失败 | 确认文件 < 20MB，格式为 jpg/png/webp/heic |
| Sharp 安装失败 | `npm rebuild sharp` 或设置 `npm config set sharp_binary_host` |
| Vercel 504 超时 | 免费版超时 10s，大文件用 Railway/Render |
| Railway 文件丢失 | 免费版无持久化存储，需绑定 Volume |

## 生产环境升级建议

1. **对象存储**：将 uploads 迁移到 AWS S3 / Cloudflare R2 / 阿里云 OSS
2. **CDN**：图片 URL 通过 CDN 分发
3. **认证**：添加 API Key 或 JWT 鉴权
4. **限流**：使用 express-rate-limit 防止滥用
5. **数据库**：上传记录存入 PostgreSQL / MongoDB
6. **压缩策略**：支持 WebP / AVIF 格式转换
7. **队列**：大文件异步处理用 BullMQ
