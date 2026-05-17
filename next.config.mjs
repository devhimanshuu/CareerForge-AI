/** @type {import('next').NextConfig} */
import dotenv from "dotenv";
dotenv.config();
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
    ],
  },
};

export default nextConfig;
