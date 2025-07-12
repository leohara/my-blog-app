import { visit } from 'unist-util-visit';
import { fetchOGPData } from './ogp-fetcher';
import type { Plugin } from 'unified';
import type { Root, Paragraph, Link } from 'mdast';

export const remarkLinkCard: Plugin<[], Root> = () => {
  return async (tree) => {
    const promises: Promise<void>[] = [];

    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      // 段落内に単一のリンクのみが存在するかチェック
      if (node.children.length === 1 &&
          node.children[0].type === 'link') {

        const link = node.children[0] as Link;
        const url = link.url;

        // リンクのテキストがURLと同じ場合のみ処理
        if (link.children.length === 1 &&
            link.children[0].type === 'text' &&
            link.children[0].value === url) {

          promises.push(
            fetchOGPData(url).then(ogpData => {
              if (ogpData && parent && typeof index === 'number') {
                // HTMLノードとしてリンクカードを作成
                const linkCardHtml = createLinkCardHtml(ogpData);

                parent.children[index] = {
                  type: 'html',
                  value: linkCardHtml
                } as any;
              }
            })
          );
        }
      }
    });

    await Promise.all(promises);
  };
};

function createLinkCardHtml(ogpData: OGPData): string {
  const escapedTitle = escapeHtml(ogpData.title);
  const escapedDescription = escapeHtml(ogpData.description);
  const escapedSiteName = ogpData.siteName ? escapeHtml(ogpData.siteName) : '';

  return `
    <div class="link-card">
      <a href="${ogpData.url}" target="_blank" rel="noopener noreferrer">
        <div class="link-card-body">
          <div class="link-card-info">
            <div class="link-card-title">${escapedTitle}</div>
            ${escapedDescription ? `<div class="link-card-description">${escapedDescription}</div>` : ''}
            <div class="link-card-url">
              ${escapedSiteName ? `<span class="link-card-site">${escapedSiteName}</span>` : ''}
              <span>${new URL(ogpData.url).hostname}</span>
            </div>
          </div>
          ${ogpData.image ? `
            <div class="link-card-image">
              <img src="${ogpData.image}" />
            </div>
          ` : ''}
        </div>
      </a>
    </div>
  `;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}