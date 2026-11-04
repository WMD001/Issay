// src/lib/github.ts

import { Post, Comment, Reactions, PaginatedResponse } from '@/types';
import { extractSummary, hasLabel } from './utils';

const GITHUB_API = 'https://api.github.com';


export type ReactionContent =
  | '+1'
  | '-1'
  | 'laugh'
  | 'hooray'
  | 'confused'
  | 'heart'
  | 'rocket'
  | 'eyes';

interface GitHubUser {
  login: string;
  avatar_url: string;
}

interface GitHubLabel {
  name: string;
}

interface GitHubReactions {
  total_count?: number;
  '+1'?: number;
  '-1'?: number;
  laugh?: number;
  hooray?: number;
  confused?: number;
  heart?: number;
  rocket?: number;
  eyes?: number;
}

interface GitHubIssue {
  number: number;
  title?: string | null;
  body?: string | null;
  labels?: GitHubLabel[];
  state?: string;
  created_at: string;
  updated_at: string;
  comments?: number;
  user: GitHubUser;
  reactions?: GitHubReactions;
  pull_request?: unknown;
}

interface GitHubComment {
  id: number;
  body?: string | null;
  created_at: string;
  user: GitHubUser;
  reactions?: GitHubReactions;
}

interface GitHubSearchResult {
  total_count: number;
  items: GitHubIssue[];
}

/** 可选的服务端 GitHub Token（仅用于提高匿名读取限额或访问私有仓库） */
function getServerToken(): string | undefined {
  return process.env.GITHUB_TOKEN;
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
): Promise<Response> {
  const authToken = token ?? getServerToken();
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/vnd.github.v3+json');
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const res = await fetch(`${GITHUB_API}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = (await res.json().catch(() => ({}))) as { message?: string };
    console.error('[githubFetch] error:', res.status, error);
    throw new Error(
      `GitHub API error: ${res.status} - ${error.message ?? 'Unknown'}`
    );
  }

  return res;
}

function normalizeReactions(reactions?: GitHubReactions): Reactions {
  return {
    total_count: reactions?.total_count ?? 0,
    '+1': reactions?.['+1'] ?? 0,
    '-1': reactions?.['-1'] ?? 0,
    laugh: reactions?.laugh ?? 0,
    hooray: reactions?.hooray ?? 0,
    confused: reactions?.confused ?? 0,
    heart: reactions?.heart ?? 0,
    rocket: reactions?.rocket ?? 0,
    eyes: reactions?.eyes ?? 0,
  };
}

function normalizeLabels(labels: string[]): string[] {
  return Array.from(
    new Set(labels.map(label => label.trim()).filter(Boolean))
  );
}

/** 将 GitHub Issue 转换为 Post */
function issueToPost(issue: GitHubIssue): Post {
  const labels = (issue.labels ?? []).map(label => label.name);
  return {
    id: issue.number,
    title: issue.title ?? '',
    body: issue.body ?? '',
    summary: extractSummary(issue.body ?? ''),
    labels,
    isDraft: hasLabel(labels, 'draft'),
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    author: {
      login: issue.user.login,
      avatarUrl: issue.user.avatar_url,
    },
    commentCount: issue.comments ?? 0,
    reactions: normalizeReactions(issue.reactions),
  };
}

/** 确保标签存在，不存在时自动创建 */
async function ensureLabels(labels: string[], token?: string): Promise<void> {
  for (const name of labels) {
    try {
      await githubFetch(
        `/repos/${getRepo()}/labels/${encodeURIComponent(name)}`,
        {},
        token
      );
      continue;
    } catch {
      // 标签不存在，尝试创建
    }

    try {
      await githubFetch(
        `/repos/${getRepo()}/labels`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, color: '8b5cf6' }),
        },
        token
      );
    } catch {
      // 标签已存在（422）或创建失败，交给后续请求处理
    }
  }
}

export interface GetPostsOptions {
  page?: number;
  perPage?: number;
  includeDraft?: boolean;
  label?: string;
  draftOnly?: boolean;
  token?: string;
}

/** 获取说说列表（分页，默认排除草稿） */
export async function getPosts(
  options: GetPostsOptions = {}
): Promise<PaginatedResponse<Post>> {
  const {
    page = 1,
    perPage = 10,
    includeDraft = false,
    label,
    draftOnly = false,
    token,
  } = options;

  const safePage = Math.max(1, page);
  const safePerPage = Math.min(100, Math.max(1, perPage));
  const labelNames = ['shuoshuo'];
  if (draftOnly) {
    labelNames.push('draft');
  } else if (label) {
    labelNames.push(label);
  }
  const labelsParam = labelNames.map(name => encodeURIComponent(name)).join(',');

  const res = await githubFetch(
    `/repos/${getRepo()}/issues?labels=${labelsParam}&state=open&sort=created&direction=desc&per_page=${safePerPage}&page=${safePage}`,
    {},
    token
  );

  const issues = (await res.json()) as GitHubIssue[];
  const linkHeader = res.headers.get('Link') ?? '';
  const hasNext = linkHeader.includes('rel="next"');
  const showDraft = includeDraft || draftOnly;

  const posts = issues
    .filter(issue => !issue.pull_request)
    .filter(
      issue => showDraft || !hasLabel((issue.labels ?? []).map(l => l.name), 'draft')
    )
    .map(issueToPost);

  return {
    data: posts,
    page: safePage,
    perPage: safePerPage,
    total: posts.length,
    hasMore: hasNext,
  };
}

/** 获取单条说说 */
export async function getPost(id: number, token?: string): Promise<Post> {
  const res = await githubFetch(`/repos/${getRepo()}/issues/${id}`, {}, token);
  const issue = (await res.json()) as GitHubIssue;
  return issueToPost(issue);
}

/** 创建说说 */
export async function createPost(
  title: string,
  body: string,
  labels: string[] = [],
  token?: string
): Promise<Post> {
  const finalLabels = normalizeLabels(['shuoshuo', ...labels]);
  await ensureLabels(finalLabels, token);

  const fallbackTitle = body.split('\n')[0].trim().slice(0, 50) || '无标题';
  const res = await githubFetch(
    `/repos/${getRepo()}/issues`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim() || fallbackTitle,
        body,
        labels: finalLabels,
      }),
    },
    token
  );

  const issue = (await res.json()) as GitHubIssue;
  return issueToPost(issue);
}

export interface UpdatePostInput {
  title?: string;
  body?: string;
  labels?: string[];
  state?: 'open' | 'closed';
}

/** 更新说说 */
export async function updatePost(
  id: number,
  data: UpdatePostInput,
  token?: string
): Promise<Post> {
  const payload: UpdatePostInput = { ...data };
  if (data.labels) {
    payload.labels = normalizeLabels(['shuoshuo', ...data.labels]);
    await ensureLabels(payload.labels, token);
  }

  const res = await githubFetch(
    `/repos/${getRepo()}/issues/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    token
  );
  const issue = (await res.json()) as GitHubIssue;
  return issueToPost(issue);
}

