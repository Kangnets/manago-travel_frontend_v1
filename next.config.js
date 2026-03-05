/** @type {import('next').NextConfig} */

// 프로덕션 배포 시 NEXT_PUBLIC_POCKETBASE_URL 환경변수로 PocketBase 도메인 지정
// 예: NEXT_PUBLIC_POCKETBASE_URL=https://pb.yourdomain.com
const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || '';
const pbHostname = pocketbaseUrl
  ? (() => { try { return new URL(pocketbaseUrl).hostname; } catch { return ''; } })()
  : '';

/** @type {import('next').ImageConfig['remotePatterns']} */
const remotePatterns = [
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '3845',
    pathname: '/assets/**',
  },
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '8090',
    pathname: '/api/files/**',
  },
  {
    protocol: 'https',
    hostname: 'placehold.co',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'plus.unsplash.com',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: '*.unsplash.com',
    pathname: '/**',
  },
];

if (pbHostname) {
  remotePatterns.push({
    protocol: pocketbaseUrl.startsWith('https') ? 'https' : 'http',
    hostname: pbHostname,
    pathname: '/api/files/**',
  });
}

const nextConfig = {
  // standalone은 프로덕션 빌드 시에만 사용 (dev에서 청크 404 방지)
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  images: {
    remotePatterns,
  },
};

module.exports = nextConfig
