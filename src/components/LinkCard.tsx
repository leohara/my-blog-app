"use client";

import React, { useEffect, useState } from "react";
import type { OGPData } from "@/types/ogp";
import { ogpCache } from "@/lib/ogp-cache";

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
    <div className="link-card-image">
      {!imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="link-card-image-fallback">
          <svg
            className="w-8 h-8 text-gray-400"
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

  useEffect(() => {
    // キャッシュをチェック
    const cachedData = ogpCache.get(url);
    if (cachedData) {
      setOgpData(cachedData);
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
        <div className="link-card-body">
          <div className="link-card-info">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="link-card-image">
            <div className="w-full h-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // OGPデータを使ってリンクカードを表示
  if (ogpData) {
    return (
      <div className="link-card">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <div className="link-card-body">
            <div className="link-card-info">
              <div className="link-card-title">{ogpData.title}</div>
              {ogpData.description && (
                <div className="link-card-description">
                  {ogpData.description}
                </div>
              )}
              <div className="link-card-url">
                {ogpData.siteName && (
                  <span className="link-card-site">{ogpData.siteName}</span>
                )}
                <span>{new URL(url).hostname}</span>
              </div>
            </div>
            {ogpData.image && (
              <LinkCardImage src={ogpData.image} alt={ogpData.title} />
            )}
          </div>
        </a>
      </div>
    );
  }

  return null;
});

export default LinkCard;
