import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;



// import type { NextConfig } from "next";
// import withPWAInit from "@ducanh2912/next-pwa";

// const withPWA = withPWAInit({
//   dest: "public",
//   cacheOnFrontEndNav: true,
//   aggressiveFrontEndNavCaching: true,
//   reloadOnOnline: true,
//   // swcMinify: true,
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
//             maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
//           },
//         },
//       },
//       {
//         urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
//         handler: "CacheFirst",
//         options: {
//           cacheName: "google-fonts-stylesheets",
//           expiration: {
//             maxEntries: 4,
//             maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
//           },
//         },
//       },
//       {
//         urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
//         handler: "StaleWhileRevalidate",
//         options: {
//           cacheName: "static-font-assets",
//           expiration: {
//             maxEntries: 10,
//             maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
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
//             maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
//           },
//         },
//       },
//       {
//         urlPattern: /\/_next\/image\?url=.+$/i,
//         handler: "StaleWhileRevalidate",
//         options: {
//           cacheName: "next-image",
//           expiration: {
//             maxEntries: 64,
//             maxAgeSeconds: 24 * 60 * 60, // 24 hours
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
//             maxAgeSeconds: 24 * 60 * 60, // 24 hours
//           },
//         },
//       },
//       {
//         urlPattern: /\.(?:css|less)$/i,
//         handler: "StaleWhileRevalidate",
//         options: {
//           cacheName: "static-style-assets",
//           expiration: {
//             maxEntries: 32,
//             maxAgeSeconds: 24 * 60 * 60, // 24 hours
//           },
//         },
//       },
//       {
//         urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
//         handler: "StaleWhileRevalidate",
//         options: {
//           cacheName: "next-data",
//           expiration: {
//             maxEntries: 32,
//             maxAgeSeconds: 24 * 60 * 60, // 24 hours
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
//             maxAgeSeconds: 5 * 60, // 5 minutes
//           },
//           cacheableResponse: {
//             statuses: [0, 200],
//           },
//         },
//       },
//       {
//         urlPattern: ({ url }) => {
//           const isSameOrigin = self.origin === url.origin;
//           if (!isSameOrigin) return false;
//           const pathname = url.pathname;
//           // Exclude API routes from this cache
//           if (pathname.startsWith("/api/")) return false;
//           return true;
//         },
//         handler: "NetworkFirst",
//         options: {
//           cacheName: "pages-cache",
//           networkTimeoutSeconds: 10,
//           expiration: {
//             maxEntries: 32,
//             maxAgeSeconds: 24 * 60 * 60, // 24 hours
//           },
//         },
//       },
//     ],
//   },
// });

// const nextConfig: NextConfig = {
//   /* your existing config options here */
//   reactStrictMode: true,
// };

// export default withPWA(nextConfig);