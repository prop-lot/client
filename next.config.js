/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(graphql|gql)/,
      exclude: /node_modules/,
      loader: "graphql-tag/loader"
    });

    return config;
  },
  publicRuntimeConfig: {
    NEXT_PUBLIC_TEST_SECRET: process.env.NEXT_PUBLIC_TEST_SECRET,
  },
  serverRuntimeConfig: {
    SECRET_AUTH_PASSWORD: process.env.SECRET_AUTH_PASSWORD,
    JSON_RPC_CLIENT: process.env.JSON_RPC_CLIENT,
    NEXT_PUBLIC_TEST_SECRET: process.env.NEXT_PUBLIC_TEST_SECRET,
  },
}

module.exports = nextConfig
