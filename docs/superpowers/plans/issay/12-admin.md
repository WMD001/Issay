# Task 12: 管理后台页面

**Files:**
- Create: `src/components/AdminGuard.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/new/page.tsx`
- Create: `src/app/admin/edit/[id]/page.tsx`

## 概述

管理后台包含三个页面：说说列表、新建说说、编辑说说。所有页面需要通过 `AdminGuard` 组件保护，仅允许 `GITHUB_OWNER` 用户访问。

## Steps

- [ ] **Step 1: 创建 AdminGuard 组件**

客户端组件，使用 `useSession` 检查登录状态和管理员身份。未登录或非管理员时显示"无权访问"并提供返回首页链接。

- [ ] **Step 2: 创建管理后台首页 (`/admin`)**

功能：
- 调用 `/api/posts?page=1` 获取说说列表（含草稿，需管理员 token）
- 表格展示：标题/摘要、状态（已发布/草稿）、创建时间、操作按钮
- 操作：编辑（跳转 `/admin/edit/[id]`）、删除（调用 DELETE `/api/posts/[id]`）
- 顶部新建按钮跳转 `/admin/new`

注意事项：
- 管理后台需要获取含草稿的列表，需新增一个管理员专用 API 或在现有 API 中增加 `includeDraft=true` 参数
- 删除操作使用 confirm 确认

- [ ] **Step 3: 创建新建说说页面 (`/admin/new`)**

功能：
- 标题输入（可选）
- Markdown 编辑器（左右分栏：左侧编辑、右侧预览）
- 图片上传（点击按钮选择文件，调用 `/api/upload`，返回 markdown 插入编辑器）
- 状态选择：已发布（标签 `shuoshuo`）/ 草稿（标签 `shuoshuo` + `draft`）
- 保存按钮：调用 POST `/api/posts`

- [ ] **Step 4: 创建编辑说说页面 (`/admin/edit/[id]`)**

功能与新建页面相同，区别：
- 加载时调用 GET `/api/posts/[id]` 获取现有内容预填
- 保存按钮调用 PATCH `/api/posts/[id]`
- 状态切换时更新标签（添加/移除 `draft`）

- [ ] **Step 5: 管理员专用 API 调整**

在 `src/app/api/posts/route.ts` 的 GET 中增加 `includeDraft` 参数支持：
- 管理员请求时传 `includeDraft=true`，返回含草稿的完整列表
- 普通请求仍然过滤掉草稿

- [ ] **Step 6: 验证**

```bash
npm run dev
```

以管理员身份登录后访问 `/admin`，测试新建、编辑、删除流程。

- [ ] **Step 7: 提交**

```bash
git add src/components/AdminGuard.tsx src/app/admin/ src/app/api/posts/
git commit -m "feat: add admin pages (list, new, edit) with draft support"
```
