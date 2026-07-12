# 猪梨成长计划 ❤️

一个可直接部署到 Cloudflare Pages 的情侣成长积分 Web App。
它不是 Demo，也不是示例片段，而是一套包含前端、Cloudflare Functions、D1 数据结构、管理员鉴权和后台内容管理的完整项目。

## 项目定位

- 梨梨给猪猪记录成长积分
- 支持加分、扣分、兑换奖励
- 积分和成长值分离
- 只有梨梨可以登录管理
- 猪猪和梨梨都可以共同查看前台内容
- 所有文案、规则、奖励、等级、分类、今日一句都能在后台直接修改

## 技术栈

- Frontend: React 19, Vite, TypeScript, TailwindCSS, shadcn/ui 风格组件, Framer Motion
- Backend: Cloudflare Pages Functions
- Database: Cloudflare D1
- Auth: Cloudflare Secret + HttpOnly Cookie Session
- Deployment: GitHub + Cloudflare Pages

## 目录结构

```text
pig-pear-growth-plan/
├─ db/
│  ├─ schema.sql
│  └─ seed.sql
├─ functions/
│  ├─ _lib/
│  │  ├─ auth.ts
│  │  ├─ defaults.ts
│  │  ├─ http.ts
│  │  ├─ repository.ts
│  │  └─ types.ts
│  └─ api/
│     └─ [[route]].ts
├─ migrations/
│  └─ 0001_init.sql
├─ public/
│  ├─ favicon.svg
│  └─ pig-placeholder.svg
├─ shared/
│  ├─ constants.ts
│  └─ contracts.ts
├─ src/
│  ├─ components/
│  │  ├─ admin/
│  │  ├─ home/
│  │  └─ ui/
│  ├─ hooks/
│  ├─ lib/
│  ├─ pages/
│  ├─ App.tsx
│  ├─ index.css
│  ├─ main.tsx
│  └─ vite-env.d.ts
├─ .dev.vars.example
├─ .gitignore
├─ components.json
├─ DEPLOY.md
├─ eslint.config.js
├─ index.html
├─ package.json
├─ postcss.config.js
├─ README.md
├─ tailwind.config.ts
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
└─ wrangler.toml
```

## 核心功能

- 首页总览
  - 当前积分
  - 成长值
  - 当前等级
  - 成长进度条
  - 今日一句
  - 最近记录时间轴
  - 奖励中心
  - 加分规则 / 扣分规则
- 管理后台
  - 规则管理
  - 奖励管理
  - 等级管理
  - 今日一句管理
  - 分类管理
  - 系统设置
- 鉴权
  - 无注册
  - 无用户名
  - 仅管理员密码
  - Cookie Session

## 数据模型

- `settings`: 站点标题、副标题、称呼、首页文案、时区
- `categories`: 规则分类
- `rules`: 加分/扣分规则
- `rewards`: 奖励配置
- `levels`: 成长等级配置
- `quotes`: 今日一句
- `transactions`: 所有积分变动与奖励兑换记录

## API

已实现的 API 包括：

- `GET /api/state`
- `POST /api/login`
- `DELETE /api/login`
- `POST /api/init`
- `POST /api/transactions`
- `POST /api/redeem`
- `GET /api/history`
- `POST /api/rules`
- `PUT /api/rules/:id`
- `DELETE /api/rules/:id`
- `POST /api/rewards`
- `PUT /api/rewards/:id`
- `DELETE /api/rewards/:id`
- `POST /api/quotes`
- `PUT /api/quotes/:id`
- `DELETE /api/quotes/:id`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `POST /api/levels`
- `PUT /api/levels/:id`
- `DELETE /api/levels/:id`
- `PUT /api/settings`

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置本地变量

复制 `.dev.vars.example` 为 `.dev.vars`，填入：

```env
ADMIN_PASSWORD=你的管理员密码
SESSION_SECRET=一串足够长的随机密钥
APP_TIMEZONE=Asia/Shanghai
```

### 3. 放入猪猪图片

把你的图片放到：

```text
public/pig.jpg
```

如果你暂时还没放图，前端会自动退回到内置的 `pig-placeholder.svg`，不会出现坏图。

### 4. 启动前端

```bash
npm run dev
```

### 5. 本地类型检查和质量检查

```bash
npm run typecheck
npm run lint
```

## D1 初始化方式

你有两种方式：

### 方式 A：后台一键初始化

1. 先执行 D1 migration
2. 部署应用
3. 用管理员密码登录后台
4. 点击“初始化”

### 方式 B：直接执行 SQL

```bash
wrangler d1 execute pig-pear-growth-plan-db --remote --file=./migrations/0001_init.sql
wrangler d1 execute pig-pear-growth-plan-db --remote --file=./db/seed.sql
```

## 设计说明

- UI 采用奶油白、浅粉、柔和果色系
- 视觉方向偏 Apple + 小红书 + 手账感
- 支持手机、平板、桌面端
- 首页和卡片交互动效使用 Framer Motion
- 奖励和进度采用“长期陪伴型”反馈，不做后台系统化冷感设计

## 验证情况

- `npm run typecheck` 已通过
- `npm run lint` 已通过
- 本机当前会话下的 Vite 生产构建受 Windows 环境对子进程的限制，出现 `spawn EPERM`

- redeploy refresh 2026-07-12

这类错误更像当前运行环境限制，而不是项目代码语法错误。正常的本地终端或 Cloudflare Pages 构建环境应继续用 `npm run build` 验证。

## 下一步

部署步骤请直接看 [DEPLOY.md](./DEPLOY.md)。
