export interface Post {
  id: number;
  title: string;
  body: string;
  summary: string;
  labels: string[];
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  commentCount: number;
  reactions: Reactions;
}

export interface Reactions {
  total_count: number;
  '+1': number;
  '-1': number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}

export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  reactions: Reactions;
}

export interface TimelineEntry {
  year: number;
  month: number;
  day: number;
  posts: Post[];
}

export interface TimelineGroup {
  year: number;
  months: {
    month: number;
    days: {
      day: number;
      count: number;
    }[];
  }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}

export interface SearchParams {
  keyword?: string;
  label?: string;
  page?: number;
}

export interface ExtendedSession {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    login?: string;
  };
  accessToken?: string;
}
