import React from "react";
import { Card } from "react-bootstrap";
import Pageheader from "../../../shared/layout-components/header/pageheader";
import SubContractorDetails from "../../components/SubContractorDetails";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const id = router.query.id;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const breadcrumbItems = [
    { url: `${basePath}/dashboard`, title: t("breadCrumb.dashboard") },
    { url: `${basePath}/myprojects`, title: t("breadCrumb.myProjects") },
    {
      url: `${basePath}/view-subcontractor/${id}`,
      title: t("breadCrumb.projectsDetails")
    }
  ];
  return (
    <>
      <Pageheader breadcrumbItems={breadcrumbItems} />
      <Card className="custom-card mt-4">
        <SubContractorDetails id={id} />
      </Card>
    </>
  );
};
Index.layout = "Contentlayout";
export default Index;
