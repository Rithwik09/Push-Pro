import React, { useEffect, useState } from "react";
import Header from "../header/header";
import Sidebar from "../sidebar/sidebar";
import Switcher from "../switcher/switcher";
import Footer from "../footer/footer";
import { Provider } from "react-redux";
import store from "../../redux/store";
import TabToTop from "../tab-to-top/tab-to-top";
import Joyride from "react-joyride";
import useService from "@/hooks/useService";

const ContentLayout = ({ children }) => {
  const [lateLoad, setlateLoad] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);
  const [isClient, setIsClient] = useState(false);

  const service = useService();

  const Add = () => {
    document.querySelector("body")?.classList.remove("error-1");
    document.querySelector("body")?.classList.remove("landing-body");
  };

  useEffect(() => {
    Add();
    setlateLoad(true);
  });

  const Isguided = async () => {
    try {
      const response = await service.get("/myprofile/joyride");
      if (response?.success) {
        setShowTour(!response.data.is_guided);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    Isguided();
    setIsClient(true);
  }, []);

  const handleTourEnd = async (data) => {
    if (data.action === "reset") {
      const response = await service.patch("/myprofile/endtour", {
        joyride: true
      });
      if (response?.success) {
        setShowTour(!response.data.is_guided);
      }
    }
  };

  useEffect(() => {
    setTourSteps([
      {
        target: ".sidemenu-toggle",
        content:
          "Here you can open the sidebar where you can navigate through different sections of the application.",
        disableBeacon: true
      },
      {
        target: ".notifications-dropdown",
        content: "Here you can see your notifications"
      },
      {
        target: ".profile-dropdown",
        content: "Access your profile options here"
      }
    ]);
  }, []);

  const [myclass, setMyClass] = useState("");

  const Bodyclickk = () => {
    if (localStorage.getItem("ynexverticalstyles") == "icontext") {
      setMyClass("");
    }
    if (localStorage.ynexverticalstyles === "detached") {
      document.querySelector("html").setAttribute("data-icon-overlay", "close");
    }
    document.querySelector(".main-menu").addEventListener("click", function () {
      const htmlElement = document.querySelector("html");
      const currentAttribute = htmlElement.getAttribute("data-icon-overlay");
      const updatedValue =
        currentAttribute === "close" ? "open" : "close" ? "open" : "close";
      htmlElement.setAttribute("data-icon-overlay", updatedValue);
    });
    if (localStorage.ynexverticalstyles === "overlay") {
      document.querySelector("html").setAttribute("data-icon-overlay", "close");
    }
    document.querySelector(".main-menu").addEventListener("click", function () {
      const htmlElement = document.querySelector("html");
      const currentAttribute = htmlElement.getAttribute("data-icon-overlay");
      const updatedValue =
        currentAttribute === "close" ? "open" : "close" ? "open" : "close";
      htmlElement.setAttribute("data-icon-overlay", updatedValue);
    });
  };

  useEffect(() => {
    setTimeout(() => {}, 300);
  }, []);
  return (
    <>
      <Provider store={store}>
        <div style={{ display: `${lateLoad ? "block" : "none"}` }}>
          <Switcher />
          <div className="page">
            <Header />
            <Sidebar />
            <div className="main-content app-content" onClick={Bodyclickk}>
              <div className="container-fluid">{children}</div>
            </div>
            <Footer />
          </div>
          <TabToTop />
        </div>
        {isClient && showTour && (
          <Joyride
            steps={tourSteps}
            run={true}
            continuous={true}
            showSkipButton={true}
            scrollToFirstStep={true}
            locale={{
              skip: "Skip All"
            }}
            styles={{
              options: {
                zIndex: 10000
              }
            }}
            callback={handleTourEnd}
          />
        )}
      </Provider>
    </>
  );
};
export default ContentLayout;
