import type { NextConfig } from "next";

// ビルド時の日付と年を生成
const buildDate = new Date();
const buildDateString = buildDate.toLocaleDateString("ja-JP");
const buildYear = buildDate.getFullYear().toString();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
  env: {
    // ビルド時の日付と年を環境変数として設定
    NEXT_PUBLIC_BUILD_DATE: buildDateString,
    NEXT_PUBLIC_BUILD_YEAR: buildYear,
  },
};

export default nextConfig;
