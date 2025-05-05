import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Dropdown,
  Form,
  ListGroup,
  Modal
} from "react-bootstrap";
import Link from "next/link";
import { MENUITEMS } from "../sidebar/nav";
import { ThemeChanger } from "../../redux/action";
import { connect } from "react-redux";
import store from "../../redux/store";
import { Data1, Data2, Data3 } from "../header/headerdata";
import NotificationData from "../../data/json/notificationData.json";
import { assetPrefix } from "../../../next.config";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import useService from "@/hooks/useService";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

let localStorageProfile;
let quickcall;
const Header = ({ local_varaiable, ThemeChanger }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [renderCount, setRenderCount] = useState(0);
  const [userData, setUserData] = useState({});

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    localStorage.setItem("selectedLanguage", language);
    i18n.changeLanguage(language);
    router.push(router.asPath, undefined, { locale: language });
  };

  useEffect(() => {
    const storedLanguage = localStorage.getItem("selectedLanguage");
    if (storedLanguage) {
      setSelectedLanguage(storedLanguage);
      i18n.changeLanguage(storedLanguage);
    }
  }, [renderCount]);

  useEffect(() => {
    if (renderCount < 3) {
      setRenderCount((count) => count + 1);
    }
  }, []);

  // const handleLanguageChange = (language) => {
  //     i18n.changeLanguage(language);
  // };
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";
  const [showa1, setShowa1] = useState(true);
  const toggleShowa1 = () => setShowa1(!showa1);

  const [showa2, setShowa2] = useState(true);
  const toggleShowa2 = () => setShowa2(!showa2);

  const [showa3, setShowa3] = useState(true);
  const toggleShowa3 = () => setShowa3(!showa3);

  const [show1, setShow1] = useState(false);
  const [InputValue, setInputValue] = useState("");
  const [show2, setShow2] = useState(false);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [NavData, setNavData] = useState([]);
  const [searchcolor, setsearchcolor] = useState("text-dark");
  const [searchval, setsearchval] = useState("Type something");
  const service = useService();
  const { handleErrorDialog, handleSuccessDialog } = service;
  const [Data, setData] = useState(Data1);
  const [Dataa, setDataa] = useState(NotificationData);
  const [searchdata, setSearchdata] = useState(Data3);
  const [quickNotifications, setQuickNotifications] = useState([]);

  // function handleDelete(id) {
  //   const updatedInvoiceData = Data.filter((idx) => idx.id !== id);
  //   setData(updatedInvoiceData);
  // }
  // function handleDelete1(id) {
  //   const updatedInvoiceDataa = Dataa.filter((idx) => idx.id !== id);
  //   setDataa(updatedInvoiceDataa);
  // }
  // function handleDelete2(id) {
  //   const updatedInvoicesearchdata = searchdata.filter((idx) => idx.id !== id);
  //   setSearchdata(updatedInvoicesearchdata);
  // }

  quickcall = async () => {
    try {
      const response = await service.get("/quick-notification");
      if (response?.success) {
        setQuickNotifications(response?.data);
      }
    } catch (error) {
      console.error("Error fetching quick notifications:", error);
    }
  };

  useEffect(() => {
    quickcall();
    const interval = setInterval(() => {
      quickcall();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  //Dark Model
  const ToggleDark = () => {
    ThemeChanger({
      ...local_varaiable,
      dataThemeMode: local_varaiable.dataThemeMode == "dark" ? "light" : "dark",
      dataHeaderStyles:
        local_varaiable.dataHeaderStyles == "dark" ? "light" : "dark",
      dataMenuStyles:
        local_varaiable.dataNavLayout == "horizontal"
          ? local_varaiable.dataMenuStyles == "dark"
            ? "light"
            : "dark"
          : "dark"
    });
    const theme = store.getState();
    if (theme.dataThemeMode != "dark") {
      ThemeChanger({
        ...theme,
        bodyBg1: "",
        bodyBg2: "",
        darkBg: "",
        inputBorder: "",
        dataHeaderStyles: ""
      });
      localStorage.removeItem("ynexdarktheme");
      localStorage.removeItem("darkBgRGB1");
      localStorage.removeItem("darkBgRGB2");
      localStorage.removeItem("darkBgRGB3");
      localStorage.removeItem("ynexMenu");
      localStorage.removeItem("ynexHeader");
    } else {
      localStorage.setItem("ynexdarktheme", "dark");
    }
  };

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const element = document.documentElement;
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement
    ) {
      // Enter fullscreen mode
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const fullscreenChangeHandler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", fullscreenChangeHandler);
    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChangeHandler);
    };
  }, []);

  const handleLogout = () => {
    router.push("/login");
    localStorage.clear();
  };

  const myfunction = (inputvalue) => {
    document.querySelector(".search-result")?.classList.remove("d-none");
    const i = [];
    const allElement2 = [];
    MENUITEMS.map((mainlevel) => {
      if (mainlevel.Items) {
        setShow1(true);
        mainlevel.Items.map((sublevel) => {
          if (sublevel.children) {
            sublevel.children.map((sublevel1) => {
              i.push(sublevel1);
              if (sublevel1.children) {
                sublevel1.children.map((sublevel2) => {
                  i.push(sublevel2);
                  return sublevel2;
                });
              }
              return sublevel1;
            });
          }
          return sublevel;
        });
      }
      return mainlevel;
    });
    for (const allElement of i) {
      if (allElement.title.toLowerCase().includes(inputvalue.toLowerCase())) {
        if (
          allElement.title.toLowerCase().startsWith(inputvalue.toLowerCase())
        ) {
          setShow2(true);
          allElement2.push(allElement);
        }
      }
    }
    if (!allElement2.length || inputvalue === "") {
      if (inputvalue === "") {
        setShow2(false);
        setsearchval("Type something");
        setsearchcolor("text-dark");
      }
      if (!allElement2.length) {
        setShow2(false);
        setsearchcolor("text-danger");
        setsearchval("There is no component with this name");
      }
    }
    setNavData(allElement2);
  };

  const Switchericon = () => {
    document.querySelector(".offcanvas-end")?.classList.toggle("show");
    const Rightside = document.querySelector(".offcanvas-end");
    if (
      document.querySelector(".switcher-backdrop")?.classList.contains("d-none")
    ) {
      document.querySelector(".switcher-backdrop")?.classList.add("d-block");
      document.querySelector(".switcher-backdrop")?.classList.remove("d-none");
    }
  };

  const removeItem = (itemToRemove) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemToRemove.id);
    setCartItems(updatedCart);
  };

  const toggleSidebar = () => {
    const theme = store.getState();
    let sidemenuType = theme.dataNavLayout;
    if (window.innerWidth >= 992) {
      if (sidemenuType === "vertical") {
        let verticalStyle = theme.dataVerticalStyle;
        let navStyle = theme.dataNavStyle;
        switch (verticalStyle) {
          // closed
          case "closed":
            ThemeChanger({ ...theme, dataNavStyle: "" });
            if (theme.toggled === "close-menu-close") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "close-menu-close" });
            }
            break;
          // icon-overlay
          case "overlay":
            ThemeChanger({ ...theme, dataNavStyle: "" });
            if (theme.toggled === "icon-overlay-close") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              if (window.innerWidth >= 992) {
                ThemeChanger({ ...theme, toggled: "icon-overlay-close" });
              }
            }
            break;
          // icon-text
          case "icontext":
            ThemeChanger({ ...theme, dataNavStyle: "" });
            if (theme.toggled === "icon-text-close") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "icon-text-close" });
            }
            break;
          // doublemenu
          case "doublemenu":
            ThemeChanger({ ...theme, dataNavStyle: "" });
            if (theme.toggled === "double-menu-open") {
              ThemeChanger({ ...theme, toggled: "double-menu-close" });
            } else {
              let sidemenu = document.querySelector(".side-menu__item.active");
              if (sidemenu) {
                ThemeChanger({ ...theme, toggled: "double-menu-open" });
                if (sidemenu.nextElementSibling) {
                  sidemenu.nextElementSibling.classList.add(
                    "double-menu-active"
                  );
                } else {
                  ThemeChanger({ ...theme, toggled: "" });
                }
              }
            }
            // doublemenu(ThemeChanger);
            break;
          // detached
          case "detached":
            if (theme.toggled === "detached-close") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "detached-close" });
            }
            break;
          // default
          case "default":
            ThemeChanger({ ...theme, toggled: "" });
        }
        switch (navStyle) {
          case "menu-click":
            if (theme.toggled === "menu-click-closed") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "menu-click-closed" });
            }
            break;
          // icon-overlay
          case "menu-hover":
            if (theme.toggled === "menu-hover-closed") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "menu-hover-closed" });
            }
            break;
          case "icon-click":
            if (theme.toggled === "icon-click-closed") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "icon-click-closed" });
            }
            break;
          case "icon-hover":
            if (theme.toggled === "icon-hover-closed") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "icon-hover-closed" });
            }
            break;
        }
      }
    } else {
      const theme = store.getState();
      if (theme.toggled === "close") {
        ThemeChanger({ ...theme, toggled: "open" });
        setTimeout(() => {
          if (theme.toggled == "open") {
            document
              .querySelector("#responsive-overlay")
              ?.classList.add("active");
            document
              .querySelector("#responsive-overlay")
              .addEventListener("click", () => {
                document
                  .querySelector("#responsive-overlay")
                  .classList.remove("active");
                menuClose();
              });
          }
          window.addEventListener("resize", () => {
            if (window.screen.width >= 992) {
              document
                .querySelector("#responsive-overlay")
                ?.classList.remove("active");
            }
          });
        }, 100);
      } else {
        ThemeChanger({ ...theme, toggled: "close" });
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const windowObject = window;
      if (windowObject.innerWidth <= 991) {
        // ThemeChanger({ ...local_varaiable, "toggled": "close" })
      } else {
        // ThemeChanger({...local_varaiable,"toggled":""})
      }
    };
    handleResize(); // Check on component mount
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const [cartItems, setCartItems] = useState([...Data]);
  const [cartItemCount, setCartItemCount] = useState(Data.length);
  const handleRemove = (itemId) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);
    setCartItemCount(updatedCart.length);
  };

  const [notifications, setNotifications] = useState([...NotificationData]);

  const handleNotificationClose = async (notifiation_id, project_id) => {
    try {
      const response = await service.patch(
        `/update-notification/${notifiation_id}`,
        {
          project_id,
          is_read: true
        }
      );
      quickcall();
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const [showDropdown, setShowDropdown] = useState(false);
  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Set user data from localStorage
  localStorageProfile = () => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const user = JSON.parse(userData);
      const firstName = user.first_name;
      const lastName = user.last_name;
      const profileUrl = user.profile_url;
      setUserData({
        firstName: firstName,
        lastName: lastName,
        profileUrl: profileUrl
      });
    }
  };

  useEffect(() => {
    localStorageProfile();
  }, []);

  const truncateName = (firstName, lastName, maxLength = 10) => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName.length > maxLength) {
      return fullName.slice(0, maxLength) + "...";
    }
    return fullName;
  };

  const [isMobile, setIsMobile] = useState(false);

  const updateIsMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => {
      window.removeEventListener("resize", updateIsMobile);
    };
  }, []);

  return (
    <>
      <header className="app-header">
        <div className="main-header-container container-fluid">
          <div className="header-content-left">
            <div className="header-element">
              <div className="horizontal-logo">
                <Link href="/dashboard" className="header-logo">
                  {isMobile ? (
                    <img
                      src={`${assetPrefix}/assets/images/brand-logos/toggle-dark.png`}
                      alt="logo"
                      className="toggle-logo"
                    />
                  ) : (
                    <img
                      src={`${assetPrefix}/assets/images/brand-logos/dark-logo.png`}
                      alt="logo"
                      className="toggle-logo"
                    />
                  )}
                </Link>
              </div>
            </div>
            <div className="header-element">
              <Link
                aria-label="Hide Sidebar"
                onClick={() => toggleSidebar()}
                className="sidemenu-toggle header-link animated-arrow hor-toggle horizontal-navtoggle"
                data-bs-toggle="sidebar"
                href="#"
              >
                <span></span>
              </Link>
            </div>
          </div>
          <div className="header-content-right">
            {/* Notificaton icon */}
            <Dropdown
              className="header-element notifications-dropdown"
              autoClose="outside"
              show={showDropdown}
              ref={dropdownRef}
            >
              <Dropdown.Toggle
                as="a"
                variant=""
                className="header-link dropdown-toggle"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                id="messageDropdown"
                onClick={handleToggleDropdown}
                aria-expanded={showDropdown ? "true" : "false"}
              >
                <i className="bx bx-bell header-link-icon"></i>
                <span
                  className="badge bg-secondary rounded-pill header-icon-badge pulse pulse-secondary"
                  id="notification-icon-badge"
                >
                  {`${quickNotifications?.length ?? 0}`}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu
                align="end"
                className="main-header-dropdown dropdown-menu dropdown-menu-end"
                style={{ marginRight: "-10px" }}
                data-popper-placement="none"
              >
                <div className="p-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="mb-0 fs-17 fw-semibold">
                      {t("notificationForm.notificationTitle")}
                    </p>
                    <span
                      className="badge bg-secondary-transparent"
                      id="notifiation-data"
                    >
                      {`${quickNotifications?.length} Unread`}
                    </span>
                  </div>
                </div>
                <Dropdown.Divider className="dropdown-divider"></Dropdown.Divider>
                <ul
                  className="list-unstyled mb-0"
                  id="header-notification-scroll"
                >
                  <PerfectScrollbar style={{ height: "200px" }}>
                    {quickNotifications?.length === 0 ? (
                      <div className="text-center mt-4">
                        <span className="avatar avatar-xl avatar-rounded bg-secondary-transparent">
                          <i className="ri-notification-off-line fs-2"></i>
                        </span>
                        <h6 className="fw-semibold mt-3">
                          No New Notifications
                        </h6>
                      </div>
                    ) : (
                      quickNotifications?.map((notification, index) => (
                        <Dropdown.Item
                          as="li"
                          className="dropdown-item"
                          key={notification?.id}
                        >
                          <div className="d-flex align-items-start">
                            <div className="pe-2">
                              <span
                                className={`avatar avatar-md bg-warning-transparent avatar-rounded`}
                              >
                                <i className={`ti ti-circle-check fs-18`}></i>
                              </span>
                            </div>
                            <div className="flex-grow-1 d-flex align-items-center justify-content-between text-wrap">
                              <div>
                                <p className="mb-0 fw-semibold">
                                  <Link href={`/notifications`}>
                                    {notification?.type?.title}
                                  </Link>
                                </p>
                                <span className="text-muted fw-normal fs-12 header-notification-text">
                                  {t("project.projectTitle")} :{" "}
                                  {notification?.project?.title.length > 16
                                    ? notification?.project?.title.substring(
                                        0,
                                        16
                                      ) + "..."
                                    : notification?.project?.title}
                                </span>
                                <div className="text-muted fw-normal fs-12 header-notification-text">
                                  {t("customer.customerName")} :{" "}
                                  {truncateName(
                                    `${notification?.project?.customer?.first_name} ${notification?.project?.customer?.last_name}`
                                  )}
                                </div>
                                {notification?.link && (
                                  <div
                                    className="text-muted fw-normal fs-12 header-notification-text"
                                    onClick={() =>
                                      handleNotificationClose(
                                        notification?.id,
                                        notification?.project?.id
                                      )
                                    }
                                  >
                                    <a
                                      href={notification?.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-info"
                                    >
                                      {" "}
                                      <i className="bi bi-box-arrow-up-right"></i>
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <Link
                                href="#"
                                className="min-w-fit-content text-muted me-1 dropdown-item-close1"
                                onClick={() =>
                                  handleNotificationClose(
                                    notification?.id,
                                    notification?.project?.id
                                  )
                                }
                              >
                                <i className="ti ti-x fs-16"></i>
                              </Link>
                            </div>
                          </div>
                        </Dropdown.Item>
                      ))
                    )}
                  </PerfectScrollbar>
                </ul>
                <div
                  className={`p-3 empty-header-item1 border-top ${
                    notifications?.length === 0 ? "d-none" : "d-block"
                  }`}
                >
                  <div className="d-grid">
                    <Link
                      href={`/notifications`}
                      className="btn btn-primary"
                      onClick={() => setShowDropdown(false)}
                    >
                      {t("buttons.viewAll")}
                    </Link>
                  </div>
                </div>
                <div
                  className={`p-5 empty-item1 ${
                    notifications?.length === 0 ? "d-block" : "d-none"
                  }`}
                >
                  <div className="text-center">
                    <div className="d-grid">
                      <Link
                        href={`/notifications`}
                        className="btn btn-primary"
                        onClick={() => setShowDropdown(false)}
                      >
                        {t("buttons.viewAll")}
                      </Link>
                    </div>
                  </div>
                </div>
              </Dropdown.Menu>
            </Dropdown>
            {/* Theme toggle */}
            <Dropdown className="header-element country-selector">
              <Dropdown.Toggle
                as="a"
                className="header-link dropdown-toggle no-caret"
                data-bs-auto-close="outside"
                data-bs-toggle="dropdown"
              >
                <img
                  src={`${assetPrefix}/assets/images/flags/${
                    selectedLanguage === "es" ? "spain" : "us"
                  }_flag.jpg`}
                  alt="img"
                  className="rounded-circle header-link-icon"
                />
              </Dropdown.Toggle>
              <Dropdown.Menu
                className="main-header-dropdown dropdown-menu-end"
                data-popper-placement="none"
              >
                <li>
                  <Dropdown.Item
                    href="#"
                    className={`d-flex align-items-center ${
                      selectedLanguage === "en" ? "selecte-lannguage" : ""
                    }`}
                    onClick={() => handleLanguageChange("en")}
                  >
                    <span className="avatar avatar-xs lh-1 me-2">
                      <img
                        src={`${assetPrefix}/assets/images/flags/us_flag.jpg`}
                        alt="img"
                      />
                    </span>
                    English
                  </Dropdown.Item>
                </li>
                <li>
                  <Dropdown.Item
                    href="#"
                    className={`d-flex align-items-center ${
                      selectedLanguage === "es" ? "selecte-lannguage" : ""
                    }`}
                    onClick={() => handleLanguageChange("es")}
                  >
                    <span className="avatar avatar-xs lh-1 me-2">
                      <img
                        src={`${assetPrefix}/assets/images/flags/spain_flag.jpg`}
                        alt="img"
                      />
                    </span>
                    Spanish
                  </Dropdown.Item>
                </li>
              </Dropdown.Menu>
            </Dropdown>
            <div className="header-element header-theme-mode">
              <Link
                href="#"
                className="header-link layout-setting"
                onClick={() => ToggleDark()}
              >
                <span className="light-layout">
                  <i className="bx bx-moon header-link-icon"></i>
                </span>
                <span className="dark-layout">
                  <i className="bx bx-sun header-link-icon"></i>
                </span>
              </Link>
            </div>
            {/* My Profile Drop-Down */}
            <Dropdown className="header-element profile-dropdown">
              <Dropdown.Toggle
                as="span"
                className="header-link no-caret"
                id="mainHeaderProfile"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                aria-expanded="false"
              >
                <div className="d-flex align-items-center">
                  <div className="me-sm-2 me-0">
                    <img
                      src={
                        userData?.profileUrl
                          ? `${s3BasePath}${userData.profileUrl}`
                          : `${assetPrefix}/assets/images/faces/1.jpg`
                      }
                      alt="img"
                      width="32"
                      height="32"
                      className="rounded-circle"
                    />
                  </div>
                  <div className="d-sm-block d-none">
                    <p className="fw-semibold mb-0 lh-1">
                      {truncateName(userData?.firstName, userData?.lastName)}
                    </p>
                    {/* <span className="op-7 fw-normal d-block fs-11">Contractor</span> */}
                  </div>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu
                className="main-header-dropdown pt-0 overflow-hidden header-profile-dropdown dropdown-menu-end"
                aria-labelledby="mainHeaderProfile"
              >
                <Dropdown.Item
                  as="button"
                  onClick={() => router.push("/myprofile")}
                >
                  <i className="ti ti-user-circle fs-18 me-2 op-7"></i>
                  {t("profile.myProfile")}
                </Dropdown.Item>
                <Dropdown.Item as="button" onClick={handleLogout}>
                  <i className="ti ti-logout fs-18 me-2 op-7"></i>
                  {t("profile.logout")}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <div className="header-element">
              <Link
                href="#"
                className="header-link switcher-icon"
                data-bs-toggle="offcanvas"
                data-bs-target="#switcher-canvas"
                onClick={() => Switchericon()}
              >
                <i className="bx bx-cog header-link-icon"></i>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <Modal
        className="modal fade"
        id="searchModal"
        tabIndex="-1"
        aria-labelledby="searchModal"
        aria-hidden="true"
        show={show}
        onHide={handleClose}
      >
        <Modal.Body>
          <div className="input-group">
            <Link href="#" className="input-group-text" id="Search-Grid">
              <i className="fe fe-search header-link-icon fs-18"></i>
            </Link>
            <Form.Control
              type="search"
              className="form-control border-0 px-2"
              placeholder="Search"
              aria-label="Username"
              defaultValue={InputValue}
              autoComplete="off"
              onChange={(ele) => {
                myfunction(ele.target.value);
                setInputValue(ele.target.value);
              }}
            />
            <Link href="#" className="input-group-text" id="voice-search">
              <i className="fe fe-mic header-link-icon"></i>
            </Link>
            {/* <Dropdown>
              <Dropdown.Toggle
                as="a"
                className="btn btn-light btn-icon no-caret rounded-0"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fe fe-more-vertical"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu as="ul">
                <Dropdown.Item as="li" href="#">
                  Action
                </Dropdown.Item>
                <Dropdown.Item as="li" href="#">
                  Another action
                </Dropdown.Item>
                <Dropdown.Item as="li" href="#">
                  Something else here
                </Dropdown.Item>
                <Dropdown.Divider as="li">
                  <hr className="dropdown-divider" />
                </Dropdown.Divider>
                <Dropdown.Item as="li" href="#">
                  Separated link
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown> */}
          </div>
          {show1 ? (
            <Card className=" search-result position-relative z-index-9 search-fix  border mt-1 w-100">
              <Card.Header className="border-bottom">
                <div className="me-2 text-break card-title mb-0">
                  Search result of {InputValue}
                </div>
              </Card.Header>
              <ListGroup className="p-3">
                {show2 ? (
                  NavData.map((e) => (
                    <ListGroup.Item key={Math.random()} className="">
                      <Link
                        href={`${e.path}/`}
                        className="search-result-item"
                        onClick={() => {
                          setShow1(false), setInputValue("");
                        }}
                      >
                        {e.title}
                      </Link>
                    </ListGroup.Item>
                  ))
                ) : (
                  <b className={`px-3 ${searchcolor} `}>{searchval}</b>
                )}
              </ListGroup>
            </Card>
          ) : (
            ""
          )}
          <div className="mt-4">
            <p className="font-weight-semibold text-muted mb-2">
              Are You Looking For...
            </p>
            <span className="search-tags">
              <i className="fe fe-user me-2"></i>People
              <Link href="#" className="tag-addon">
                <i className="fe fe-x"></i>
              </Link>
            </span>
            <span className="search-tags">
              <i className="fe fe-file-text me-2"></i>Pages
              <Link href="#" className="tag-addon">
                <i className="fe fe-x"></i>
              </Link>
            </span>
            <span className="search-tags">
              <i className="fe fe-align-left me-2"></i>Articles
              <Link href="#" className="tag-addon">
                <i className="fe fe-x"></i>
              </Link>
            </span>
            <span className="search-tags">
              <i className="fe fe-server me-2"></i>Tags
              <Link href="#" className="tag-addon">
                <i className="fe fe-x"></i>
              </Link>
            </span>
          </div>
          <div className="my-4">
            <p className="font-weight-semibold text-muted mb-2">
              Recent Search :
            </p>
            <Alert
              variant=""
              className="p-2 border br-5 d-flex align-items-center text-muted mb-2 alert"
              show={showa1}
            >
              <Link href="#">
                <span>Notifications</span>
              </Link>
              <Link
                className="ms-auto lh-1"
                href="#"
                data-bs-dismiss="alert"
                aria-label="Close"
                onClick={toggleShowa1}
              >
                <i className="fe fe-x text-muted"></i>
              </Link>
            </Alert>
            <Alert
              variant=""
              className="p-2 border br-5 d-flex align-items-center text-muted mb-2 alert"
              show={showa2}
            >
              <Link href="#">
                <span>Alerts</span>
              </Link>
              <Link
                className="ms-auto lh-1"
                href="#"
                data-bs-dismiss="alert"
                aria-label="Close"
                onClick={toggleShowa2}
              >
                <i className="fe fe-x text-muted"></i>
              </Link>
            </Alert>
            <Alert
              variant=""
              className="p-2 border br-5 d-flex align-items-center text-muted mb-0 alert"
              show={showa3}
            >
              <Link href="#">
                <span>Mail</span>
              </Link>
              <Link
                className="ms-auto lh-1"
                href="#"
                data-bs-dismiss="alert"
                aria-label="Close"
                onClick={toggleShowa3}
              >
                <i className="fe fe-x text-muted"></i>
              </Link>
            </Alert>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ButtonGroup className="btn-group ms-auto">
            <Button
              variant="primary-light"
              className="btn btn-sm btn-primary-light"
            >
              Search
            </Button>
            <Button variant="primary" className="btn btn-sm btn-primary">
              Clear Recents
            </Button>
          </ButtonGroup>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  local_varaiable: state
});

export { localStorageProfile, quickcall };
export default connect(mapStateToProps, { ThemeChanger })(Header);
