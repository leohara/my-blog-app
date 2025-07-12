import type { Entry, EntryFieldTypes } from "contentful";

// Contentfulのスケルトンタイプに準拠したフィールド定義
export interface BlogPostFields {
  fields: {
    title: EntryFieldTypes.Text;
    slug: EntryFieldTypes.Text;
    published: EntryFieldTypes.Boolean;
    excerpt: EntryFieldTypes.Text;
    thumbnail?: EntryFieldTypes.AssetLink;
    tags: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    content: EntryFieldTypes.Text;
  };
  contentTypeId: "blog";
}

// Contentfulのエントリータイプ
export type ContentfulBlogPost = Entry<BlogPostFields, undefined, string>;
