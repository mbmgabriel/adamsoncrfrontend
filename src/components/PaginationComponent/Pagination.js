import React from "react";

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
          onClick={() => handleClick(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          {"<"}
        </button>

        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <span key={idx}>...</span>
          ) : (
            <button
              key={p}
              onClick={() => handleClick(p)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: p === currentPage ? "bold" : "normal",
                textDecoration: p === currentPage ? "underline" : "none"
              }}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => handleClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          {">"}
        </button>
      </div>

      <div className="total-pages">
        Showing {showingCount} of {totalItems}
      </div>
    </div>
  );
};

export default Pagination;



// reuse
// const [page, setPage] = useState(1);
// const pageSize = 15;
// const totalItems = 60;
// const totalPages = Math.ceil(totalItems / pageSize);

{/* <Pagination
  currentPage={page}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={setPage}
/> */}