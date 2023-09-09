import { useEffect, useState, forwardRef } from "react";
import {
  getPropLot_propLot_tagFilter as TagFilter,
  getPropLot_propLot_tagFilter_options as TagFilterOptions,
  getPropLot_propLot_sortFilter as SortFilter,
  getPropLot_propLot_sortFilter_options as SortFilterOptions,
  getPropLot_propLot_dateFilter as DateFilter,
  getPropLot_propLot_dateFilter_options as DateFilterOptions,
} from "@/graphql/types/__generated__/getPropLot";

import { FilterType as FilterTyeEnum } from "@/graphql/types/__generated__/globalTypes";
import { Dropdown, Form } from "react-bootstrap";
import {
  updateSelectedFilters,
  buildSelectedFilters,
} from "@/utils/queryFilterHelpers";

type Filter = TagFilter | SortFilter | DateFilter;
type FilterOptions = TagFilterOptions | SortFilterOptions | DateFilterOptions;

type CustomToggleProps = {
  children?: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => any;
};

// The forwardRef is important!!
// Dropdown needs access to the DOM node in order to position the Menu
const CustomToggle = forwardRef(
  (
    { children, onClick }: CustomToggleProps,
    ref: React.Ref<HTMLAnchorElement>
  ) => (
    <a
      href=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      className="font-inter flex flex-1 justify-center btn !rounded-[12px] bg-white border border-grey p-0 hover:!bg-[#F4F4F8] focus:!bg-[#E2E3E8] !text-black"
    >
      <span className="flex items-center justify-center text-base normal-case pt-sm pb-sm pl-md pr-md gap-md">
        {children}
      </span>
    </a>
  )
);

CustomToggle.displayName = "CustomToggle";

const UIFilter = ({
  filter,
  updateFilters,
}: {
  filter: Filter;
  updateFilters: (filters: string[], filterId: string) => void;
}) => {
  const [selectedFilters, setSelectedFilters] = useState(
    buildSelectedFilters(filter)
  );

  useEffect(() => {
    setSelectedFilters(buildSelectedFilters(filter));
  }, [filter]);

  const handleUpdateFilters = (opt: FilterOptions, isSelected: boolean) => {
    const newFilters = updateSelectedFilters(
      filter,
      selectedFilters,
      opt,
      isSelected
    );

    setSelectedFilters(newFilters);
    updateFilters(newFilters, filter.id);
  };

  return (
    <Dropdown className="flex flex-1 sm:block sm:flex-none">
      <Dropdown.Toggle as={CustomToggle} id={`dropdown-${filter.id}`}>
        <span className="pr-2">{filter.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[20px] h-[20px]"
        >
          <path
            fillRule="evenodd"
            d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
            clipRule="evenodd"
          />
        </svg>
      </Dropdown.Toggle>

      <Dropdown.Menu className="!min-w-[220px] !p-sm !mt-sm !bg-[#F4F4F8] !border !border-grey !rounded-[10px]">
        {filter.options.map((opt) => {
          const isSelected = selectedFilters.some(
            (selectedFilter: any) => selectedFilter === opt.value
          );
          return (
            <Dropdown.Item
              onClick={(evt: any) => {
                evt.preventDefault();
                handleUpdateFilters(opt, isSelected);
              }}
              key={opt.id}
              className={`${
                isSelected ? "bg-white border border-grey" : ""
              } min-width-[250px] cursor-pointer active:!bg-white !hover:bg-[#E2E3E8] rounded-[6px] justify-start mb-xs mt-xs !pt-sm !pb-sm pl-md pr-md`}
            >
              <div className="flex items-center">
                {filter.type === FilterTyeEnum.MULTI_SELECT && (
                  <Form.Check
                    type="radio"
                    name={opt.value}
                    id={`${opt.id}`}
                    checked={isSelected}
                  >
                    <Form.Check.Input
                      type="radio"
                      name={opt.value}
                      checked={isSelected}
                      onChange={() => {}}
                      className={`${
                        isSelected
                          ? "checked:!bg-black checked:!border-grey border-black"
                          : "border-dark-grey"
                      } border-solid border-2 mr-sm`}
                    />
                  </Form.Check>
                )}
                <span className="flex flex-1 items-center justify-between">
                  <span
                    className={`${
                      isSelected ? "text-black" : "text-dark-grey"
                    } font-semibold text-[14px]`}
                  >
                    {opt.label}
                  </span>
                </span>
              </div>
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};

CustomToggle.displayName = "CustomToggle";
export default UIFilter;
