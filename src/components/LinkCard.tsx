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

  // 画像のalt属性をより説明的にする
  const imageAlt = alt || "Website preview image";
  const loadingAlt = `Loading preview image for ${alt || "website"}`;
  const errorAlt = `Preview image unavailable for ${alt || "website"}`;

  return (
    <div 
      className="link-card-image"
      role="img"
      aria-label={imageError ? errorAlt : imageLoading ? loadingAlt : imageAlt}
    >
      {imageLoading && !imageError && (
        <div 
          className="link-card-image-placeholder"
          aria-hidden="true"
        >
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-full rounded"></div>
        </div>
      )}
      {!imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={imageAlt}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`transition-opacity duration-300 ${
            imageLoading ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden={imageLoading ? "true" : "false"}
        />
      ) : (
        <div 
          className="link-card-image-fallback"
          role="img"
          aria-label={errorAlt}
        >
          <svg
            className="w-8 h-8 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
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
  const [announceText, setAnnounceText] = useState<string>("");

  useEffect(() => {
    // スクリーンリーダー用のローディング開始アナウンス
    setAnnounceText(`Loading link preview for ${url}`);
    
    // キャッシュをチェック
    const cachedData = ogpCache.get(url);
    if (cachedData) {
      setOgpData(cachedData);
      setLoading(false);
      setAnnounceText(`Link preview loaded for ${cachedData.title || url}`);
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
          setAnnounceText(`Link preview loaded for ${data.title || url}`);
        }
      } catch (error) {
        // AbortErrorは無視
        if (
          error instanceof Error &&
          error.name !== "AbortError" &&
          !abortController.signal.aborted
        ) {
          setError(true);
          setAnnounceText(`Failed to load link preview for ${url}`);
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
        aria-label={`External link to ${url} (preview unavailable)`}
      >
        {url}
      </a>
    );
  }

  // ローディング中は改善されたスケルトンを表示
  if (loading) {
    return (
      <div 
        className="link-card"
        role="status"
        aria-live="polite"
        aria-label="Loading link preview"
      >
        <div className="link-card-body">
          <div className="link-card-info">
            {/* タイトルのスケルトン */}
            <div className="link-card-skeleton-title" aria-hidden="true">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-5 rounded w-4/5 mb-2"></div>
            </div>
            {/* 説明のスケルトン */}
            <div className="link-card-skeleton-description" aria-hidden="true">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded w-full mb-1"></div>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded w-5/6 mb-2"></div>
            </div>
            {/* URLのスケルトン */}
            <div className="link-card-skeleton-url" aria-hidden="true">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-3 rounded w-2/5"></div>
            </div>
          </div>
          {/* 画像のスケルトン */}
          <div className="link-card-image" aria-hidden="true">
            <div className="link-card-image-skeleton">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-full rounded">
                <div className="flex items-center justify-center h-full">
                  <svg 
                    className="w-8 h-8 text-gray-300 dark:text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* スクリーンリーダー用のアナウンスメント */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announceText}
        </div>
      </div>
    );
  }

  // OGPデータを使ってリンクカードを表示
  if (ogpData) {
    const siteName = ogpData.siteName || new URL(url).hostname;
    const linkDescription = `Link to ${ogpData.title} on ${siteName}${ogpData.description ? `: ${ogpData.description}` : ''}`;
    
    return (
      <article className="link-card" role="article">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label={linkDescription}
          className="link-card-link"
        >
          <div className="link-card-body">
            <div className="link-card-info">
              <h3 className="link-card-title" aria-describedby={`desc-${encodeURIComponent(url)}`}>
                {ogpData.title}
              </h3>
              {ogpData.description && (
                <div 
                  className="link-card-description"
                  id={`desc-${encodeURIComponent(url)}`}
                  role="text"
                >
                  {ogpData.description}
                </div>
              )}
              <div className="link-card-url" role="text" aria-label={`Website: ${siteName}`}>
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
        {/* スクリーンリーダー用のアナウンスメント */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announceText}
        </div>
      </article>
    );
  }

  return null;
});

export default LinkCard;
