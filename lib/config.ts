console.log('SERVER ENV', process.env)
export const ironOptions = {
  cookieName: "proplot-auth",
  password: process.env.SECRET_AUTH_PASSWORD || '',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
  ttl: 60 * 60,
};