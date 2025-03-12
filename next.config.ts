/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  output: "export", // Enables static export
  images: {
    unoptimized: true, // Required for static hosting
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;