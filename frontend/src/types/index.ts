// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  username: string;
  profileImageUrl?: string | null;
  is_verified?: boolean | null;
  is_private?: boolean | null;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  stats?: UserStats | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

// Post types
export interface Post {
  id: string;
  author: User;
  content?: string | null;
  visibility: PostVisibility;
  parentPost?: Post | null;
  repliesCount: number;
  likesCount: number;
  repostsCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isReposted: boolean;
  repostedBy?: User | null;
  media?: PostMedia[] | null;
  hashtags?: Hashtag[] | null;
  mentions?: User[] | null;
  createdAt: string;
  updatedAt: string;
}

export type PostVisibility = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';

export interface PostMedia {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'GIF';
  mediaUrl: string;
  position?: number | null;
}

export interface Hashtag {
  id: string;
  tag: string;
  usageCount: number;
}

// Pagination
export interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string | null;
}

export interface PostEdge {
  cursor: string;
  node: Post;
}

export interface PostConnection {
  edges: PostEdge[];
  pageInfo: PageInfo;
}

export interface UserEdge {
  cursor: string;
  node: User;
}

export interface UserConnection {
  edges: UserEdge[];
  pageInfo: PageInfo;
}

// Auth types
export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Notification types
export type NotificationType = 'LIKE' | 'REPLY' | 'FOLLOW' | 'MENTION' | 'REPOST';

export interface Notification {
  id: string;
  user: User;
  actor: User;
  type: NotificationType;
  entityId?: string | null;
  isRead: boolean;
  createdAt: string;
}

// Form inputs
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName?: string;
  username?: string;
  email: string;
  password: string;
}

export interface CreatePostInput {
  content?: string;
  visibility?: PostVisibility;
  media?: CreatePostMediaInput[];
}

export interface CreatePostMediaInput {
  mediaType: 'IMAGE' | 'VIDEO' | 'GIF';
  mediaUrl: string;
  position?: number;
}

// API Response types
export interface ApiError {
  message: string;
  code?: string;
}