/** 关闭说说（软删除） */
export async function closePost(id: number, token?: string): Promise<void> {
  await githubFetch(
    `/repos/${getRepo()}/issues/${id}`,
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
  const res = await githubFetch(
    `/repos/${getRepo()}/issues/${issueId}/comments?per_page=100`,
    {},
    token
  );
  const comments = (await res.json()) as GitHubComment[];

  return comments.map(comment => ({
    id: comment.id,
    body: comment.body ?? '',
    createdAt: comment.created_at,
    author: {
      login: comment.user.login,
      avatarUrl: comment.user.avatar_url,
    },
    reactions: normalizeReactions(comment.reactions),
  }));
}

/** 发表评论 */
export async function createComment(
  issueId: number,
  body: string,
  token?: string
): Promise<Comment> {
  const res = await githubFetch(
    `/repos/${getRepo()}/issues/${issueId}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    },
    token
  );
  const comment = (await res.json()) as GitHubComment;

  return {
    id: comment.id,
    body: comment.body ?? '',
    createdAt: comment.created_at,
    author: {
      login: comment.user.login,
      avatarUrl: comment.user.avatar_url,
    },
    reactions: normalizeReactions(comment.reactions),
  };
}

/** 添加表情反应 */
export async function addReaction(
  targetId: number,
  content: ReactionContent,
  token?: string,
  isComment = false
): Promise<void> {
  const endpoint = isComment
    ? `/repos/${getRepo()}/issues/comments/${targetId}/reactions`
    : `/repos/${getRepo()}/issues/${targetId}/reactions`;

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

/** 获取仓库所有标签 */
export async function getLabels(token?: string): Promise<string[]> {
  const res = await githubFetch(
    `/repos/${getRepo()}/labels?per_page=100`,
    {},
    token
  );
  const labels = (await res.json()) as GitHubLabel[];
  return labels.map(label => label.name);
}

/** 获取自定义标签（排除系统标签） */
export async function getCustomLabels(token?: string): Promise<string[]> {
  const systemLabels = new Set(['shuoshuo', 'draft']);
  const labels = await getLabels(token);
  return labels.filter(label => !systemLabels.has(label.toLowerCase()));
}

/** 搜索说说（通过 GitHub Search API） */
export async function searchPosts(
  keyword: string,
  label?: string,
  page = 1,
  token?: string
): Promise<PaginatedResponse<Post>> {
  const safeKeyword = keyword.replace(/["\\]/g, ' ').trim();
  const perPage = 10;
  const safePage = Math.max(1, page);

  if (!safeKeyword) {
    return {
      data: [],
      page: safePage,
      perPage,
      total: 0,
      hasMore: false,
    };
  }

  const safeLabel = label?.replace(/["\\]/g, ' ').trim();
  const labelQuery = safeLabel
    ? ` label:shuoshuo label:"${safeLabel}"`
    : ' label:shuoshuo';
  const query = `${safeKeyword}${labelQuery} repo:${getRepo()} is:issue is:open`;

  const res = await githubFetch(
    `/search/issues?q=${encodeURIComponent(query)}&sort=created&order=desc&per_page=${perPage}&page=${safePage}`,
    {},
    token
  );
  const result = (await res.json()) as GitHubSearchResult;

  const posts = result.items
    .filter(issue => !issue.pull_request)
    .filter(
      issue => !hasLabel((issue.labels ?? []).map(l => l.name), 'draft')
    )
    .map(issueToPost);

  return {
    data: posts,
    page: safePage,
    perPage,
    total: result.total_count,
    hasMore: result.total_count > safePage * perPage,
  };
}