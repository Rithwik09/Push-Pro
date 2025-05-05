import React, { Fragment, useEffect } from "react";
import { Breadcrumb } from "react-bootstrap";

export default function Pageheader(props) {
  const breadcrumbItems = props.breadcrumbItems || [];

  useEffect(() => {
    if (breadcrumbItems.length > 0) {
      const title = breadcrumbItems
        .map((item, index) => {
          return item.title;
        })
        .join(" | ");
      document.title = title;
    }
  }, [breadcrumbItems]);

  return (
    <Fragment>
      <div className="d-flex align-items-center justify-content-end my-4 page-header-breadcrumb">
        <div className="ms-md-1 ms-0">
          <Breadcrumb className="mb-0" bsPrefix="breadcrumb mb-0">
            {breadcrumbItems.map((item, index) => (
              <Breadcrumb.Item
                key={index}
                href={item.url}
                {...(index === breadcrumbItems.length - 1
                  ? { active: true, "aria-current": "page" }
                  : {})}
              >
                <span className="custom-breadcrumb-color fw-bold">{item.title}</span>
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </div>
      </div>
    </Fragment>
  );
}
