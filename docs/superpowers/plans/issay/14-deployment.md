# Task 14: 部署配置

**Files:**
- Create: `.env.local` (本地开发，不提交)
- Modify: `.gitignore`
- Create: `README.md` (可选)

## 概述

配置 Vercel 部署所需的环境变量和 GitHub OAuth App。

## Steps

- [ ] **Step 1: 创建 GitHub OAuth App**

1. 打开 GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. 填写：
   - Application name: `Issay`
   - Homepage URL: `https://your-domain.vercel.app`（先填 localhost: `http://localhost:3000`）
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. 记录 Client ID 和 Client Secret

- [ ] **Step 2: 创建 GitHub Personal Access Token**

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. 权限：`repo` (对存放说说的仓库有读写权限)
3. 记录 Token

- [ ] **Step 3: 配置本地环境变量**

复制 `.env.local.example` 为 `.env.local`，填入实际值：
- `GITHUB_TOKEN` - 上一步创建的 Token
- `GITHUB_OWNER` - 你的 GitHub 用户名
- `GITHUB_REPO` - 仓库名（如 `username/repo`）
- `NEXTAUTH_SECRET` - 运行 `openssl rand -base64 32` 生成
- `GITHUB_CLIENT_ID` - OAuth App 的 Client ID
- `GITHUB_CLIENT_SECRET` - OAuth App 的 Client Secret
- `NEXTAUTH_URL` - `http://localhost:3000`

- [ ] **Step 4: 本地验证完整流程**

```bash
npm run dev
```

测试：
1. 首页加载说说列表
2. GitHub 登录成功
3. 管理后台可以新建/编辑/删除说说
4. 详情页显示评论和表情
5. 时间线页面正常
6. 主题切换正常

- [ ] **Step 5: 推送到 GitHub 并部署到 Vercel**

1. 创建 GitHub 仓库，推送代码
2. 在 Vercel 中 Import 该仓库
3. 配置环境变量（与 `.env.local` 相同的值，`NEXTAUTH_URL` 改为生产域名）
4. 更新 GitHub OAuth App 的 Homepage URL 和 Callback URL 为生产域名
5. 部署

- [ ] **Step 6: 验证生产环境**

访问生产域名，重复 Step 4 的测试流程。

- [ ] **Step 7: 最终提交**

```bash
git add .
git commit -m "chore: configure deployment for Vercel"
git push origin main
```
