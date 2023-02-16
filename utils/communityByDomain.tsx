import { SUPPORTED_SUBDOMAINS, SupportedTokenGetterMap } from "./supportedTokenUtils";

const getCommunityByDomain = (req: any) => {
  const host = req.headers.host
  const subdomain =
    process.env.NODE_ENV === "development"
    ? host?.match(/(.*)\.localhost:3000/)
    : host?.match(/(.*)\.proplot\.wtf/);

  const communityDomain = subdomain?.[1]?.toLowerCase() || '';
  const supportedTokenConfig = SupportedTokenGetterMap[communityDomain as SUPPORTED_SUBDOMAINS];

  return {
    communityDomain,
    supportedTokenConfig
  }
}

export default getCommunityByDomain;