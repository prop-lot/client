import { useEffect } from 'react';
/**
 * Syncs PropLot GraphQL filters to the URL
 */
const useSyncURLParams = (appliedFilters: string[], requestUUID?: string) => {
  useEffect(() => {
    const urlParams = appliedFilters.join('&');
    const currentURLParams = window.location.search;
    const currentRoute = window.location.pathname;

    if (requestUUID && urlParams !== currentURLParams) {
      window.history.pushState('', '', `${currentRoute}${urlParams ? `?${urlParams}` : ''}`);
    }
  }, [appliedFilters, requestUUID]);
};

export default useSyncURLParams;
