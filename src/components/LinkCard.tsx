"use client";

import React, { useEffect, useState } from "react";
import type { OGPData } from "@/types/ogp";
import { decodeHtmlEntities } from "@/lib/html-entities";
import { ogpCache } from "@/lib/ogp-cache";

interface LinkCardProps {
  url: string;
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
          // 画像URLのHTMLエンティティをデコード
          if (data.image) {
            data.image = decodeHtmlEntities(data.image);
          }
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
              <div className="link-card-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ogpData.image}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    // 画像の読み込みに失敗した場合
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </a>
      </div>
    );
  }

  return null;
});

export default LinkCard;
