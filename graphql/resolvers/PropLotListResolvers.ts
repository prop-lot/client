import { IResolvers } from "@graphql-tools/utils";
import prisma from "@/lib/prisma";
import IdeasService from "../../services/ideas";
import {
  PropLotResponseMetadataResolvers,
  QueryGetPropLotArgs,
  Idea,
  PropLotFilter,
  FilterType,
  AppliedFilter,
  PropLotListItems,
} from "@/graphql/types/__generated__/apiTypes";

import { SORT_FILTERS, FILTER_IDS, DATE_FILTERS, getProfileListTypeParams, LIST_TYPE_FILTERS } from "../utils/queryUtils";
import { VirtualTags } from "@/utils/virtual";

import {
  buildFilterParam,
  parseFilterParam,
  getSortParam,
  getDateParam,
  getTagParams,
} from "../utils/queryUtils";

const buildSortOptions = (sortParam: string | undefined, appliedFilterTags: AppliedFilter[] | undefined, hasAppliedFilters: boolean) => {
  const options = Object.keys(SORT_FILTERS).map((key: string) => {
    const selected = sortParam === SORT_FILTERS[key].value;

    if (hasAppliedFilters && selected && appliedFilterTags !== undefined) {
      appliedFilterTags.unshift({
        displayName: `Sort by: ${SORT_FILTERS[key].displayName}`,
        param: SORT_FILTERS[key].value,
      })
    }
    return {
      id: `${FILTER_IDS.SORT}-${key}`,
      selected,
      label: SORT_FILTERS[key].displayName,
      value: SORT_FILTERS[key].value,
    };
  });

  return options;
}

export const resolveSortFilters = (
  root: any,
  exclude?: string[]
): PropLotFilter => {
  const options = buildSortOptions(root.sortParam, root.appliedFilterTags, root.appliedFilters.join(",").includes(FILTER_IDS.SORT))

  const sortFilter: PropLotFilter = {
    __typename: "PropLotFilter",
    id: FILTER_IDS.SORT,
    type: FilterType.SINGLE_SELECT,
    label: "Sort",
    options,
  };

  if (!!exclude) {
    const filteredOptions = sortFilter.options.filter(
      (opt) => !exclude.includes(opt.id.split("-")[1])
    );
    sortFilter.options = filteredOptions;
  }

  return sortFilter;
};

const buildDateOptions = (dateParam: string | undefined, appliedFilterTags: AppliedFilter[], hasAppliedFilters: boolean) => {
  const options = Object.keys(DATE_FILTERS).map((key: string) => {
    const selected = dateParam === DATE_FILTERS[key].value;

    if (selected && hasAppliedFilters) {
      appliedFilterTags.push({
        displayName: `Date: ${DATE_FILTERS[key].displayName}`,
        param: DATE_FILTERS[key].value,
      })
    }
    return {
      id: `${FILTER_IDS.DATE}-${key}`,
      selected,
      label: DATE_FILTERS[key].displayName,
      value: DATE_FILTERS[key].value,
    };
  });

  return options;
}

const buildTagFilterOptions = async (tagParams: string[], appliedFilterTags: AppliedFilter[], hasAppliedFilters: boolean) => {
  const tags = await prisma.tag.findMany();
  // static tag filters are the tags that come from the database
  // contrast with virtual tags (hot, etc)
  const staticTagFilterOptions = tags.map((tag) => {
    const param = buildFilterParam(FILTER_IDS.TAG, tag.type)
    const selected = Boolean(
      tagParams?.includes(param)
    );

    if (selected && hasAppliedFilters) {
      appliedFilterTags.push({
        displayName: tag.label,
        param,
      })
    }
    return {
      id: `${FILTER_IDS.TAG}-${tag.type}`,
      label: tag.label,
      value: param,
      selected,
    };
  });

  const virtualTagFilterOptions = Object.keys(VirtualTags)
    .filter((key) => key !== "CONSENSUS") // We don't want a consensus tag appearing in the filter dropdown
    .map((key) => {
      const vT = VirtualTags[key];
      const param = buildFilterParam(FILTER_IDS.TAG, vT.type)
      const selected = Boolean(
        tagParams?.includes(
          buildFilterParam(FILTER_IDS.TAG, vT.type)
        )
      )

      if (selected) {
        appliedFilterTags.push({
          displayName: vT.label,
          param,
        })
      }
      return {
        id: `${FILTER_IDS.TAG}-${vT.type}`,
        label: vT.label,
        value: buildFilterParam(FILTER_IDS.TAG, vT.type),
        selected,
      };
    });

  return [...staticTagFilterOptions, ...virtualTagFilterOptions];
}

