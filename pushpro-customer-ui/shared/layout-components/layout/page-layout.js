import React, { useEffect, useState } from "react";
import Header from "../header/header";
import Sidebar from "../sidebar/sidebar";
import Switcher from "../switcher/switcher";
import Footer from "../footer/footer";
import { Provider } from "react-redux";
import store from "../../redux/store";
import TabToTop from "../tab-to-top/tab-to-top";

const PageLayout = ({ children }) => {
  const [lateLoad, setlateLoad] = useState(false);
  const Add = () => {
    document.querySelector("body")?.classList.remove("error-1");
    document.querySelector("body")?.classList.remove("landing-body");
  };

  useEffect(() => {
    Add();
    setlateLoad(true);
  });
  const [MyclassName, setMyClass] = useState("");

  const Bodyclickk = () => {
    if (localStorage.getItem("ynexverticalstyles") == "icontext") {
      setMyClass("");
    }
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
              <div className="">{children}</div>
            </div>
            <Footer />
          </div>
          <TabToTop />
        </div>
      </Provider>
    </>
  );
};
export default PageLayout;
