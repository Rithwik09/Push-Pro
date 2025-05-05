import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const PaginationComponent = ({
  currentPage,
  setCurrentPage,
  setPageSize,
  pageSize,
  totalPages,
  setTotalPages,
  paginate,
  fetchData,
  totalitem,
  itemsLength
}) => {
  const { t } = useTranslation();

  return (
    <div className="d-flex justify-content-end align-items-center gap-3 mt-2 flex-wrap">
      <div className="col-auto d-flex align-items-center">
        <span className="form-label text-nowrap me-2 mb-0">
          {t("project.pageSize")}{" "}
        </span>
        <Form.Select
          className="form-label border-2 gap-2 mb-0"
          onChange={(e) => setPageSize(parseInt(e.target.value))}
        >
          {[5, 10, 15].map((size, index) => (
            <option key={index} value={size}>
              {size}
            </option>
          ))}
        </Form.Select>
      </div>
      <div className="col-auto align-items-center">
        <span className="form-label">{`${
          (currentPage || 1 - 1) * pageSize || 5 + 1
        } to ${Math.min(currentPage || 1 * pageSize || 5, totalitem || 0)} of ${
          totalitem || 0
        }`}</span>
      </div>
      <div className="col-auto align-items-center">
        <nav aria-label="Page navigation">
          <ul className="pagination mb-0 d-flex align-items-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <a
                className="page-link border-0"
                href="#"
                aria-label="First"
                onClick={() => paginate(1)}
              >
                <span aria-hidden="true">&laquo;</span>
                <span className="sr-only">First</span>
              </a>
            </li>
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <a
                className="page-link border-0"
                href="#"
                aria-label="Previous"
                onClick={() => paginate(currentPage - 1)}
              >
                <span aria-hidden="true">&lsaquo;</span>
                <span className="sr-only">Previous</span>
              </a>
            </li>
            <li className="disabled">
              <span className="form-label border-0">{`${t(
                "project.pageOf"
              )} ${currentPage} of ${totalPages}`}</span>
            </li>
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <a
                className="page-link border-0"
                href="#"
                aria-label="Next"
                onClick={() => paginate(currentPage + 1)}
              >
                <span aria-hidden="true">&rsaquo;</span>
                <span className="sr-only">Next</span>
              </a>
            </li>
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <a
                className="page-link border-0"
                href="#"
                aria-label="Last"
                onClick={() => paginate(totalPages)}
              >
                <span aria-hidden="true">&raquo;</span>
                <span className="sr-only">Last</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default PaginationComponent;
