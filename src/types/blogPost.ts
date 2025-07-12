// サムネイルの型
export interface Thumbnail {
  url: string;
  title: string;
  width: number;
  height: number;
}

// ブログ記事全体の型
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
