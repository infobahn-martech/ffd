/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import drop from '../assets/images/drop-dwn.svg';
import search from '../assets/images/search-normal.svg';
import filter from '../assets/images/filter.svg';
import create from '../assets/images/create.svg';
import CommonFilter from './CommonFilter';
import "../design/scss/filters.scss"

function CommonHeader({

  onFilterChange,
  tableTitle,
  showFilter,
  showDateRange,
  addModalLabel,
  onAddModalClick,
  hideSearch = false,
  showOnlySort,
  sortBy,
  setSortBy,
  sortByOptions,
  setSearch,
  filterOptions,
  filterValue,
  onApplyFilter,
  onClearFilter,
  pageFrom,
  isAddEnabled = true,
  bredcrumpTitle,
  showExport,
  onExportClick,
  exportOption = [{ label: 'PDF', value: 'pdf' }],
  exportTitle = 'Export',
  exportLoader = false,
  showImport,
  onImportClick,
  sortOrderOptions,
  sortOrder,
  setSortOrder,
  searchPlaceHolder,
}) {
  const navigate = useNavigate();

  const [timer, setTimer] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [filterCollapse, setFilterCollapse] = useState(false);

  const renderBreadCrumpTitile = (title) => (
    <>
      <div
        className="breadcrumb-item cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <a>{tableTitle}</a>
      </div>
      <div className="heading left-sec" aria-current="page">
        {title}
      </div>
    </>
  );

  useEffect(() => {
    if (pageFrom === 'active') setSearchValue('');
  }, []);

  return (
    <>
      <div className="row">
        <div className="top-sec d-flex">
          <div className="col-lg-2">
            {bredcrumpTitle ? (
              renderBreadCrumpTitile(bredcrumpTitle)
            ) : (
              <div className="heading left-sec">{tableTitle}</div>
            )}
          </div>
          <div className="col-lg-10">
            <form action="#" className="right-sec">
              {!hideSearch && (
                <div className="search-group mx-2">
                  <div className="input-group">
                    <span className="input-group-text">
                      <img src={search} alt="sch" />
                    </span>
                    <input
                      value={searchValue}
                      onChange={({ target: { value } }) => {
                        setSearchValue(value.trimStart());
                        clearTimeout(timer);
                        const timerSet = setTimeout(() => {
                          setSearch(value?.trimStart());
                        }, 500);
                        setTimer(timerSet);
                      }}
                      type="text"
                      className="form-control"
                      placeholder={searchPlaceHolder || 'Search...'}
                    />
                  </div>
                </div>
              )}

              {showFilter && (
                <div className="filter mx-2">
                  <button className="btn-common" type="button" onClick={() => { setFilterCollapse(!filterCollapse) }}>
                    <span>
                      <img src={filter} alt="filter" />
                    </span>
                    <span>Filter</span>
                  </button>
                </div>
              )}

              {showImport && (
                <div className="import mx-2">
                  <button
                    className="btn-common"
                    type="button"
                    onClick={onImportClick}
                  >
                    <span>Import</span>
                  </button>
                </div>
              )}

              {showExport && (
                <div className="dropdown d-inline-block mx-2">
                  <button
                    className="btn-common dropdown-toggle"
                    type="button"
                    id="actionDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    // onClick={onExportClick}
                    disabled={exportLoader}
                  >
                    <span>{exportTitle}</span>
                    {!exportLoader ? (
                      <span>
                        <img src={drop} alt="drop-dwn" />
                      </span>
                    ) : (
                      <div
                        className="spinner-border spinner-border-sm"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )}
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="actionDropdown">
                    {exportOption.map(({ value, label }) => (
                      <li key={label}>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => onExportClick(value)}
                        >
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isAddEnabled && (
                <div className="filter-items">
                  {/* add filter and export here  */}

                  <div className="create-btn mx-2">
                    <button
                      className="btn-common green-btn"
                      type="button"
                      onClick={onAddModalClick}
                    >
                      <span>
                        <img src={create} alt="img" />
                      </span>
                      <span>{addModalLabel}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      {filterCollapse && filterOptions && (
        <CommonFilter
          filters={filterOptions}
          filterValues={filterValue || {}}
          onFilterChange={onFilterChange}
          onApplyFilter={onApplyFilter || onFilterChange}
          onClearFilter={onClearFilter || onFilterChange}
        />
      )}
    </>

  );
}

CommonHeader.propTypes = {
  start: PropTypes.isRequired,
  onFilterChange: PropTypes.isRequired,
  tableTitle: PropTypes.isRequired,
  showFilter: PropTypes.isRequired,
  showDateRange: PropTypes.isRequired,
  addModalLabel: PropTypes.isRequired,
  onAddModalClick: PropTypes.isRequired,
  hideSearch: PropTypes.isRequired,
  sortBy: PropTypes.isRequired,
  setSortBy: PropTypes.isRequired,
  sortByOptions: PropTypes.isRequired,
  setSearch: PropTypes.isRequired,
  filterOptions: PropTypes.isRequired,
  filterValue: PropTypes.isRequired,
  pageFrom: PropTypes.isRequired,
  isAddEnabled: PropTypes.isRequired,
  dates: PropTypes.isRequired,
  handleDateCallback: PropTypes.isRequired,
  bredcrumpTitle: PropTypes.isRequired,
  showOnlySort: PropTypes.isRequired,
  showExport: PropTypes.isRequired,
  onExportClick: PropTypes.isRequired,
  exportTitle: PropTypes.isRequired,
  exportLoader: PropTypes.isRequired,
  exportOption: PropTypes.node,
  showImport: PropTypes.node,
  onImportClick: PropTypes.node,
  sortOrderOptions: PropTypes.isRequired,
  sortOrder: PropTypes.isRequired,
  setSortOrder: PropTypes.isRequired,
};

export default CommonHeader;
