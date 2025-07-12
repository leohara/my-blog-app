import { NextRequest, NextResponse } from "next/server";

interface OGPData {
  title: string;
  description: string;
  image?: string;
  siteName?: string;
  url: string;
}

// URLの安全性をチェック
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    // HTTPSのみ許可
    if (url.protocol !== "https:") return false;

    // 内部IPアドレスをブロック
    const hostname = url.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.startsWith("169.254.") || // リンクローカルアドレス（AWS等のメタデータ）
      hostname === "::1" || // IPv6 localhost
      hostname === "0.0.0.0"
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

async function fetchOGPData(url: string): Promise<OGPData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒タイムアウト

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkCardBot/1.0)",
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const html = await response.text();

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
      imageUrl = imageUrl
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      try {
        // 相対URLの場合は絶対URLに変換
        const baseUrl = new URL(url);
        imageUrl = new URL(imageUrl, baseUrl).toString();
      } catch {
        // URLの変換に失敗した場合はそのまま使用
      }
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
    };

    return ogpData;
  } catch (error) {
    console.error(`Failed to fetch OGP data for ${url}:`, error);
    return null;
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
