export const ironOptions = {
  cookieName: "proplot-auth",
  password: "complex_password_at_least_32_characters_long", // TODO: Replace with env var. Must be a 32 char long private key.
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
  ttl: 60 * 60,
};