const resolvers: IResolvers = {
  Query: {
    getPropLot: async (_parent: any, args: QueryGetPropLotArgs, context) => {
      const appliedFilters = args.options.filters || [];
      const appliedFilterTags: AppliedFilter[] = [];
      const sortParam = getSortParam(appliedFilters);
      const dateParam = getDateParam(appliedFilters);
      const tagParams = getTagParams(appliedFilters);
      const listParam = getProfileListTypeParams(appliedFilters);
      const isHomePage = appliedFilters.includes("PROPLOT_HOME");

      const dateOptions = buildDateOptions(dateParam, appliedFilterTags, appliedFilters.join(",").includes(FILTER_IDS.DATE));
      const tagFilterOptions = await buildTagFilterOptions(tagParams, appliedFilterTags, appliedFilters.join(",").includes(FILTER_IDS.TAG));

      return {
        appliedFilters,
        appliedFilterTags,
        sortParam,
        dateParam,
        tagParams,
        listParam,
        dateOptions,
        tagFilterOptions,
        isHomePage,
        requestUUID: args.options.requestUUID,
        timeZone: context.timeZone,
        communityId: context.communityId,
      };
    },
  },
  PropLotResponse: {
    ideas: async (root): Promise<Idea[]> => {
      const ideas: Idea[] = await IdeasService.findWhere({
        sortBy: parseFilterParam(root.sortParam)?.value,
        date: parseFilterParam(root.dateParam)?.value,
        tags: root.tagParams.map((tag: string) => parseFilterParam(tag)?.value),
        communityId: root.communityId,
        isHomePage: root.isHomePage
      });

      return ideas;
    },
    list: async (root): Promise<PropLotListItems[]> => {
      const listParam = parseFilterParam(root.listParam)?.value;
      let listItems: PropLotListItems[] = [];

      if (listParam === "IDEAS") {
        const ideas: Idea[] = await IdeasService.findWhere({
          sortBy: parseFilterParam(root.sortParam)?.value,
          date: parseFilterParam(root.dateParam)?.value,
          tags: root.tagParams.map((tag: string) => parseFilterParam(tag)?.value),
          communityId: root.communityId,
          isHomePage: root.isHomePage
        });

        listItems = [...ideas];
      }

      if (listParam === "PROPOSALS") {

        // QUERY FOR PROPOSALS HERE ONCE IMPLEMENTED IN THE DB.
        // This param will be passed in when a user taps the "Proposals" button on the PropLotList screen.

      }

      return listItems;
    },
    dateFilter: (root): PropLotFilter => {
      const dateFilter: PropLotFilter = {
        __typename: "PropLotFilter",
        id: FILTER_IDS.DATE,
        type: FilterType.SINGLE_SELECT,
        label: "Date",
        options: root.dateOptions,
      };

      return dateFilter;
    },
    tagFilter: (root): PropLotFilter => {
      const tagFilter: PropLotFilter = {
        __typename: "PropLotFilter",
        id: FILTER_IDS.TAG,
        type: FilterType.MULTI_SELECT,
        label: "Tags",
        options: root.tagFilterOptions,
      };

      return tagFilter;
    },
    sortFilter: (root) => resolveSortFilters(root),
    listFilter: (root): PropLotFilter => {
      const options = Object.keys(LIST_TYPE_FILTERS)
        .map((key: string) => {
          return {
            id: `${FILTER_IDS.LIST_TYPE}-${key}`,
            selected: root.listParam === LIST_TYPE_FILTERS[key].value,
            label: LIST_TYPE_FILTERS[key].displayName,
            value: LIST_TYPE_FILTERS[key].value,
            count: LIST_TYPE_FILTERS[key].count,
          };
        });
      const listFilter: PropLotFilter = {
        __typename: "PropLotFilter",
        id: FILTER_IDS.LIST_TYPE,
        type: FilterType.SINGLE_SELECT,
        options,
      };

      return listFilter;
    },
    appliedFilterTags: (root) => root.appliedFilterTags,
    metadata: async (root): Promise<PropLotResponseMetadataResolvers> => {
      return {
        requestUUID: root.requestUUID || "",
        appliedFilters: root.appliedFilters,
      }
    },
  },
};

export default resolvers;
