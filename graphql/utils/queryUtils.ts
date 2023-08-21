import moment from "moment";

export const FILTER_IDS = {
  DATE: "date",
  SORT: "sort",
  TAG: "tag",
  PROFILE_TAB: "profile_tab",
  LIST_TYPE: "list",
};

export const buildFilterParam = (id: string, value: string) => {
  return `${id}=${value}`;
};

export const parseFilterParam = (param: string) => {
  if (!param) {
    return undefined;
  }
  const [id, value] = param.split("=");

  return { id, value };
};

export const getSortParam = (appliedFilters: string[]) =>
  appliedFilters.find(
    (aF: any) => parseFilterParam(aF)?.id === FILTER_IDS.SORT
  ) || buildFilterParam(FILTER_IDS.SORT, "LATEST");

export const getDateParam = (appliedFilters: string[]) =>
  appliedFilters.find(
    (aF: any) => parseFilterParam(aF)?.id === FILTER_IDS.DATE
  );

export const getTagParams = (appliedFilters: string[]) =>
  appliedFilters.filter(
    (aF: any) => parseFilterParam(aF)?.id === FILTER_IDS.TAG
  );

export const getProfileTabParams = (appliedFilters: string[]) =>
  appliedFilters.find(
    (aF: any) => parseFilterParam(aF)?.id === FILTER_IDS.PROFILE_TAB
  ) || buildFilterParam(FILTER_IDS.PROFILE_TAB, "SUBMISSIONS");

export const getProfileListTypeParams = (appliedFilters: string[]) =>
  appliedFilters.find(
    (aF: any) => parseFilterParam(aF)?.id === FILTER_IDS.LIST_TYPE
  ) || buildFilterParam(FILTER_IDS.LIST_TYPE, "IDEAS");

export const DATE_FILTERS: { [key: string]: any } = {
  TODAY: {
    value: buildFilterParam(FILTER_IDS.DATE, "TODAY"),
    displayName: "Today",
    filterFn: () => ({
      gte: moment().startOf("day").toISOString(),
      lte: moment().endOf("day").toISOString(),
    }),
  },
  THIS_WEEK: {
    value: buildFilterParam(FILTER_IDS.DATE, "THIS_WEEK"),
    displayName: "This week",
    filterFn: () => ({
      gte: moment().startOf("week").toISOString(),
      lte: moment().endOf("week").toISOString(),
    }),
  },
  THIS_MONTH: {
    value: buildFilterParam(FILTER_IDS.DATE, "THIS_MONTH"),
    displayName: "This month",
    filterFn: () => ({
      gte: moment().startOf("month").toISOString(),
      lte: moment().endOf("month").toISOString(),
    }),
  },
  ALL_TIME: {
    value: buildFilterParam(FILTER_IDS.DATE, "ALL_TIME"),
    displayName: "All time",
    filterFn: () => ({
      gte: moment(new Date("2022-01-01")).toISOString(),
      lte: moment().endOf("day").toISOString(),
    }),
  },
};

export const SORT_FILTERS: { [key: string]: any } = {
  LATEST: {
    value: buildFilterParam(FILTER_IDS.SORT, "LATEST"),
    displayName: "Latest",
    icon: "ARROW_UP",
  },
  OLDEST: {
    value: buildFilterParam(FILTER_IDS.SORT, "OLDEST"),
    displayName: "Oldest",
    icon: "ARROW_DOWN",
  },
  VOTES_DESC: {
    value: buildFilterParam(FILTER_IDS.SORT, "VOTES_DESC"),
    displayName: "Most Upvoted",
    icon: "ARROW_UP",
  },
  VOTES_ASC: {
    value: buildFilterParam(FILTER_IDS.SORT, "VOTES_ASC"),
    displayName: "Most Downvoted",
    icon: "ARROW_DOWN",
  },
};

export const LIST_TYPE_FILTERS: { [key: string]: any } = {
  IDEAS: {
    value: buildFilterParam(FILTER_IDS.LIST_TYPE, "IDEAS"),
    displayName: "Ideas",
    count: 20, // TODO: pull from DB
  },
  PROPOSALS: {
    value: buildFilterParam(FILTER_IDS.LIST_TYPE, "PROPOSALS"),
    displayName: "Proposals",
    count: 10, // TODO: pull from DB
  },
};

export const getIsClosed = (idea: any) => {
  return moment(idea.createdAt).isBefore(
    moment().subtract(7, "days").toISOString()
  );
};

export const getTimeToClose = (idea: any) => {
  const closeDate = moment(idea.createdAt).add(7, "days");
  const now = moment();

  const hoursDifference = closeDate.diff(now, "hours");
  const daysDifference = closeDate.diff(now, "days");

  return {
    daysLeft: daysDifference,
    hoursLeft: hoursDifference,
  };
};
