import {
  SUPPORTED_SUBDOMAINS,
  SupportedTokenGetterMap,
} from "./supportedTokenUtils";

const getCommunityByDomain = (req: any) => {
  // const host = req.headers.host;
  // const cdHeader = req.headers["proplot-cd"]; // used for local dev only where SSR requests are on the root domain.
  // const isDev = process.env.NODE_ENV === "development";
  // const subdomain = isDev
  //   ? host?.match(/(.*)\.localhost:3000/)
  //   : host?.match(/(.*)\.proplot\.wtf/);

  // const communityDomain =
  //   subdomain?.[1]?.toLowerCase() || (isDev && cdHeader?.toLowerCase()) || "";

  // const communityDomain = "lilnouns";

  // const supportedTokenConfig =
  //   SupportedTokenGetterMap[communityDomain as SUPPORTED_SUBDOMAINS];

  // return {
  //   communityDomain,
  //   supportedTokenConfig,
  // };

  return {
    communityDomain: "lilnouns",
    supportedTokenConfig: SupportedTokenGetterMap["lilnouns"],
  };
};

export default getCommunityByDomain;
