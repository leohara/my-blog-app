import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";

import { decodeHtmlEntities } from "@/lib/html-entities";
import { OGP_FETCH_TIMEOUT } from "@/lib/link-card-constants";

import type { OGPData } from "@/types/ogp";

// URLの安全性をチェック
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    // HTTPSのみ許可 - 中間者攻撃を防ぎ、通信の機密性を確保
    if (url.protocol !== "https:") return false;

    // 内部IPアドレスをブロック
    // TODO: 他にも考慮するべきIPアドレスがあるか調査
    const hostname = url.hostname;
    if (
      hostname === "localhost" || // localhost
      hostname === "127.0.0.1" || // ループバックアドレス
      hostname.startsWith("10.") || // 10.x.x.x - プライベートネットワーク (クラスA)
      hostname.startsWith("172.") || // 172.16.x.x - プライベートネットワーク (クラスB)
      hostname.startsWith("192.168.") || // 192.168.x.x - プライベートネットワーク (クラスC)
      hostname.startsWith("169.254.") || // 169.254.x.x - リンクローカルアドレス
      hostname === "::1" || // IPv6ループバックアドレス
      hostname === "[::1]" || // IPv6ループバックアドレス (ブラケット付きIPv6表記)
      hostname === "0.0.0.0" // 全てのインターフェースを示す特殊アドレス (予期しない動作を防ぐ)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

async function fetchOGPData(url: string): Promise<OGPData | null> {
  let timeoutId: NodeJS.Timeout | undefined;

  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), OGP_FETCH_TIMEOUT); // 5秒タイムアウト

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkCardBot/1.0)",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // cheerioでHTMLをパース
    const $ = cheerio.load(html);

    // 正規表現でメタタグを抽出（属性の順序に依存しない）
    const getMetaContent = (property: string): string | undefined => {
      // property="og:image" content="..." のパターン
      const regex1 = new RegExp(
        `<meta\\s+(?:[^>]*\\s+)?property=["']${property}["']\\s+(?:[^>]*\\s+)?content=["']([^"']+)["']`,
        "i",
      );
      const match1 = html.match(regex1);
      if (match1) return match1[1];

      // content="..." property="og:image" のパターン
      const regex2 = new RegExp(
        `<meta\\s+(?:[^>]*\\s+)?content=["']([^"']+)["']\\s+(?:[^>]*\\s+)?property=["']${property}["']`,
        "i",
      );
      const match2 = html.match(regex2);
      if (match2) return match2[1];

      return undefined;
    };

    const getMetaNameContent = (name: string): string | undefined => {
      // name="description" content="..." のパターン
      const regex1 = new RegExp(
        `<meta\\s+(?:[^>]*\\s+)?name=["']${name}["']\\s+(?:[^>]*\\s+)?content=["']([^"']+)["']`,
        "i",
      );
      const match1 = html.match(regex1);
      if (match1) return match1[1];

      // content="..." name="description" のパターン
      const regex2 = new RegExp(
        `<meta\\s+(?:[^>]*\\s+)?content=["']([^"']+)["']\\s+(?:[^>]*\\s+)?name=["']${name}["']`,
        "i",
      );
      const match2 = html.match(regex2);
      if (match2) return match2[1];

      return undefined;
    };

    const getTitleText = (): string => {
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      return titleMatch?.[1] || url;
    };

    // 画像URLを絶対URLに変換
    let imageUrl = getMetaContent("og:image");
    if (imageUrl) {
      // HTMLエンティティをデコード
      imageUrl = decodeHtmlEntities(imageUrl);

      try {
        // 相対URLの場合は絶対URLに変換
        const baseUrl = new URL(url);
        imageUrl = new URL(imageUrl, baseUrl).toString();
      } catch {
        // URLの変換に失敗した場合はそのまま使用
      }
    }

    // ファビコンURLを生成（複数のオプションを試す）
    const domain = new URL(url).hostname;
    let faviconUrl: string | undefined;

    try {
      // 1. HTMLからfaviconのlinkタグを探す
      const faviconLink = $(
        'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
      )
        .first()
        .attr("href");

      if (faviconLink) {
        faviconUrl = new URL(faviconLink, url).href;
      } else {
        // 2. 標準のfavicon.icoを試す
        faviconUrl = `https://${domain}/favicon.ico`;
      }
    } catch (error) {
      console.error("[OGP API] Error generating favicon URL:", error);
      faviconUrl = `https://${domain}/favicon.ico`;
    }

    const ogpData: OGPData = {
      title: getMetaContent("og:title") || getTitleText(),
      description:
        getMetaContent("og:description") ||
        getMetaNameContent("description") ||
        "",
      image: imageUrl,
      siteName: getMetaContent("og:site_name"),
      url: url,
      favicon: faviconUrl,
    };

    return ogpData;
  } catch (error) {
    console.error(`Failed to fetch OGP data for ${url}:`, error);
    return null;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 },
    );
  }

  if (!isValidUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const ogpData = await fetchOGPData(url);

  if (!ogpData) {
    return NextResponse.json(
      { error: "Failed to fetch OGP data" },
      { status: 500 },
    );
  }

  // キャッシュを1日間有効にする
  return NextResponse.json(ogpData, {
    headers: {
      "Cache-Control": "public, max-age=86400",
    },
  });
}
