/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import CustomLoader from './CustomLoader';
import NoTableData from './NoTableData';

import '../design/scss/table-common.scss';

import nextIcon from '../assets/images/right.svg';
import prevIcon from '../assets/images/left.svg';
import sortSvg from '../assets/images/sort.svg';

export default function CustomTable({
  data = [],
  columns = [],
  pagination: { currentPage = 1, limit = 10 },
  onPageChange,
  count,
  isLoading,
  showLoader,
  onView,
  onSorting,
  Sl,
}) {
  const [tempCount, setTempCount] = useState(0);

  const [slNo, setSlNo] = useState(1);

  useEffect(() => {
    if (currentPage === 1) setSlNo(1);
  }, [currentPage]);

  useEffect(() => {
    if (!isLoading) {
      setTempCount(count || 0);
    }
  }, [count, isLoading]);
  const totalPages = () => (tempCount ? Math.ceil(tempCount / limit) : 0);
  const renderPagination = () => {
    const onPrevClicked = () => {
      if (currentPage === 1) {
        return;
      }
      const start = (currentPage - 2) * limit + 1;
      setSlNo(start);
      onPageChange(currentPage - 1);
    };

    const onNextClicked = () => {
      if (currentPage === totalPages()) {
        return;
      }
      const start = currentPage * limit + 1;
      setSlNo(start);
      onPageChange(currentPage + 1);
    };

    const onPageNumberClick = (index) => {
      if (currentPage === index) {
        return;
      }
      const start = (index - 1) * limit + 1;
      setSlNo(start);
      onPageChange(index);
    };

    const numbersToShow = () => {
      const pageNumbers = [];
      for (let index = 1; index <= totalPages(); index += 1) {
        const condition =
          index === 1 ||
          index === totalPages() ||
          Math.abs(currentPage - index) < 3 ||
          index === currentPage;
        if (condition) pageNumbers.push(index);
      }
      return pageNumbers;
    };

    const renderPageStart = () => {
      if (currentPage === 1) return 1;
      return limit * (currentPage - 1) + 1;
    };
    const renderPageEnd = () => {
      if (isLoading) return ' ';
      if (limit * currentPage > count) return count;
      return limit * currentPage;
    };
    if (!data?.length && !isLoading) return null;

    return (
      <div className="container-fluid paginations">
        <div className="row">
          <div className="pagination-iiner d-flex">
            {!!count && (
              <div className="result-txt">{`Showing ${renderPageStart()} to ${renderPageEnd()} of ${count} entries`}</div>
            )}
            <nav aria-label="Page navigation example">
              <ul className="pagination justify-content-center">
                <li
                  className="page-item "
                  onClick={() => {
                    if (currentPage !== 1) onPrevClicked();
                  }}
                >
                  <a className="page-link" href="# " aria-label="Previous">
                    <img src={prevIcon} alt="" />
                  </a>
                </li>
                {numbersToShow().map((num) => (
                  <React.Fragment key={`pg${num}`}>
                    {num > 1 && !numbersToShow().includes(num - 1) && (
                      <a
                        href="# "
                        className="page-link cursor-pointer link-dots"
                      >
                        ...
                      </a>
                    )}
                    <li
                      className={`page-item ${num === currentPage && 'active'}`}
                      onClick={() => onPageNumberClick(num)}
                    >
                      <a href="# " className="page-link ">
                        {num}
                      </a>
                    </li>
                  </React.Fragment>
                ))}
                <li
                  className="page-item"
                  onClick={() => {
                    if (currentPage !== totalPages())
                      onNextClicked(currentPage);
                  }}
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
  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="table-wrapper table-responsive ">
            <table className="table table-striped">
              {data?.length > 0 && (
                <thead>
                  <tr>
                    {Sl && <th width="100">Sl.No</th>}
                    {columns?.map(
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
                              onClick={() => onSorting(selector)}
                            >
                              <img src={sortSvg} alt="sort" />
                            </span>
                          )}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
              )}
              {/* {showLoader && <CustomLoader columns={columns} limit={limit} />} */}
              {isLoading ? (
                <CustomLoader columns={columns} limit={limit} />
              ) : !data?.length ? (
                <NoTableData columns={columns} />
              ) : (
                !showLoader && (
                  <tbody>
                    {data?.map((row, index) => (
                      <tr key={`row${row.id} `}>
                        {Sl && <td>{index + slNo}</td>}
                        {columns?.map(
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
                                onClick={() => {
                                  if (notView || !onView) return;
                                  onView(row);
                                }}
                              >
                                <div className={contentClass}>
                                  {cell({ row, selector, ...rest })}
                                </div>
                              </td>
                            ) : (
                              <td
                                className={`${colClassName}${
                                  !notView && onView ? ' cursor-pointer' : ''
                                }`}
                                key={`cell${selector}`}
                                onClick={() => {
                                  if (notView || !onView) return;
                                  onView(row);
                                }}
                              >
                                {row[selector]}
                              </td>
                            ),
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
      {renderPagination() || null}
    </>
  );
}
