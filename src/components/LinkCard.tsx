"use client";

import React, { useEffect, useState } from "react";

import { ogpCache } from "@/lib/ogp-cache";

import type { OGPData } from "@/types/ogp";

interface LinkCardProps {
  url: string;
}

interface LinkCardImageProps {
  src: string;
  alt: string;
}

function LinkCardImage({ src, alt }: LinkCardImageProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="link-card-image-wrapper">
      {!imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="link-card-image"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="link-card-image-fallback">
          <svg
            className="link-card-fallback-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

const LinkCard = React.memo(function LinkCard({ url }: LinkCardProps) {
  const [ogpData, setOgpData] = useState<OGPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

  useEffect(() => {
    // キャッシュをチェック
    const cachedData = ogpCache.get(url);
    if (cachedData) {
      setOgpData(cachedData);
      if (cachedData.favicon) {
        setFaviconUrl(cachedData.favicon);
      }
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    const fetchOGP = async () => {
      try {
        const response = await fetch(
          `/api/ogp?url=${encodeURIComponent(url)}`,
          { signal: abortController.signal },
        );

        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        // アンマウント後の実行を防ぐ
        if (!abortController.signal.aborted) {
          setOgpData(data);

          // faviconを専用stateに設定
          if (data.favicon) {
            setFaviconUrl(data.favicon);
          }

          // キャッシュに保存
          ogpCache.set(url, data);
        }
      } catch (error) {
        // AbortErrorは無視
        if (
          error instanceof Error &&
          error.name !== "AbortError" &&
          !abortController.signal.aborted
        ) {
          setError(true);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchOGP();

    // クリーンアップ: fetchリクエストをキャンセル
    return () => {
      abortController.abort();
    };
  }, [url]);

  // エラー時はシンプルなリンクを表示
  if (error || (!loading && !ogpData)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {url}
      </a>
    );
  }

  // ローディング中はスケルトンを表示
  if (loading) {
    return (
      <div className="link-card animate-pulse">
        <div className="link-card-image-wrapper">
          <div className="link-card-image-skeleton"></div>
        </div>
        <div className="link-card-content">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // OGPデータを使ってリンクカードを表示
  if (ogpData) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="link-card"
      >
        {ogpData.image && (
          <LinkCardImage src={ogpData.image} alt={ogpData.title} />
        )}
        <div className="link-card-content">
          <div className="link-card-meta">
            <div className="link-card-domain">
              {(() => {
                const favicon = faviconUrl || ogpData?.favicon || "";
                const shouldShowFavicon = favicon && favicon.length > 0;

                if (!shouldShowFavicon) return null;

                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={favicon}
                    alt="favicon"
                    className="link-card-favicon"
                    width="16"
                    height="16"
                    onLoad={() => {}}
                    onError={() => {
                      setFaviconUrl(null);
                      console.warn("Failed to load favicon:", favicon);
                    }}
                  />
                );
              })()}
              <span className="link-card-title">{ogpData.title}</span>
            </div>
            <svg
              className="link-card-arrow"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.53033 2.21968L9 1.68935L7.93934 2.75001L8.46967 3.28034L12.4393 7.25001H1.75H1V8.75001H1.75H12.4393L8.46967 12.7197L7.93934 13.25L9 14.3107L9.53033 13.7803L14.6036 8.70711C14.9941 8.31659 14.9941 7.68342 14.6036 7.2929L9.53033 2.21968Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </a>
    );
  }

  return null;
});

export default LinkCard;
