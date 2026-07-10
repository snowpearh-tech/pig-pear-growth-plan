# 部署说明

这份说明按“从零上线”整理，包含：

- 如何部署到 GitHub
- 如何连接 Cloudflare Pages
- 如何创建 Cloudflare D1
- 如何配置 Secret
- 如何配置 Bindings
- 如何初始化数据库

---

## 1. 准备代码仓库

如果你打算把当前项目单独作为一个仓库：

1. 在 GitHub 创建一个新仓库
2. 把 `pig-pear-growth-plan` 目录内容推上去

如果你打算放在现有仓库里：

1. 保留当前子目录结构
2. 后面在 Cloudflare Pages 里把 Root Directory 指向 `pig-pear-growth-plan`

---

## 2. 上传到 GitHub

常规流程如下：

```bash
git init
git add .
git commit -m "feat: pig pear growth plan"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

如果你已经在现有仓库里，就只需要把新目录提交并推送即可。

---

## 3. 创建 Cloudflare D1

先在项目目录执行：

```bash
wrangler d1 create pig-pear-growth-plan-db
```

执行后你会拿到类似下面的信息：

- `database_name`
- `database_id`

把 `database_id` 填回 [wrangler.toml](/C:/Users/kexin.hong/Documents/杜甫剧评/pig-pear-growth-plan/wrangler.toml)：

```toml
[[d1_databases]]
binding = "DB"
database_name = "pig-pear-growth-plan-db"
database_id = "替换成真实的 database_id"
migrations_dir = "./migrations"
```

---

## 4. 执行数据库 Migration

先创建表结构：

```bash
wrangler d1 execute pig-pear-growth-plan-db --remote --file=./migrations/0001_init.sql
```

这一步会创建：

- `settings`
- `categories`
- `rules`
- `rewards`
- `levels`
- `quotes`
- `transactions`

---

## 5. 初始化默认数据

你有两种做法。

### 做法 A：用后台初始化

推荐：

1. 先完成部署
2. 打开站点后台
3. 使用管理员密码登录
4. 点击“立即初始化”

### 做法 B：直接导入 SQL

如果你希望部署前就写入默认数据：

```bash
wrangler d1 execute pig-pear-growth-plan-db --remote --file=./db/seed.sql
```

`seed.sql` 使用 `INSERT OR IGNORE`，重复执行也不会轻易破坏已有默认记录。

---

## 6. 创建 Cloudflare Pages 项目

在 Cloudflare Dashboard 中：

1. 打开 `Workers & Pages`
2. 点击 `Create application`
3. 选择 `Pages`
4. 选择 `Connect to Git`
5. 选择你的 GitHub 仓库

### 构建配置

如果这个项目是仓库根目录：

- Build command: `npm run build`
- Build output directory: `dist`

如果这个项目是仓库里的子目录：

- Root directory: `pig-pear-growth-plan`
- Build command: `npm run build`
- Build output directory: `dist`

---

## 7. 配置 D1 Binding

在 Pages 项目里打开：

`Settings` -> `Functions` -> `D1 bindings`

添加一条绑定：

- Variable name: `DB`
- D1 database: `pig-pear-growth-plan-db`

这一步非常重要。  
项目中的 Functions 会通过 `env.DB` 访问数据库。

---

## 8. 配置 Secrets

在 Pages 项目里打开：

`Settings` -> `Environment variables`

添加以下变量：

### 必填 Secret

- `ADMIN_PASSWORD`
- `SESSION_SECRET`

建议：

- `ADMIN_PASSWORD`: 你准备给梨梨使用的后台密码
- `SESSION_SECRET`: 至少 32 位的随机字符串

例如：

```text
ADMIN_PASSWORD=your-strong-password
SESSION_SECRET=your-long-random-secret-value
```

### 可选变量

- `APP_TIMEZONE`

推荐值：

```text
APP_TIMEZONE=Asia/Shanghai
```

---

## 9. 放置猪猪图片

把你的图片放到：

```text
public/pig.jpg
```

如果部署时暂时没有放这张图，应用会自动使用内置占位图，不会影响上线。

---

## 10. 首次上线后的检查顺序

部署成功后，按这个顺序检查：

1. 打开首页
2. 确认页面能正常加载
3. 打开 `/admin`
4. 用管理员密码登录
5. 如果还没初始化，点击“立即初始化”
6. 回到首页确认：
   - 标题正常
   - 今日一句正常
   - 规则正常显示
   - 奖励正常显示
   - 等级和进度条正常显示

---

## 11. 后续更新流程

以后更新内容有两种方式：

### 内容更新

直接在后台操作：

- 改规则
- 改奖励
- 改等级
- 改分类
- 改今日一句
- 改系统设置

这种不需要改代码。

### 程序更新

如果是功能、样式、逻辑升级：

1. 本地修改代码
2. 推送到 GitHub
3. Cloudflare Pages 自动重新构建和部署

---

## 12. 常见问题

### 页面能打开，但数据加载失败

重点检查：

- D1 migration 是否执行过
- Pages 项目里是否绑定了 `DB`
- `ADMIN_PASSWORD` 和 `SESSION_SECRET` 是否已配置

### 首页提示数据库未准备好

说明 D1 表结构还没创建，重新执行：

```bash
wrangler d1 execute pig-pear-growth-plan-db --remote --file=./migrations/0001_init.sql
```

### 后台登录成功，但还是没有内容

说明表结构已经有了，但默认数据还没写入：

- 去后台点击初始化

或者执行：

```bash
wrangler d1 execute pig-pear-growth-plan-db --remote --file=./db/seed.sql
```

### 本机运行 `npm run build` 报 `spawn EPERM`

这通常是本地 Windows 环境对子进程或工具链执行权限的限制。  
项目本身已经通过 `typecheck` 和 `lint`，建议：

1. 在常规本地终端重新执行
2. 或直接交给 Cloudflare Pages 构建环境验证

---

## 13. 推荐上线顺序

最稳妥的顺序是：

1. 上传 GitHub
2. 创建 D1
3. 写入 `database_id`
4. 执行 migration
5. 创建 Pages 项目
6. 配置 `DB` binding
7. 配置 `ADMIN_PASSWORD` 和 `SESSION_SECRET`
8. 部署
9. 登录后台初始化
10. 上传 `public/pig.jpg` 后再次部署或直接一起提交
