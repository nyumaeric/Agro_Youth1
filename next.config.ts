// import type { NextConfig } from "next";
// import withPWAInit from "@ducanh2912/next-pwa";

// const withPWA = withPWAInit({
//   dest: "public",
//   cacheOnFrontEndNav: true,
//   aggressiveFrontEndNavCaching: true,
//   reloadOnOnline: true,
//   disable: process.env.NODE_ENV === "development",
//   workboxOptions: {
//     disableDevLogs: true,
//     runtimeCaching: [
//       {
//         urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
//         handler: "CacheFirst",
//         options: {
//           cacheName: "google-fonts",
//           expiration: {
//             maxEntries: 4,
//             maxAgeSeconds: 365 * 24 * 60 * 60,
//           },
//         },
//       },
//       {
//         urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
//         handler: "StaleWhileRevalidate",
//         options: {
//           cacheName: "static-image-assets",
//           expiration: {
//             maxEntries: 64,
//             maxAgeSeconds: 7 * 24 * 60 * 60,
//           },
//         },
//       },
//       {
//         urlPattern: /\.(?:js)$/i,
//         handler: "StaleWhileRevalidate",
//         options: {
//           cacheName: "static-js-assets",
//           expiration: {
//             maxEntries: 48,
//             maxAgeSeconds: 24 * 60 * 60,
//           },
//         },
//       },
//       {
//         urlPattern: /\/api\/.*$/i,
//         handler: "NetworkFirst",
//         method: "GET",
//         options: {
//           cacheName: "api-cache",
//           networkTimeoutSeconds: 10,
//           expiration: {
//             maxEntries: 32,
//             maxAgeSeconds: 5 * 60,
//           },
//           cacheableResponse: {
//             statuses: [0, 200],
//           },
//         },
//       },
//     ],
//   },
// });

// const nextConfig: NextConfig = {
//   reactStrictMode: true,
//   turbopack: {},
//   // Optimize build performance
//   experimental: {
//     // Reduce memory usage during builds
//     workerThreads: false,
//     cpus: 1,
//   },
//   // Disable source maps in production to reduce memory usage
//   productionBrowserSourceMaps: false,
// };

// export default withPWA(nextConfig);


import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: false, // We'll register manually
  sw: "sw.js",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  productionBrowserSourceMaps: false,
};

export default withPWA(nextConfig);


