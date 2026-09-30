import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

const Pagination = ({ currentPage, totalPages, onPageChange, pageSize, totalItems }) => {
  if (totalPages <= 1) return null;

  const handleClick = (page) => {
    if (page > 0 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    let pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, "...", totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, "...", currentPage, "...", totalPages];
      }
    }

    return pages;
  };

  const showingCount = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pagination">
      <div className="pages">
        <button
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
          className="pagination-button"
          onClick={() => handleClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <MdChevronRight aria-hidden="true" />
        </button>
      </div>

      <div className="total-pages">
        Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}-{showingCount} of {totalItems}
      </div>
    </div>
  );
};

export default Pagination;
