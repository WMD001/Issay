# Task 13: 搜索 + 标签筛选

**Files:**
- Modify: `src/app/page.tsx` (集成 SearchBar)
- Modify: `src/app/api/posts/route.ts` (支持 keyword + label 参数)

## 概述

搜索功能已在 Task 8（SearchBar 组件）和 Task 9（首页集成）中基本完成。本任务确保搜索和标签筛选的完整工作。

## Steps

- [ ] **Step 1: 确认 SearchBar 已集成到首页**

检查 `src/app/page.tsx` 中是否正确使用了 `SearchBar` 组件，并通过 URL 参数传递 keyword 和 label。

- [ ] **Step 2: 确认 API 支持搜索参数**

检查 `src/app/api/posts/route.ts` 中是否正确处理了 `keyword` 和 `label` 参数：
- 有 keyword 时调用 `searchPosts()`（GitHub Search API）
- 无 keyword 时调用 `getPosts()`（普通列表）

- [ ] **Step 3: 验证搜索功能**

```bash
npm run dev
```

测试：
1. 在搜索框输入关键词，点击搜索 → 显示匹配结果
2. 选择标签筛选 → 只显示该标签的说说
3. 点击清除 → 恢复全部列表
4. URL 参数正确反映搜索状态（刷新后结果保持）

- [ ] **Step 4: 提交**

```bash
git add src/app/page.tsx src/app/api/posts/
git commit -m "feat: verify search and tag filtering integration"
```
