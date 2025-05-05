import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import Pageheader from "../../../shared/layout-components/header/pageheader";
import { getDeviceType } from "../../utils/device";
import { useTranslation } from "react-i18next";
import ItemList from "../../components/ItemsList";
import ItemListMobile from "../../components/mobile/ItemListMobile";
const Index = () => {
  const [isMobile, setIsMobile] = useState();
  const [deviceType, setDeviceType] = useState("");
  const { t } = useTranslation();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const type = getDeviceType();
      setDeviceType(type);
    }
  }, []);
  const breadcrumbItems = [
    { url: `${basePath}/dashboard`, title: t("breadCrumb.dashboard") },
    { url: `${basePath}/myprojects`, title: t("breadCrumb.items") }
  ];
  return (
    <>
      <Pageheader breadcrumbItems={breadcrumbItems} />
      <Card className="custom-card mt-4">
        {isMobile ? <ItemListMobile /> : <ItemList />}
      </Card>
    </>
  );
};
Index.layout = "Contentlayout";
export default Index;
