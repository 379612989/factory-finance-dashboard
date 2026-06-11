# 小微工厂经营财务看板系统

面向食品加工厂、鸡精厂、调味品厂等小微企业的经营驾驶舱。系统重点让老板快速看清本月销售、支出、净利润、回款、未收款、产品利润排行和客户欠款风险，同时提供轻量的销售订单、支出、产品、客户管理能力。

## 技术栈

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- shadcn/ui 风格本地组件
- Recharts 图表
- Supabase PostgreSQL
- qrcode.react 二维码
- 腾讯 EdgeOne Pages / Vercel 部署

## 本地启动

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

如果没有配置 Supabase 环境变量，系统会自动使用内置演示数据，方便立即查看 Dashboard 效果。

## 环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

填写：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

注意：`SUPABASE_SERVICE_ROLE_KEY` 只用于 seed 或服务端操作，不能暴露到前端页面。

## Supabase 建表

1. 登录 Supabase，新建项目。
2. 进入 SQL Editor。
3. 复制并执行 `supabase/schema.sql`。
4. 确认生成以下表：
   - `products`
   - `customers`
   - `sales_orders`
   - `expenses`

## 初始化测试数据

配置 `.env.local` 后执行：

```bash
npm run seed
```

seed 数据包括：

- 12 个月经营数据
- 8 个产品
- 15 个客户
- 108 条销售订单
- 96 条支出记录

数据中已模拟：

- 盈利明显月份
- 利润较低月份
- 接近亏损月份
- 鸡精 A 销量最高但利润率不是最高
- 鸡精 B 销量一般但利润率高
- 味精 C 销量高但利润薄
- 部分客户欠款明显偏高
- 原材料支出占比最高
- 某月推广费用明显增加
- 电商渠道销售增长

## 页面功能

### 经营看板

- 年份、月份、产品、客户、渠道筛选
- 本月销售额、销量、总支出、净利润、利润率、回款、未收款、订单数
- 每月销售额与净利润趋势
- 支出分类占比
- 产品利润排行
- 客户欠款排行
- 渠道销售占比
- 月度经营明细表
- 月度明细 CSV 导出
- 手机扫码预览二维码

### 销售订单

- 新增、编辑、删除订单
- 自动计算销售金额、商品成本、毛利润、未收款
- 按月份、客户、产品、渠道筛选
- CSV 导出
- 手机端卡片列表，桌面端完整表格

### 支出管理

- 新增、编辑、删除支出
- 按月份、支出类型筛选
- CSV 导出

### 产品管理

- 维护产品编号、名称、分类、单位、标准售价、单位成本、状态、备注
- 销售订单选择产品时自动带出售价和成本

### 客户管理

- 维护客户编号、名称、类型、地区、联系人、电话、状态、备注
- 首页客户欠款排行基于销售订单自动汇总

## CSV 导出

支持：

- 销售订单导出
- 支出明细导出
- 月度经营明细导出

导出字段均为中文表头。

## 国内推荐部署：腾讯 EdgeOne Pages

Vercel 如果遇到手机号或网络验证问题，可以使用腾讯 EdgeOne Pages。项目保留 Next.js SSR 能力，不需要改成纯静态站。

### 方式一：从 GitHub 导入

1. 先把代码推送到 GitHub。
2. 登录腾讯云 EdgeOne Pages 控制台。
3. 新建 Pages 项目，选择从 Git 仓库导入。
4. 选择本项目仓库 `factory-finance-dashboard`。
5. 框架选择 Next.js。
6. 构建命令填写：

```bash
npm run build
```

7. 输出目录保持平台默认的 Next.js 配置。
8. Node 版本选择 `20.19+` 或 `22.x`。
9. 在环境变量中配置：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`，部署后可填线上域名
   - `SUPABASE_SERVICE_ROLE_KEY`
10. 点击部署。

### 方式二：从 Gitee 导入

如果 GitHub 在国内访问不稳定，可以把同一份代码同步到 Gitee，再在 EdgeOne Pages 中选择 Gitee 仓库导入。构建命令和环境变量保持一致。

## 无自有域名公开预览：GitHub Pages

如果只是让外部用户预览看板功能，又暂时没有自己的域名，可以使用 GitHub Pages。它会发布一个静态演示版，访问地址类似：

```text
https://379612989.github.io/factory-finance-dashboard/
```

说明：

- 不需要购买域名。
- 不需要 Vercel 手机验证。
- 使用内置演示数据。
- 适合给客户看 UI、图表和移动端效果。
- 静态版不连接 Supabase 服务端，不适合正式录入生产数据。

本项目已内置 GitHub Actions 工作流：`.github/workflows/github-pages.yml`。推送到 `main` 后会自动构建并发布。

本地验证静态版：

```bash
npm run build:github-pages
```

首次启用时，在 GitHub 仓库进入：

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

## Vercel 部署，可选

1. 将项目推送到 GitHub、GitLab 或 Bitbucket。
2. 登录 Vercel，选择 New Project。
3. 导入本项目。
4. Framework Preset 选择 Next.js。
5. 在 Environment Variables 中配置：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. 点击 Deploy。
7. 部署完成后，Vercel 会生成线上访问地址，例如：

```text
https://your-project.vercel.app
```

首页二维码会自动使用当前访问域名。本地开发时二维码内容为 `localhost` 地址，部署后二维码内容为 Vercel 线上地址。

## 手机预览二维码

首页右上角会显示“手机扫码预览”二维码。用手机扫码即可打开当前系统访问地址。

手机端页面会自动隐藏大二维码，使用顶部标题和底部 Tab 导航。

## 移动端适配

已针对 375px 手机宽度做自检：

- 首页无整体横向溢出
- 图表使用固定响应式高度
- 指标卡片手机端两列展示
- 筛选区手机端纵向排列
- 表格区域支持横向滚动
- 销售订单手机端使用卡片列表
- 底部 Tab 导航方便点击

## 常见问题

### 首页显示“演示数据”

说明没有配置 Supabase 环境变量，或 Supabase 查询失败。配置 `.env.local` 并执行 `npm run seed` 后重启项目。

### seed 失败

检查：

- `.env.local` 是否存在
- `NEXT_PUBLIC_SUPABASE_URL` 是否正确
- `SUPABASE_SERVICE_ROLE_KEY` 是否使用 service role key
- 是否已先执行 `supabase/schema.sql`

### Vercel 部署后没有数据

先确认 Supabase 已建表并执行 seed。Vercel 环境变量修改后需要重新部署。

### 二维码还是 localhost

本地开发时二维码就是本地地址。部署到 Vercel 后访问线上域名，二维码会自动变为线上地址。

## 开发命令

```bash
npm run dev
npm run build
npm run lint
npm run seed
```
