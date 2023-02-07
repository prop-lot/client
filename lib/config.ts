import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();

console.log('SERVER CONFIG', serverRuntimeConfig)
console.log('ENV', process.env.SECRET_AUTH_PASSWORD)

export const ironOptions = {
  cookieName: "proplot-auth",
  password: process.env.SECRET_AUTH_PASSWORD || serverRuntimeConfig.SECRET_AUTH_PASSWORD || '',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
  ttl: 60 * 60,
};