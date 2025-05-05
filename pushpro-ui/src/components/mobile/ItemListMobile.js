import React from "react";
import { Card, Form, InputGroup, Button } from "react-bootstrap";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import useItems from "@/hooks/useItems";
import PaginationComponent from "../PaginationComponent";

const ItemListMobile = () => {
  const {
    items,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalitem,
    setTotalPages,
    fetchData,
    reset,
    handleDelete,
    paginate,
    handleEnter
  } = useItems();
  const { t } = useTranslation();
  const router = useRouter();

  const handleAddItemClick = () => {
    router.push("/items/add").then(() => {
      fetchData();
    });
  };

  const handleEdit = (id) => {
    router.push(`/items/edit/${id}`);
  };

  return (
    <>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title>{t("itemsForm.itemTitle")}</Card.Title>
        <div className="prism-toggle">
          <Button
            variant="primary-light"
            className="btn btn-sm"
            aria-controls="example-collapse-text"
            onClick={handleAddItemClick}
          >
            {t("breadCrumb.addItem")}{" "}
            <i class="bi bi-plus-circle ms-2" style={{ fontSize: "16px" }}></i>
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="row gy-2 align-items-center mb-1 p-2 rounded custom-border">
          <div className="col-12">
            <Form.Label htmlFor="search" className="form-label fs-14">
              {t("itemsForm.item")}
            </Form.Label>
            <InputGroup>
              <Form.Control
                type="search"
                className="border text-muted p-2"
                placeholder={t("itemsForm.item")}
                aria-label="search"
                autoComplete="off"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleEnter}
              />
            </InputGroup>
          </div>
          <div className="col-12 postion-relative mt-2">
            <button className="btn btn-primary me-1 mb-1" type="submit">
              {t("project.searchBtn")}
            </button>
            <button
              className="btn btn-primary ms-2 me-2 mb-1"
              type="button"
              onClick={reset}
            >
              {t("project.resetBtn")}
            </button>
          </div>
        </div>
        <div className="row gx-2 align-items-center p-0 ">
          {loading ? (
            <div className="text-center">
              <span className="spinner-grow spinner-grow-sm"></span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center">{t("itemsForm.noData")}</div>
          ) : (
            items.map((item, index) => (
              <div className="col-12 p-0" key={item.itemId}>
                <table className="table table-bordered custom-border text-muted mt-2">
                  <thead>
                    <tr>
                      <th width="30%">{t("general.srNumber")}</th>
                      <td className="d-flex justify-content-between align-items-center">
                        {index + 1}
                        <div className="hstack gap-2 fs-15">
                          <Link
                            href={`/items/edit/${item.itemId}`}
                            onClick={() => handleEdit(item.itemId)}
                            className="btn btn-icon btn-sm btn-primary-transparent rounded-pill"
                          >
                            <i className="ri-edit-line"></i>
                          </Link>
                          <button
                            className="btn btn-icon btn-sm btn-danger-transparent rounded-pill"
                            onClick={() => handleDelete(item.itemId)}
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>{t("itemsForm.category")}</th>
                      <td>{item.category || "No Category"}</td>
                    </tr>
                    <tr>
                      <th>{t("itemsForm.item")}</th>
                      <td>{item.name}</td>
                    </tr>
                    <tr>
                      <th>{t("itemsForm.quantity")}</th>
                      <td>{item.quantity}</td>
                    </tr>
                    <tr>
                      <th>{t("itemsForm.hours")}</th>
                      <td>{item.hours}</td>
                    </tr>
                    <tr>
                      <th>{t("itemsForm.laborCost")}</th>
                      <td>${item.laborCost}</td>
                    </tr>
                    <tr>
                      <th>{t("itemsForm.materialCost")}</th>
                      <td>${item.materialCost}</td>
                    </tr>
                  </thead>
                </table>
              </div>
            ))
          )}
        </div>
        <PaginationComponent
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          totalitem={totalitem}
          setTotalPages={setTotalPages}
          fetchData={fetchData}
          paginate={paginate}
          itemsLength={items.length}
        />
      </Card.Body>
    </>
  );
};

export default ItemListMobile;
