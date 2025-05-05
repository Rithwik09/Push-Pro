import React, { useEffect, useState } from "react";
import { Card, Form, InputGroup, Table, Button } from "react-bootstrap";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import useItems from "@/hooks/useItems";
import PaginationComponent from "./PaginationComponent";

const ItemList = () => {
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
    router.push("/items/add");
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
            className="btn-spacing btn btn-sm"
            aria-controls="example-collapse-text"
            onClick={handleAddItemClick}
          >
            {t("breadCrumb.addItem")}{" "}
            <i class="bi bi-plus-circle ms-2" style={{ fontSize: "16px" }}></i>
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="row gy-1 align-items-center border mb-2 p-2 rounded border-2">
          <div className="col-xl-3 col-md-3">
            <Form.Label htmlFor="search" className="fs-14">
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
          <div className="col-xl-3 col-md-3 postion-relative mt-auto">
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
        <div className="row">
          <div className="table-responsive rounded p-0">
            <Table className="table table-bordered border text-muted border-2 rounded">
              <thead>
                <tr>
                  <th>{t("general.srNumber")}</th>
                  <th>{t("itemsForm.category")}</th>
                  <th>{t("itemsForm.item")}</th>
                  <th>{t("itemsForm.quantity")}</th>
                  <th>{t("itemsForm.hours")}</th>
                  <th>{t("itemsForm.laborCost")}</th>
                  <th>{t("itemsForm.materialCost")}</th>
                  <th width="13%">{t("project.tableAction")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center">
                      <span className="spinner-grow spinner-grow-sm"></span>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center">
                      {t("itemsForm.noData")}
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.itemId}>
                      <th scope="row">{index + 1}</th>
                      <th scope="row">{item.category || "No Category"}</th>
                      <th scope="row">{item.name}</th>
                      <th scope="row">{item.quantity}</th>
                      <th scope="row">{item.hours}</th>
                      <th scope="row">${item.laborCost}</th>
                      <th scope="row">${item.materialCost}</th>
                      <td>
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
                  ))
                )}
              </tbody>
            </Table>
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
          </div>
        </div>
      </Card.Body>
    </>
  );
};

export default ItemList;
