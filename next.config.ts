import type { NextConfig } from "next";

// Content Security Policy configuration
// Using Report-Only mode first to test without breaking functionality
// Once validated, change 'Content-Security-Policy-Report-Only' to 'Content-Security-Policy'
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-scripts.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://vercel.live wss://ws-us3.pusher.com;
  frame-src 'self' https://vercel.live;
  frame-ancestors 'self';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy - actively blocks violating resources
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // Enable React strict mode for better error detection
  reactStrictMode: true,

  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression

  // Output standalone for optimal deployment
  output: 'standalone' as const,

  // Environment variables that should be available on client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default nextConfig;
