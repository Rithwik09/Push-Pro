import React from "react";
import { Card } from "react-bootstrap";
import { useRouter } from "next/router";
import { BsPeople } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { IoIosConstruct } from "react-icons/io";
import { FaHandHoldingDollar } from "react-icons/fa6";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { AiOutlineProject, AiOutlineDollar } from "react-icons/ai";

const SmallCards = ({
  totalProject,
  estimates,
  totalEstimate,
  totalCustomers,
  totalContractor,
  totalEarning
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <div className="row">
      <div
        className="d-flex flex-column flex-md-row gap-4 w-100"
        style={{ overflowX: "auto" }}
      >
        <div className="d-flex flex-column flex-md-row gap-4 w-100 justify-content-around">
          <div className="d-flex flex-row gap-4 w-100">
            <Card
              className="custom-card p-2 btn btn-primary d-flex align-items-center justify-content-between cursor-pointer"
              onClick={() => router.push("/my-contractors/")}
            >
              <div className="text-white">
                <IoIosConstruct className="me-2" style={{ fontSize: "25px" }} />
                <span className="fs-7">{t("dashboard.subContractors")}</span>
              </div>
              <div className="fs-5 fw-bold text-white">
                {typeof totalContractor === "number" ? totalContractor : 0}
              </div>
            </Card>
            <Card
              className="custom-card p-2 bg-primary d-flex align-items-center justify-content-between cursor-pointer"
              onClick={() => router.push("/my-customers/")}
            >
              <div className="text-white">
                <BsPeople className="me-1" style={{ fontSize: "25px" }} />
                <span className="fs-7">{t("dashboard.totalcustomer")}</span>
              </div>
              <div className="fs-5 fw-bold text-white">
                <span className="fs-5 fw-bold">{totalCustomers || 0}</span>
              </div>
            </Card>
          </div>
          <div className="d-flex flex-row gap-4 w-100">
            <Card
              className="custom-card p-2 btn btn-primary d-flex align-items-center justify-content-between cursor-pointer"
              onClick={() => router.push("/myprojects")}
            >
              <div className="text-white">
                <AiOutlineProject
                  className="me-1"
                  style={{ fontSize: "25px" }}
                />
                <span className="fs-7">{t("dashboard.projects")}</span>
              </div>
              <div className="fs-5 fw-bold text-white">{totalProject || 0}</div>
            </Card>
            <Card className="custom-card p-2 bg-primary d-flex align-items-center justify-content-between">
              <div className="text-white">
                <LiaFileInvoiceDollarSolid
                  className="me-1"
                  style={{ fontSize: "30px" }}
                />
                <span className="fs-7">{t("dashboard.estimates")}</span>
              </div>
              <div className="fs-5 fw-bold text-white">{estimates || 0}</div>
            </Card>
          </div>
          <div className="d-flex flex-row gap-4 w-100">
            <Card className="custom-card p-2 bg-primary d-flex align-items-center justify-content-between">
              <div className="text-white d-flex">
                <div>
                  <AiOutlineDollar
                    className="me-2"
                    style={{ fontSize: "33px", paddingLeft: "4px" }}
                  />
                </div>
                <div>
                  <span className="fs-7">{t("dashboard.esTotal")}</span>
                </div>
              </div>
              <div className="fs-5 fw-bold text-white">
                {totalEstimate || 0}
              </div>
            </Card>
            <Card className="custom-card p-2 bg-primary d-flex align-items-center justify-content-between">
              <div className="text-white">
                <FaHandHoldingDollar
                  className="me-2"
                  style={{ fontSize: "30px" }}
                />
                <span className="fs-7">{t("dashboard.earnings")}</span>
              </div>
              <div className="fs-5 fw-bold text-white">{totalEarning || 0}</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SmallCards;
