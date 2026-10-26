import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

const Pagination = ({ currentPage, totalPages, onPageChange, pageSize, totalItems }) => {
  const pageCount = Math.max(1, totalPages);

  const handleClick = (page) => {
    if (page > 0 && page <= pageCount && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    let pages = [];

    if (pageCount <= 5) {
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, "...", pageCount];
      } else if (currentPage >= pageCount - 2) {
        pages = [1, "...", pageCount - 2, pageCount - 1, pageCount];
      } else {
        pages = [1, "...", currentPage, "...", pageCount];
      }
    }

    return pages;
  };

  const showingCount = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pagination" role="navigation" aria-label="Table pagination">
      <div className="pages">
        <button
          type="button"
          className="pagination-button"
          onClick={() => handleClick(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <MdChevronLeft aria-hidden="true" />
        </button>

        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <span key={idx}>...</span>
          ) : (
            <button
              type="button"
              key={p}
              className={`pagination-button${p === currentPage ? " pagination-button--active" : ""}`}
              onClick={() => handleClick(p)}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className="pagination-button"
          onClick={() => handleClick(currentPage + 1)}
          disabled={currentPage >= pageCount}
          aria-label="Next page"
        >
          <MdChevronRight aria-hidden="true" />
        </button>
      </div>

      <div className="total-pages">
        Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}-{showingCount} of {totalItems} · {pageSize} per page
      </div>
    </div>
  );
};

export default Pagination;
