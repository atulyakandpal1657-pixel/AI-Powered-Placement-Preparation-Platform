import type { NextConfig } from "next";

/**
 * Expected environment variables (frontend):
 * - NEXT_PUBLIC_API_URL — Backend API base URL (default: https://placeprep-backend-w679.onrender.com/api)
 * - NEXT_PUBLIC_DEMO_ACCOUNTS_ENABLED — Set to "true" when demo login is enabled on the API
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
