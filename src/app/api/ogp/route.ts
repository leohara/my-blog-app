import { NextRequest, NextResponse } from "next/server";
import type { OGPData } from "@/types/ogp";
import { decodeHtmlEntities } from "@/lib/html-entities";
import { OGP_FETCH_TIMEOUT } from "@/lib/link-card-constants";

// Security constants
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB制限
const RATE_LIMIT_MAX_REQUESTS = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1分間
const ALLOWED_CONTENT_TYPES = [
  "text/html",
  "application/xhtml+xml",
];

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// URLの安全性をチェック
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    // HTTPSのみ許可 - 中間者攻撃を防ぎ、通信の機密性を確保
    if (url.protocol !== "https:") return false;

    // 内部IPアドレスをブロック
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
      hostname === "0.0.0.0" || // 全てのインターフェースを示す特殊アドレス (予期しない動作を防ぐ)
      // IPv6プライベート範囲を追加
      hostname.toLowerCase().startsWith("fc") || // fc00::/7 - IPv6ユニークローカルアドレス
      hostname.toLowerCase().startsWith("fd") || // fd00::/8 - IPv6ユニークローカルアドレス (fc00::/7の一部)
      hostname.toLowerCase().startsWith("fe8") || // fe80::/10 - IPv6リンクローカルアドレス
      hostname.toLowerCase().startsWith("fe9") || // fe80::/10 - IPv6リンクローカルアドレス
      hostname.toLowerCase().startsWith("fea") || // fe80::/10 - IPv6リンクローカルアドレス
      hostname.toLowerCase().startsWith("feb") // fe80::/10 - IPv6リンクローカルアドレス
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// Rate limiting check
function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // Rate limit exceeded
  }

  // Increment count
  clientData.count++;
  return true;
}

// Content-Type validation
function isValidContentType(contentType: string): boolean {
  if (!contentType) return false;
  
  const mimeType = contentType.split(";")[0].trim().toLowerCase();
  return ALLOWED_CONTENT_TYPES.includes(mimeType);
}

// Response size validation
async function validateResponseSize(response: Response): Promise<string | null> {
  const contentLength = response.headers.get("content-length");
  
  if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
    return null; // Content too large
  }

  try {
    const reader = response.body?.getReader();
    if (!reader) return null;

    let totalSize = 0;
    let html = "";
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalSize += value.length;
      if (totalSize > MAX_RESPONSE_SIZE) {
        reader.releaseLock();
        return null; // Content too large
      }

      html += decoder.decode(value, { stream: true });
    }

    return html;
  } catch {
    return null;
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

    // Content-Type validation
    const contentType = response.headers.get("content-type");
    if (!isValidContentType(contentType || "")) {
      console.warn(`Invalid content type for ${url}: ${contentType}`);
      return null;
    }

    // Response size validation
    const html = await validateResponseSize(response);
    if (!html) {
      console.warn(`Response too large or invalid for ${url}`);
      return null;
    }

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
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function GET(request: NextRequest) {
  // Rate limiting check
  const clientId = request.headers.get("x-forwarded-for") || 
                   request.headers.get("x-real-ip") || 
                   request.ip || 
                   "unknown";
  
  if (!checkRateLimit(clientId)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { 
        status: 429,
        headers: {
          "Retry-After": Math.ceil(RATE_LIMIT_WINDOW_MS / 1000).toString(),
        },
      },
    );
  }

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
