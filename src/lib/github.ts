// src/lib/github.ts

import { Post, Comment, Reactions, PaginatedResponse } from '@/types';
import { extractSummary, hasLabel } from './utils';

const GITHUB_API = 'https://api.github.com';

/** 服务端 GitHub Token（仅 API Routes 使用，不暴露给客户端） */
function getServerToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  return token;
}

function getRepo(): string {
  const repo = process.env.GITHUB_REPO;
  if (!repo) throw new Error('GITHUB_REPO is not set');
  return repo;
}

/** 通用 GitHub API 请求 */
async function githubFetch(
  endpoint: string,
  options: RequestInit = {},
  token?: string
) {
  const authToken = token || getServerToken();
  const res = await fetch(`${GITHUB_API}${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${authToken}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`GitHub API error: ${res.status} - ${error.message || 'Unknown'}`);
  }

  return res;
}

/** 将 GitHub Issue 转换为 Post */
function issueToPost(issue: any): Post {
  const labels: string[] = issue.labels.map((l: any) => l.name);
  return {
    id: issue.number,
    title: issue.title || '',
    body: issue.body || '',
    summary: issue.title || extractSummary(issue.body || ''),
    labels,
    isDraft: hasLabel(labels, 'draft'),
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    author: {
      login: issue.user.login,
      avatarUrl: issue.user.avatar_url,
    },
    commentCount: issue.comments,
    reactions: issue.reactions || {
      total_count: 0, '+1': 0, '-1': 0, laugh: 0,
      hooray: 0, confused: 0, heart: 0, rocket: 0, eyes: 0,
    },
  };
}

/** 获取说说列表（分页，排除草稿） */
export async function getPosts(
  page = 1,
  perPage = 10
): Promise<PaginatedResponse<Post>> {
  const repo = getRepo();
  const res = await githubFetch(
    `/repos/${repo}/issues?labels=shuoshuo&state=open&sort=created&direction=desc&per_page=${perPage}&page=${page}`
  );

  const issues = await res.json();
  const linkHeader = res.headers.get('Link') || '';
  const hasNext = linkHeader.includes('rel="next"');

  const posts = issues
    .filter((i: any) => !i.pull_request)
    .filter((i: any) => !hasLabel(i.labels.map((l: any) => l.name), 'draft'))
    .map(issueToPost);

  return {
    data: posts,
    page,
    perPage,
    total: posts.length,
    hasMore: hasNext,
  };
}

/** 获取单条说说 */
export async function getPost(id: number, token?: string): Promise<Post> {
  const repo = getRepo();
  const res = await githubFetch(`/repos/${repo}/issues/${id}`, {}, token);
  const issue = await res.json();
  return issueToPost(issue);
}

/** 创建说说 */
export async function createPost(
  title: string,
  body: string,
  labels: string[],
  token: string
): Promise<Post> {
  const repo = getRepo();
  const res = await githubFetch(
    `/repos/${repo}/issues`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title || body.slice(0, 50), body, labels }),
    },
    token
  );
  const issue = await res.json();
  return issueToPost(issue);
}

/** 更新说说 */
export async function updatePost(
  id: number,
  data: { title?: string; body?: string; labels?: string[] },
  token: string
): Promise<Post> {
  const repo = getRepo();
  const res = await githubFetch(
    `/repos/${repo}/issues/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    token
  );
  const issue = await res.json();
  return issueToPost(issue);
}

/** 关闭说说（软删除） */
export async function closePost(id: number, token: string): Promise<void> {
  const repo = getRepo();
  await githubFetch(
    `/repos/${repo}/issues/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: 'closed' }),
    },
    token
  );
}

/** 获取说说的评论列表 */
export async function getComments(
  issueId: number,
  token?: string
): Promise<Comment[]> {
  const repo = getRepo();
  const res = await githubFetch(
    `/repos/${repo}/issues/${issueId}/comments?per_page=100`,
    {},
    token
  );
  const comments = await res.json();

  return comments.map((c: any) => ({
    id: c.id,
    body: c.body,
    createdAt: c.created_at,
    author: {
      login: c.user.login,
      avatarUrl: c.user.avatar_url,
    },
    reactions: c.reactions || {
      total_count: 0, '+1': 0, '-1': 0, laugh: 0,
      hooray: 0, confused: 0, heart: 0, rocket: 0, eyes: 0,
    },
  }));
}

/** 发表评论 */
export async function createComment(
  issueId: number,
  body: string,
  token: string
): Promise<Comment> {
  const repo = getRepo();
  const res = await githubFetch(
    `/repos/${repo}/issues/${issueId}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    },
    token
  );
  const comment = await res.json();

  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.created_at,
    author: {
      login: comment.user.login,
      avatarUrl: comment.user.avatar_url,
    },
    reactions: comment.reactions || {
      total_count: 0, '+1': 0, '-1': 0, laugh: 0,
      hooray: 0, confused: 0, heart: 0, rocket: 0, eyes: 0,
    },
  };
}

/** 添加表情反应 */
export async function addReaction(
  issueId: number,
  content: string,
  token: string,
  isComment = false
): Promise<void> {
  const repo = getRepo();
  const endpoint = isComment
    ? `/repos/${repo}/issues/comments/${issueId}/reactions`
    : `/repos/${repo}/issues/${issueId}/reactions`;

  await githubFetch(
    endpoint,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    },
    token
  );
}

/** 获取说说的所有标签（用于筛选） */
export async function getLabels(): Promise<string[]> {
  const repo = getRepo();
  const res = await githubFetch(`/repos/${repo}/labels?per_page=100`);
  const labels = await res.json();
  return labels.map((l: any) => l.name);
}

/** 搜索说说（通过 GitHub Search API） */
export async function searchPosts(
  keyword: string,
  label?: string,
  page = 1
): Promise<PaginatedResponse<Post>> {
  const repo = getRepo();
  const labelQuery = label ? ` label:${label}` : ' label:shuoshuo';
  const query = `${keyword}${labelQuery} repo:${repo} is:issue is:open`;

  const res = await githubFetch(
    `/search/issues?q=${encodeURIComponent(query)}&sort=created&order=desc&per_page=10&page=${page}`
  );
  const result = await res.json();

  const posts = result.items
    .filter((i: any) => !i.pull_request)
    .filter((i: any) => !hasLabel(i.labels.map((l: any) => l.name), 'draft'))
    .map(issueToPost);

  return {
    data: posts,
    page,
    perPage: 10,
    total: result.total_count,
    hasMore: result.total_count > page * 10,
  };
}

/** 上传图片到 Issue（作为评论附件） */
export async function uploadImage(
  issueId: number,
  file: Buffer,
  filename: string,
  token: string
): Promise<string> {
  // GitHub 不直接支持通过 API 上传附件
  // 替代方案：创建一个包含 base64 图片的 comment
  // 实际生产中建议使用外部图床
  const base64 = file.toString('base64');
  const ext = filename.split('.').pop()?.toLowerCase() || 'png';
  const mimeMap: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  };
  const mime = mimeMap[ext] || 'image/png';

  // 尝试使用 GitHub Contents API 上传到仓库
  const repo = getRepo();
  const path = `assets/${issueId}/${Date.now()}-${filename}`;

  const res = await githubFetch(
    `/repos/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Upload image: ${filename}`,
        content: base64,
      }),
    },
    token
  );
  const data = await res.json();
  return data.content.download_url;
}
