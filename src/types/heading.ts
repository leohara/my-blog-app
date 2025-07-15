export interface Heading {
  id: string;
  level: number;
  text: string;
}

export interface TableOfContentsProps {
  headings: Heading[];
  currentHeadingId?: string;
}
