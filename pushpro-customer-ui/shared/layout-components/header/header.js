import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Dropdown,
  Form,
  ListGroup,
  InputGroup,
  Modal
} from "react-bootstrap";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MENUITEMS } from "../sidebar/nav";
import { ThemeChanger } from "../../redux/action";
import { connect } from "react-redux";
import store from "../../redux/store";
import { Data1, Data2, Data3 } from "../header/headerdata";
import { assetPrefix } from "../../../next.config";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import useService from "@/hooks/useService";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

const Select = dynamic(() => import("react-select"), { ssr: false });

let localStorageProfile;
let quickcall;

const Header = ({ local_varaiable, ThemeChanger }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [renderCount, setRenderCount] = useState(0);
  const [currentContractor, setCurrentContractor] = useState(null);
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: ""
  });

  const truncateName = (firstName, lastName, maxLength = 10) => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName.length > maxLength) {
      return fullName.slice(0, maxLength) + "...";
    }
    return fullName;
  };

  useEffect(() => {
    const currContractor = localStorage.getItem("currentContractor");
    if (currContractor) {
      setCurrentContractor(currContractor);
    }
  }, []);

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
  const [quickNotifications, setQuickNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [contractorList, setContractorList] = useState();
  const [selectedOption, setSelectedOption] = useState();

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

  const toggleSidebar = () => {
    const theme = store.getState();
    let sidemenuType = theme.dataNavLayout;
    if (window.innerWidth >= 992) {
      if (sidemenuType === "vertical") {
        let verticalStyle = theme.dataVerticalStyle;
        let navStyle = theme.dataNavStyle;
        switch (verticalStyle) {
          case "closed":
            ThemeChanger({ ...theme, dataNavStyle: "" });
            if (theme.toggled === "close-menu-close") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "close-menu-close" });
            }
            break;
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
          case "icontext":
            ThemeChanger({ ...theme, dataNavStyle: "" });
            if (theme.toggled === "icon-text-close") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "icon-text-close" });
            }
            break;
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
            break;
          case "detached":
            if (theme.toggled === "detached-close") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "detached-close" });
            }
            break;
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
    handleResize();
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

  const [notifications, setNotifications] = useState([]);

  quickcall = async () => {
    try {
      const response = await service.get("/quick-notification");
      if (response?.success) setQuickNotifications(response?.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    quickcall();

    const interval = setInterval(() => {
      quickcall();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClose = async (notifiation_id, project_id) => {
    try {
      const response = await service.patch(
        `/update-notification/${notifiation_id}`,
        {
          project_id,
          is_read: true
        }
      );
      if (response?.success) {
        quickcall();
      }
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

  useEffect(() => {
    const logoPath = localStorage.getItem("mainLogo");
    setLogoPath(logoPath);
  }, []);

  const [logoPath, setLogoPath] = useState("");

  const renderLogo = () => {
    if (logoPath) {
      return (
        <>
          <img
            src={`${s3BasePath}${logoPath}`}
            alt="logo"
            className="main-logo me-2"
          />
        </>
      );
    } else {
      return (
        <img
          src={`${assetPrefix}/assets/images/brand-logos/toggle-light.png`}
          alt="logo"
          className="main-logo me-2"
        />
      );
    }
  };

  localStorageProfile = () => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const user = JSON.parse(userData);
      const firstName = user.first_name;
      const lastName = user.last_name;
      const profileUrl = user.profile_url;
      setUserData({
        first_name: firstName,
        last_name: lastName,
        profile_url: profileUrl
      });
    }
  };

  useEffect(() => {
    localStorageProfile();
  }, []);

  const handleLogout = () => {
    const keepItems = [
      "currentContractor",
      "ynexMenu",
      "primaryRGB",
      "dynamiccolor",
      "rightSectionImage",
      "contractor_tagline",
      "contractor_description",
      "mainLogo",
      "mainLogoDark",
      "toggleLogo",
      "toggleLogoDark"
    ];
    for (let key in localStorage) {
      if (!keepItems.includes(key)) {
        localStorage.removeItem(key);
      }
    }
    router.push(`/login/${currentContractor}`);
  };

  const contractorCustomer = async () => {
    try {
      const response = await service.get("/contractor-list");
      setContractorList(response?.data);
      if (currentContractor) {
        setSelectedOption(currentContractor);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const contractorOption = contractorList?.map((contractor) => ({
    id: contractor.id,
    value: contractor.user_uuid,
    label: contractor.firstName + " " + contractor.lastName
  }));

  if (contractorOption) {
    const findCurrContractor = contractorOption.find(
      (contractor) => contractor.value === selectedOption
    );
    let currentContractorSelected;
    if (findCurrContractor) {
      currentContractorSelected = {
        id: findCurrContractor.id,
        value: findCurrContractor.value,
        label: findCurrContractor.label
      };
      setSelectedOption(currentContractorSelected);
    }
  }

  const newSwitchedContractor = async (currId) => {
    try {
      const response = await service.get(`get-contractor-branding/${currId}`);
      if (response?.success) {
        const contractorTheme = response?.data?.theme_data;
        localStorage.setItem("currentContractor", currId);
        localStorage.setItem("mainLogo", response?.data.main_logo || "");
        localStorage.setItem(
          "mainLogoDark",
          response?.data.main_logo_dark || ""
        );
        localStorage.setItem("toggleLogo", response?.data.toggle_logo || "");
        localStorage.setItem(
          "toggleLogoDark",
          response?.data.toggle_logo_dark || ""
        );
        if (!contractorTheme || Object.keys(contractorTheme).length === 0) {
          localStorage.setItem("ynexMenu", "color");
          localStorage.setItem("ynexHeader", "color");
          localStorage.setItem("primaryRGB", "152,172,54");
          localStorage.setItem("primaryRGB1", "152,172,54");
          localStorage.setItem("dynamiccolor", "152,172,54");
          localStorage.setItem("ynexmenuscrollable", "MenuFixed");
          localStorage.setItem("ynexheaderscrollable", "FixedHeader");
          localStorage.setItem("ynexlayout", "vertical");
        } else {
          Object.keys(contractorTheme).forEach((key) => {
            localStorage.setItem(key, contractorTheme[key]);
          });
        }
      } else {
        console.error("No data received from API");
      }
    } catch (error) {
      console.error("Error fetching contractor data:", error);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    contractorCustomer();
  };

  const handleSave = () => {
    let selectedContractor;
    if (Array.isArray(selectedOption)) {
      selectedContractor = selectedOption.map((option) => option.value)[0];
    } else if (selectedOption && typeof selectedOption === "object") {
      selectedContractor = selectedOption.value;
    } else {
      selectedContractor = selectedOption;
    }
    if (selectedContractor !== currentContractor) {
      newSwitchedContractor(selectedContractor);
      setShowModal(false);
      router.push("/dashboard");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setShowModal(false);
    }
  };

  const handleModalToggle = () => setShowModal(!showModal);

  return (
    <>
      <header className="app-header">
        <div className="main-header-container container-fluid">
          <div className="header-content-left">
            <div className="header-element">
              <div className="horizontal-logo">
                <Link href="/dashboard" className="header-logo">
                  {renderLogo()}
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
                  {`${
                    quickNotifications?.length ? quickNotifications.length : 0
                  }`}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu
                align="end"
                className="main-header-dropdown dropdown-menu dropdown-menu-end"
                data-popper-placement="none"
              >
                <div className="p-3">
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
                      <div className="text-center">
                        <span className="avatar avatar-xl avatar-rounded bg-secondary-transparent">
                          <i className="ri-notification-off-line fs-2"></i>
                        </span>
                        <h6 className="fw-semibold mt-3">
                          No New Notifications
                        </h6>
                      </div>
                    ) : (
                      quickNotifications.map((notification, index) => (
                        <Dropdown.Item
                          as="li"
                          className="dropdown-item"
                          key={notification.id}
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
                                    {notification.type.title}
                                  </Link>
                                </p>
                                <span className="text-muted fw-normal fs-12 header-notification-text">
                                  Project Title :{" "}
                                  {notification.project.title.length > 16
                                    ? notification.project.title.substring(
                                        0,
                                        16
                                      ) + "..."
                                    : notification.project.title}
                                </span>
                                <div className="text-muted fw-normal fs-12 header-notification-text">
                                  Contractor Name :{" "}
                                  {truncateName(
                                    `${notification.project.contractor.first_name} ${notification.project.contractor.last_name}`
                                  )}
                                </div>
                                {notification.link && (
                                  <div
                                    className="text-muted fw-normal fs-12 header-notification-text"
                                    onClick={() =>
                                      handleNotificationClose(
                                        notification.id,
                                        notification.project.id
                                      )
                                    }
                                  >
                                    Link :{" "}
                                    <a
                                      href={notification.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-info"
                                    >
                                      {" "}
                                      <i className="bi bi-folder-symlink"></i>
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <Link
                                href="#!"
                                className="min-w-fit-content text-muted me-1 dropdown-item-close1"
                                onClick={() =>
                                  handleNotificationClose(
                                    notification.id,
                                    notification.project.id
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
                    notifications.length === 0 ? "d-none" : "d-block"
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
                    notifications.length === 0 ? "d-block" : "d-none"
                  }`}
                >
                  <div className="text-center">
                    <div className="d-grid">
                      <Link
                        href={`/notifications`}
                        className="btn btn-primary"
                        onClick={() => setShowDropdown(false)}
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
              </Dropdown.Menu>
            </Dropdown>
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
                        userData?.profile_url
                          ? `${s3BasePath}${userData?.profile_url}`
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
                      {truncateName(userData?.first_name, userData?.last_name)}
                    </p>
                  </div>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu
                className="main-header-dropdown pt-0 overflow-hidden header-profile-dropdown dropdown-menu-end"
                aria-labelledby="mainHeaderProfile"
              >
                <Dropdown.Item as={Link} href="/myprofile" className="d-flex">
                  <i className="ti ti-user-circle fs-18 me-2 op-7"></i>
                  {t("profile.myProfile")}
                </Dropdown.Item>
                <Dropdown.Item
                  as="button"
                  className="d-flex"
                  onClick={handleOpenModal}
                >
                  <i className="ti ti-replace fs-18 me-2 op-7"></i>
                  {t("profile.switchContractor")}
                </Dropdown.Item>
                <Dropdown.Item
                  as={Link}
                  href={`/login/${currentContractor}`}
                  className="d-flex"
                  onClick={handleLogout}
                >
                  <i className="ti ti-logout fs-18 me-2 op-7"></i>
                  {t("profile.logout")}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
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
            <Link href="#!" className="input-group-text" id="Search-Grid">
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
            <Link href="#!" className="input-group-text" id="voice-search">
              <i className="fe fe-mic header-link-icon"></i>
            </Link>
            <Dropdown>
              <Dropdown.Toggle
                as="a"
                className="btn btn-light btn-icon no-caret rounded-0"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fe fe-more-vertical"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu as="ul">
                <Dropdown.Item as="li" href="#!">
                  Action
                </Dropdown.Item>
                <Dropdown.Item as="li" href="#!">
                  Another action
                </Dropdown.Item>
                <Dropdown.Item as="li" href="#!">
                  Something else here
                </Dropdown.Item>
                <Dropdown.Divider as="li">
                  <hr className="dropdown-divider" />
                </Dropdown.Divider>
                <Dropdown.Item as="li" href="#!">
                  Separated link
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
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
              <Link href="#!" className="tag-addon">
                <i className="fe fe-x"></i>
              </Link>
            </span>
            <span className="search-tags">
              <i className="fe fe-file-text me-2"></i>Pages
              <Link href="#!" className="tag-addon">
                <i className="fe fe-x"></i>
              </Link>
            </span>
            <span className="search-tags">
              <i className="fe fe-align-left me-2"></i>Articles
              <Link href="#!" className="tag-addon">
                <i className="fe fe-x"></i>
              </Link>
            </span>
            <span className="search-tags">
              <i className="fe fe-server me-2"></i>Tags
              <Link href="#!" className="tag-addon">
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
              <Link href="#!">
                <span>Notifications</span>
              </Link>
              <Link
                className="ms-auto lh-1"
                href="#!"
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
              <Link href="#!">
                <span>Alerts</span>
              </Link>
              <Link
                className="ms-auto lh-1"
                href="#!"
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
              <Link href="#!">
                <span>Mail</span>
              </Link>
              <Link
                className="ms-auto lh-1"
                href="#!"
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
      <Modal show={showModal} onHide={handleModalToggle}>
        <Modal.Header closeButton>
          <Modal.Title>{t("profile.switchContractor")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="row g-3">
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("profile.selectContractor")}
              </Form.Label>
              <InputGroup>
                <Select
                  placeholder={t("profile.selectContractor")}
                  isSearchable
                  name="industry"
                  options={contractorOption}
                  value={selectedOption}
                  className="w-100 basic-multi-select"
                  onChange={(selectedLabel) => {
                    setSelectedOption([selectedLabel].map((option) => option));
                  }}
                  menuPlacement="auto"
                  classNamePrefix="Select2"
                />
              </InputGroup>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-primary me-2" onClick={handleSave}>
            {t("buttons.save")}
          </Button>
          <Button
            className="btn btn-danger"
            onClick={() => setShowModal(false)}
          >
            {t("buttons.cancel")}
          </Button>
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
