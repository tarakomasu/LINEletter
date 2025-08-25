import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["profile.line-scdn.net", "placehold.co"], // LINEプロフィール画像のドメインを追加
  },
};

export default nextConfig;
