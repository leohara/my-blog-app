import type { Entry, EntryFieldTypes } from "contentful";

// Contentfulのスケルトンタイプに準拠したフィールド定義
export interface BlogPostFields {
  fields: {
    title: EntryFieldTypes.Text;
    content: EntryFieldTypes.Text;
    slug: EntryFieldTypes.Text;
    tags: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    thumbnail?: EntryFieldTypes.AssetLink;
    published: EntryFieldTypes.Boolean;
  };
  contentTypeId: "blog";
}

// Contentfulのエントリータイプ
export type ContentfulBlogPost = Entry<BlogPostFields, undefined, string>;
