import React, { useEffect, useState, useMemo, Fragment } from 'react';
import PropTypes from 'prop-types';

import CustomLoader from './CustomLoader';
import NoTableData from './NoTableData';

import '../design/scss/table-common.scss';

import nextIcon from '../assets/images/right.svg';
import prevIcon from '../assets/images/left.svg';
import sortSvg from '../assets/images/sort.svg';

// --- UTILS ---

const calculateSlNo = (page, limit) => (page - 1) * limit + 1;

const getTotalPages = (count, limit) =>
  count && limit ? Math.ceil(count / limit) : 0;

const getNumbersToShow = (totalPages, currentPage) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i += 1) {
    if (
      i === 1 ||
      i === totalPages ||
      Math.abs(currentPage - i) < 3 ||
      i === currentPage
    ) {
      pageNumbers.push(i);
    }
  }
  return pageNumbers;
};

const getPageStart = (currentPage, limit) =>
  currentPage === 1 ? 1 : limit * (currentPage - 1) + 1;

const getPageEnd = (currentPage, limit, count) => {
  const end = limit * currentPage;
  return end > count ? count : end;
};

const handleOnCellClick = (row, onView, notView) => {
  if (!notView && onView) {
    onView(row);
  }
};

// --- COMPONENT ---

function CustomTable({
  data,
  columns,
  pagination,
  onPageChange,
  count,
  isLoading,
  showLoader,
  onView,
  onSorting,
  Sl,
}) {
  const { currentPage, limit } = pagination;

  // Local state for temporary count and serial number base
  const [tempCount, setTempCount] = useState(count || 0);
  const [slNo, setSlNo] = useState(1);

  // Update serial number if page changes
  useEffect(() => {
    setSlNo(calculateSlNo(currentPage, limit));
  }, [currentPage, limit]);

  // Sync count
  useEffect(() => {
    if (!isLoading) setTempCount(count || 0);
  }, [count, isLoading]);

  // Calculate total pages (memoized for efficiency)
  const totalPages = useMemo(() => getTotalPages(tempCount, limit), [
    tempCount,
    limit,
  ]);

  // Memoized page numbers for display
  const numbersToShow = useMemo(
    () => getNumbersToShow(totalPages, currentPage),
    [totalPages, currentPage]
  );

  // Pagination rendering
  const renderPagination = () => {
    if ((!data || !data.length) && !isLoading) return null;

    const pageStart = getPageStart(currentPage, limit);
    const pageEnd = isLoading ? ' ' : getPageEnd(currentPage, limit, tempCount);

    return (
      <div className="container-fluid paginations">
        <div className="row">
          <div className="pagination-iiner d-flex">
            {!!count && (
              <div className="result-txt">{`Showing ${pageStart} to ${pageEnd} of ${count} entries`}</div>
            )}
            <nav aria-label="Page navigation example">
              <ul className="pagination justify-content-center">
                {/* Previous Button */}
                <li
                  className={`page-item${currentPage === 1 ? ' disabled' : ''}`}
                  onClick={currentPage > 1 ? () => handlePrev() : undefined}
                >
                  <a className="page-link" href="# " aria-label="Previous">
                    <img src={prevIcon} alt="" />
                  </a>
                </li>
                {/* Page Numbers */}
                {numbersToShow.map((num, idx) => {
                  const isFirstPage = idx === 0;
                  const gap =
                    !isFirstPage && num - numbersToShow[idx - 1] > 1
                      ? true
                      : false;
                  return (
                    <Fragment key={`pg${num}`}>
                      {gap && (
                        <a
                          href="# "
                          className="page-link cursor-pointer link-dots"
                        >
                          ...
                        </a>
                      )}
                      <li
                        className={`page-item${num === currentPage ? ' active' : ''}`}
                        onClick={
                          num === currentPage ? undefined : () => handlePage(num)
                        }
                      >
                        <a href="# " className="page-link ">
                          {num}
                        </a>
                      </li>
                    </Fragment>
                  );
                })}
                {/* Next Button */}
                <li
                  className={`page-item${currentPage === totalPages ? ' disabled' : ''
                    }`}
                  onClick={
                    currentPage < totalPages ? () => handleNext() : undefined
                  }
                >
                  <a href="# " className="page-link" aria-label="Next">
                    <img src={nextIcon} alt="" />
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // -- Pagination Handlers --
  const handlePrev = () => {
    if (currentPage <= 1) return;
    const newPage = currentPage - 1;
    setSlNo(calculateSlNo(newPage, limit));
    onPageChange?.(newPage);
  };

  const handleNext = () => {
    if (currentPage >= totalPages) return;
    const newPage = currentPage + 1;
    setSlNo(calculateSlNo(newPage, limit));
    onPageChange?.(newPage);
  };

  const handlePage = (pageNum) => {
    if (currentPage === pageNum) return;
    setSlNo(calculateSlNo(pageNum, limit));
    onPageChange?.(pageNum);
  };

  // ----------------------------

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="table-wrapper table-responsive ">
            <table className="table table-striped">
              {data && data.length > 0 && (
                <thead>
                  <tr>
                    {Sl && <th width="100">Sl.No</th>}
                    {columns.map(
                      ({ thclass, sort, selector, name, thProps, width }) => (
                        <th
                          width={width}
                          scope="col"
                          key={`head${name}`}
                          {...thProps}
                        >
                          <div className={`${thclass} d-inline`}>{name}</div>
                          {sort && (
                            <span
                              type="button"
                              className="sort"
                              onClick={() => onSorting && onSorting(selector)}
                            >
                              <img src={sortSvg} alt="sort" />
                            </span>
                          )}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
              )}

              {isLoading ? (
                <CustomLoader columns={columns} limit={limit} />
              ) : !data.length ? (
                <NoTableData columns={columns} />
              ) : (
                !showLoader && (
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={`row${row.id ?? idx}`}>
                        {Sl && <td>{idx + slNo}</td>}
                        {columns.map(
                          ({
                            selector,
                            cell,
                            colClassName = '',
                            contentClass = '',
                            notView,
                            ...rest
                          }) =>
                            cell ? (
                              <td
                                key={`cell${selector}`}
                                onClick={() =>
                                  handleOnCellClick(row, onView, notView)
                                }
                              >
                                <div className={contentClass}>
                                  {cell({ row, selector, ...rest })}
                                </div>
                              </td>
                            ) : (
                              <td
                                className={`${colClassName}${!notView && onView ? ' cursor-pointer' : ''
                                  }`}
                                key={`cell${selector}`}
                                onClick={() =>
                                  handleOnCellClick(row, onView, notView)
                                }
                              >
                                {row[selector]}
                              </td>
                            )
                        )}
                      </tr>
                    ))}
                  </tbody>
                )
              )}
            </table>
          </div>
        </div>
      </div>
      {renderPagination()}
    </>
  );
}

// --- PROP TYPES and DEFAULTS ---

CustomTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      thclass: PropTypes.string,
      sort: PropTypes.bool,
      selector: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
      name: PropTypes.string.isRequired,
      thProps: PropTypes.object,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      cell: PropTypes.func,
      colClassName: PropTypes.string,
      contentClass: PropTypes.string,
      notView: PropTypes.bool,
    })
  ),
  pagination: PropTypes.shape({
    currentPage: PropTypes.number,
    limit: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
  count: PropTypes.number,
  isLoading: PropTypes.bool,
  showLoader: PropTypes.bool,
  onView: PropTypes.func,
  onSorting: PropTypes.func,
  Sl: PropTypes.bool,
};

CustomTable.defaultProps = {
  data: [],
  columns: [],
  pagination: { currentPage: 1, limit: 10 },
  onPageChange: () => { },
  count: 0,
  isLoading: false,
  showLoader: false,
  onView: undefined,
  onSorting: undefined,
  Sl: false,
};

export default CustomTable;
