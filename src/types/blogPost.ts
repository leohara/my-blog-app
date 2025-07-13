// サムネイルの型
export interface Thumbnail {
  url: string;
  title: string;
  width: number;
  height: number;
}

// ブログ記事のサマリー型（一覧表示用）
export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  createdAt: string;
}

// ブログ記事全体の型（詳細表示用）
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  thumbnail: Thumbnail;
}
