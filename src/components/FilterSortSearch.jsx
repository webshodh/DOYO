import React from "react";
import styled from "styled-components";
import { Form, Dropdown, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

// Styled components
const FilterSortSearchContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-left: 10px;
`;

const SearchForm = styled(Form.Group)`
  margin-bottom: 8px;
  flex-grow: 1;
`;

const SearchInput = styled(Form.Control)`
  margin-right: 8px;
  flex-grow: 1;
`;

const SearchButton = styled(Button)`
  width: 50px;
`;

const SortDropdown = styled(Dropdown)`
  padding-bottom: 10px;
  margin-right: 10px;
`;

const CategoryFilterDropdown = styled(Dropdown)`
  margin-left: 40px;
`;

const HomeButton = styled.button`
  margin-left: 40px;
  width: 150px;
  background-color: green;
  color: white;
`;

const HomeLink = styled(Link)`
  text-decoration: none;
  color: white;
`;

const FilterSortSearch = ({
  searchTerm,
  handleSearch,
  handleSort,
  handleCategoryFilter,
  categories,
}) => {
  return (
    <FilterSortSearchContainer>
      {/* Search */}
      <SearchForm controlId="formSearch">
        <div className="d-flex align-items-center">
          <SearchInput
            type="text"
            placeholder="Search by Menu Name"
            value={searchTerm}
            onChange={handleSearch}
          />
          <SearchButton variant="danger" onClick={() => handleSearch()}>
            <img src="/search.png" height="20px" width="20px" alt="Search" />
          </SearchButton>
        </div>
      </SearchForm>

      {/* Sort by Price */}
      {handleSort && (
        <SortDropdown className="ms-2">
          <Dropdown.Toggle variant="danger" id="dropdownSort">
            <img src="/sort.png" height="20px" width="20px" alt="Sort" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleSort("lowToHigh")}>
              Low to High
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSort("highToLow")}>
              High to Low
            </Dropdown.Item>
          </Dropdown.Menu>
        </SortDropdown>
      )}

      {/* Filter by Category */}
      {handleCategoryFilter && (
        <>
          <CategoryFilterDropdown className="mb-3 ms-2">
            <Dropdown.Toggle variant="danger" id="dropdownCategoryFilter">
              Filter by Category
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleCategoryFilter("")}>
                All Categories
              </Dropdown.Item>
              {categories.map((category) => (
                <Dropdown.Item
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.categoryName)}
                >
                  {category.categoryName}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </CategoryFilterDropdown>
          <HomeButton>
            <HomeLink to="/">Home</HomeLink>
          </HomeButton>
        </>
      )}
    </FilterSortSearchContainer>
  );
};

export default FilterSortSearch;
