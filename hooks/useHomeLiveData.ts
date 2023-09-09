import { useEffect, useState, useCallback } from 'react';
import {
  SUPPORTED_SUBDOMAINS,
  SupportedTokenGetterMap,
} from "@/utils/supportedTokenUtils";
import { getEtherBalance } from "@/utils/ethers";

// Hook to fetch data for the tiles on the Home Page
const useHomeLiveData = (communityUname: string) => {
  const [liveData, setLiveData] = useState<any>({});

  const fetchData = useCallback(async (fetchFunction: Function, key: string) => {
    const supportedTokenConfig = SupportedTokenGetterMap[communityUname as SUPPORTED_SUBDOMAINS];
    try {
      const data = await fetchFunction(supportedTokenConfig);
      setLiveData((l: any) => ({
        ...l,
        [key]: data,
      }));
    } catch (e) {
      console.log(e);
    }
  }, [communityUname]);


  useEffect(() => {
    fetchData(async (config: any) => (await getEtherBalance(config.account)).toNumber(), 'balance');
  }, [communityUname, fetchData]);

  useEffect(() => {
    fetchData((config: any) => config.getCurrentAuction(), 'currentAuction');
  }, [communityUname, fetchData]);

  useEffect(() => {
    fetchData((config: any) => config.getRecentProposals(), 'recentProposals');
  }, [communityUname, fetchData]);

  useEffect(() => {
    if (liveData.currentAuction?.id) {
      fetchData((config: any) => {
        const start = liveData.currentAuction?.id || 1;
        const previousAuctionIds = Array.from({length: 10}, (_, i) => start - (i + 1));
        return config.getPreviousAuctions(previousAuctionIds);
      }, 'previousAuctions');
    }
  }, [liveData.currentAuction, communityUname, fetchData]);

  return liveData;
};

export default useHomeLiveData;