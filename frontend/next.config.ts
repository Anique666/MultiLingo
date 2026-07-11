import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    // @ts-expect-error - Next.js types might not include buildActivity false in this version
    buildActivity: false,
  },
};

export default nextConfig;
