import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import Pageheader from "../../../shared/layout-components/header/pageheader";
import ProjectCommunication from "@/components/ProjectCommunication";
import { useRouter } from "next/router";
import { getDeviceType } from "./../../utils/device";
import { useTranslation } from "react-i18next";
import ProjectCommunicationMobile from "@/components/mobile/ProjectCommunicationMobile";

const Index = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const id = router.query.id;
  const [isMobile, setIsMobile] = useState();
  const [deviceType, setDeviceType] = useState("");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 988);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Call getDeviceType only on the client side
    if (typeof window !== "undefined") {
      const type = getDeviceType();
      setDeviceType(type);
    }
  }, []);
  const breadcrumbItems = [
    { url: `${basePath}/dashboard`, title: t("breadCrumb.dashboard") },
    { url: `${basePath}/myprojects`, title: t("breadCrumb.myProjects") },
    {
      url: `${basePath}/project-communication`,
      title: t("breadCrumb.projectCommunication")
    }
  ];
  return (
    <>
      <Pageheader breadcrumbItems={breadcrumbItems} />
      <Card className="custom-card mt-4">
        {isMobile ? (
          <ProjectCommunicationMobile id={id} />
        ) : (
          <ProjectCommunication id={id} />
        )}
        {/* <ProjectCommunication id={id} /> */}
      </Card>
    </>
  );
};
Index.layout = "Contentlayout";
export default Index;
