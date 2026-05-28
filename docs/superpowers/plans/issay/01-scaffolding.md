# Task 1: 项目脚手架 + 依赖安装

**Files:**
- Create: `package.json` (via `create-next-app`)
- Create: `.env.local.example`
- Create: `tailwind.config.ts`
- Create: `next.config.js`

## Steps

- [ ] **Step 1: 初始化 Next.js 项目**

```bash
cd D:/workspace_owner/Issay
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

选择选项：
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Turbopack: No (默认)

- [ ] **Step 2: 安装项目依赖**

```bash
cd D:/workspace_owner/Issay
npm install next-auth@4 react-markdown remark-gfm react-syntax-highlighter next-themes
npm install -D @types/react-syntax-highlighter
```

- [ ] **Step 3: 创建环境变量模板**

```bash
cat > .env.local.example << 'EOF'
# GitHub Personal Access Token (需要 repo 权限)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# GitHub 用户名 (用于判断管理员身份)
GITHUB_OWNER=your-username

# 存放说说的仓库 (owner/repo 格式)
GITHUB_REPO=your-username/your-repo

# NextAuth 密钥 (openssl rand -base64 32 生成)
NEXTAUTH_SECRET=your-secret-here

# GitHub OAuth App
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# NextAuth URL (生产环境为你的域名)
NEXTAUTH_URL=http://localhost:3000
EOF
```

- [ ] **Step 4: 验证项目可启动**

```bash
cd D:/workspace_owner/Issay
npm run dev
# 打开 http://localhost:3000 确认页面正常加载
# Ctrl+C 停止
```

- [ ] **Step 5: 初始化 Git 并提交**

```bash
cd D:/workspace_owner/Issay
git init
echo ".env.local" >> .gitignore
echo ".superpowers/" >> .gitignore
git add .
git commit -m "chore: initialize Next.js project with dependencies"
```
