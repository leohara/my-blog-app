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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className="link-card-image">
      {imageLoading && !imageError && (
        <div className="link-card-image-placeholder">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-full rounded"></div>
        </div>
      )}
      {!imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`transition-opacity duration-300 ${
            imageLoading ? "opacity-0" : "opacity-100"
          }`}
        />
      ) : (
        <div className="link-card-image-fallback">
          <svg
            className="w-8 h-8 text-gray-400 dark:text-gray-500"
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

  // ローディング中は改善されたスケルトンを表示
  if (loading) {
    return (
      <div className="link-card">
        <div className="link-card-body">
          <div className="link-card-info">
            {/* タイトルのスケルトン */}
            <div className="link-card-skeleton-title">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-5 rounded w-4/5 mb-2"></div>
            </div>
            {/* 説明のスケルトン */}
            <div className="link-card-skeleton-description">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded w-full mb-1"></div>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded w-5/6 mb-2"></div>
            </div>
            {/* URLのスケルトン */}
            <div className="link-card-skeleton-url">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-3 rounded w-2/5"></div>
            </div>
          </div>
          {/* 画像のスケルトン */}
          <div className="link-card-image">
            <div className="link-card-image-skeleton">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-full rounded">
                <div className="flex items-center justify-center h-full">
                  <svg 
                    className="w-8 h-8 text-gray-300 dark:text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
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
