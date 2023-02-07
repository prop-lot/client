import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();

console.log(serverRuntimeConfig)
console.log(process.env)

export const ironOptions = {
  cookieName: "proplot-auth",
  password: process.env.SECRET_AUTH_PASSWORD || serverRuntimeConfig.SECRET_AUTH_PASSWORD || 'test', // TODO: Replace with env var. Must be a 32 char long private key.
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
  ttl: 60 * 60,
};