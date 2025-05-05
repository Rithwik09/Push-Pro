// next.config.js
const withImages = require("next-images");

// const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  // output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  swcMinify: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || "",
  images: {
    loader: "imgix",
    path: "/"
  },
  rewrites: async () => [
    {
      source: "/myprojects/edit/:projectID",
      destination: "/myprojects/create"
    },
    {
      source: "/myprojects/edit/:projectID/address",
      destination: "/myprojects/create"
    },
    {
      source: "/myprojects/edit/:projectID/schedule",
      destination: "/myprojects/create"
    },
    {
      source: "/myprojects/edit/:projectID/budget",
      destination: "/myprojects/create"
    },
    {
      source: "/myprojects/edit/:projectID/requirements",
      destination: "/myprojects/create"
    },
    {
      source: "/myprojects/edit/:projectID/summary",
      destination: "/myprojects/create"
    }
  ]
};

module.exports = withImages(nextConfig);
