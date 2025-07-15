export interface Heading {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface TableOfContentsProps {
  headings: Heading[];
  currentHeadingId?: string;
}
