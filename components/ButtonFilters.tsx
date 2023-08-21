import { useEffect, useState, ReactNode, MouseEvent } from 'react';
import { buildSelectedFilters, updateSelectedFilters } from '@/utils/queryFilterHelpers';

import {
  getPropLot_propLot_tagFilter as TagFilter,
  getPropLot_propLot_tagFilter_options as TagFilterOptions,
  getPropLot_propLot_sortFilter as SortFilter,
  getPropLot_propLot_sortFilter_options as SortFilterOptions,
  getPropLot_propLot_dateFilter as DateFilter,
  getPropLot_propLot_dateFilter_options as DateFilterOptions,
  getPropLot_propLot_listFilter as ListFilter,
  getPropLot_propLot_listFilter_options as ListFilterOptions,

} from '@/graphql/types/__generated__/getPropLot';
import { FilterType } from '@/graphql/types/__generated__/globalTypes';

export type GenericFilter = {
  id: string;
  type: FilterType;
  label: string | null;
  __typename: 'PropLotFilter';
  options: {
    id: string;
    label: string | null;
    selected: boolean;
    value: string;
    count: number | null;
    icon: string | null;
    __typename: 'FilterOption';
  }[];
};

type Filter = TagFilter | SortFilter | DateFilter | ListFilter;
type FilterOptions = TagFilterOptions | SortFilterOptions | DateFilterOptions | ListFilterOptions;

export const ButtonWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-1 flex-row items-center overflow-scroll pt-[8px] gap-[16px]">
      {children}
    </div>
  );
};

export const ButtonFilterOption = ({
  id,
  isSelected,
  onClick,
  children,
}: {
  id: string;
  isSelected: boolean;
  onClick: (e: MouseEvent) => void;
  children: ReactNode;
}) => {
  return (
    <button
      onClick={onClick}
      key={id}
      className="flex gap-sm !bg-grey/80 !text-black !border-none !text-sm !rounded-[10px] !font-inter !pt-sm !pb-sm !pl-md !pr-md self-center"
    >
      {children}
    </button>
  );
};

const ButtonFilters = ({
  filter,
  updateFilters,
}: {
  filter: Filter;
  updateFilters: (filters: string[], filterId: string) => void;
}) => {
  const [selectedFilters, setSelectedFilters] = useState(buildSelectedFilters(filter));

  useEffect(() => {
    setSelectedFilters(buildSelectedFilters(filter));
  }, [filter]);

  const handleUpdateFilters = (opt: FilterOptions, isSelected: boolean) => {
    const newFilters = updateSelectedFilters(filter, selectedFilters, opt, isSelected);

    setSelectedFilters(newFilters);
    updateFilters(newFilters, filter.id);
  };

  return (
    <ButtonWrapper>
      {filter.options.map(opt => {
        const isSelected = selectedFilters.some(selectedFilter => selectedFilter === opt.value);
        return (
          <ButtonFilterOption
            key={opt.id}
            id={opt.id}
            isSelected={isSelected}
            onClick={(e: MouseEvent) => {
              e.preventDefault();
              handleUpdateFilters(opt, isSelected);
            }}
          >
            {opt.label}
            {opt.count && <span className={`rounded-[100px] px-xs ${isSelected ? 'bg-light-green text-white' : 'bg-grey text-black'}`}>{opt.count}</span>}
          </ButtonFilterOption>
        );
      })}
    </ButtonWrapper>
  );
};

export default ButtonFilters;
