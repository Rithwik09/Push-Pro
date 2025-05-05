import { Fragment, useEffect } from "react";
import Themeprimarycolor, * as switcherdata from "../../../shared/data/switcherdata/switcherdata";
import { connect } from "react-redux";
import { ThemeChanger } from "../../redux/action";
import { Button, Nav, Tab } from "react-bootstrap";
import Link from "next/link";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
const Switcher = ({ local_varaiable, ThemeChanger }) => {
  useEffect(() => {
    switcherdata.LocalStorageBackup(ThemeChanger);
  }, []);
  const { t } = useTranslation();

  const Switcherclose = () => {
    if (document.querySelector(".offcanvas-end")?.classList.contains("show")) {
      document.querySelector(".offcanvas-end")?.classList.remove("show");
      document.querySelector(".switcher-backdrop")?.classList.remove("d-block");
      document.querySelector(".switcher-backdrop")?.classList.add("d-none");
    }
  };
  const customStyles = ` ${
    local_varaiable.colorPrimaryRgb != ""
      ? `--primary-rgb:${local_varaiable.colorPrimaryRgb}`
      : ""
  };
    ${
      local_varaiable.bodyBg1 != ""
        ? `--body-bg-rgb:${local_varaiable.bodyBg1}`
        : ""
    };
    ${
      local_varaiable.bodyBg2 != ""
        ? `--body-bg-rgb2:${local_varaiable.bodyBg2}`
        : ""
    };
    ${
      local_varaiable.darkBg != ""
        ? `--light-rgb:${local_varaiable.darkBg}`
        : ""
    };
    ${
      local_varaiable.darkBg != ""
        ? `--form-control-bg:rgb(${local_varaiable.darkBg})`
        : ""
    };
    ${
      local_varaiable.inputBorder != ""
        ? `--input-border:rgb(${local_varaiable.inputBorder})`
        : ""
    };`;

  return (
    <Fragment>
      <HelmetProvider>
        <Helmet>
          <html
            dir={local_varaiable.dir}
            data-theme-mode={local_varaiable}
            data-header-styles={local_varaiable.dataHeaderStyles}
            data-vertical-style={local_varaiable.dataVerticalStyle}
            data-nav-layout={local_varaiable.dataNavLayout}
            data-menu-styles={local_varaiable.dataMenuStyles}
            data-toggled={local_varaiable.toggled}
            data-nav-style={local_varaiable.dataNavStyle}
            hor-style={local_varaiable.horStyle}
            data-page-style={local_varaiable.dataPageStyle}
            data-width={local_varaiable.dataWidth}
            data-menu-position={local_varaiable.dataMenuPosition}
            data-header-position={local_varaiable.dataHeaderPosition}
            data-icon-overlay={local_varaiable.iconOverlay}
            data-bg-img={local_varaiable.bgImg}
            data-icon-text={local_varaiable.iconText}
            data-loader={"enabled"}
            style={customStyles}
          ></html>
        </Helmet>
      </HelmetProvider>
      <div
        className="switcher-backdrop d-none"
        onClick={() => {
          Switcherclose();
        }}
      ></div>
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="switcher-canvas"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title text-default" id="offcanvasRightLabel">
            {t("switcherTab.switcher")}
          </h5>
          <Button
            variant=""
            onClick={() => {
              Switcherclose();
            }}
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></Button>
        </div>

        <div className="offcanvas-body">
          <Tab.Container id="left-tabs-example" defaultActiveKey="react">
            <nav className="border-bottom border-block-end-dashed">
              <Nav
                variant="pills"
                className="nav nav-tabs nav-justified switcher-main-tabs"
                id="switcher-main-tab"
                role="tablist"
              >
                <Nav.Item>
                  <Nav.Link className="p-0" eventKey="react">
                    {" "}
                    <Button
                      variant=""
                      className="nav-link"
                      id="switcher-home-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#switcher-home"
                      type="button"
                      role="tab"
                      aria-controls="switcher-home"
                      aria-selected="true"
                    >
                      {t("switcherTab.themeStyles")}
                    </Button>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link className="p-0" eventKey="firebase">
                    <Button
                      variant=""
                      className="nav-link"
                      id="switcher-profile-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#switcher-profile"
                      type="button"
                      role="tab"
                      aria-controls="switcher-profile"
                      aria-selected="false"
                    >
                      Theme Colors
                    </Button>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </nav>
            <Tab.Content className="tab-content" id="nav-tabContent">
              <Tab.Pane eventKey="react">
                <div className="">
                  <p className="switcher-style-head">
                    {t("switcherTab.themeColorMode")}:
                  </p>
                  <div className="row switcher-style gx-0">
                    <div className="col-4">
                      <div className="form-check switch-select">
                        <label
                          className="form-check-label"
                          htmlFor="switcher-light-theme"
                        >
                          {t("switcherTab.light")}
                        </label>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="theme-style"
                          id="switcher-light-theme"
                          checked={local_varaiable.dataThemeMode !== "dark"}
                          onChange={(_e) => {}}
                          onClick={() => switcherdata.Light(ThemeChanger)}
                        />
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="form-check switch-select">
                        <label
                          className="form-check-label"
                          htmlFor="switcher-dark-theme"
                        >
                          {t("switcherTab.dark")}
                        </label>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="theme-style"
                          id="switcher-dark-theme"
                          checked={local_varaiable.dataThemeMode == "dark"}
                          onChange={(_e) => {}}
                          onClick={() => switcherdata.Dark(ThemeChanger)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="">
                  <p className="switcher-style-head">
                    {t("switcherTab.navigationStyles")}:
                  </p>
                  <div className="row switcher-style gx-0">
                    <div className="col-4">
                      <div className="form-check switch-select">
                        <label
                          className="form-check-label"
                          htmlFor="switcher-vertical"
                        >
                          {t("switcherTab.vertical")}
                        </label>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="navigation-style"
                          id="switcher-vertical"
                          checked={local_varaiable.dataNavLayout == "vertical"}
                          onChange={(_e) => {}}
                          onClick={() => switcherdata.Vertical(ThemeChanger)}
                        />
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="form-check switch-select">
                        <label
                          className="form-check-label"
                          htmlFor="switcher-horizontal"
                        >
                          {t("switcherTab.horizontal")}
                        </label>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="navigation-style"
                          checked={
                            local_varaiable.dataNavLayout == "horizontal"
                          }
                          onChange={(_e) => {}}
                          onClick={() =>
                            switcherdata.HorizontalClick(ThemeChanger)
                          }
                          id="switcher-horizontal"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="">
                  <p className="switcher-style-head">
                    {" "}
                    {t("switcherTab.menuPositions")}:
                  </p>
                  <div className="row switcher-style gx-0">
                    <div className="col-4">
                      <div className="form-check switch-select">
                        <label
                          className="form-check-label"
                          htmlFor="switcher-menu-fixed"
                        >
                          {t("switcherTab.fixed")}
                        </label>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="menu-positions"
                          id="switcher-menu-fixed"
                          checked={local_varaiable.dataMenuPosition == "fixed"}
                          onChange={(_e) => {}}
                          onClick={() => switcherdata.FixedMenu(ThemeChanger)}
                        />
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="form-check switch-select">
                        <label
                          className="form-check-label"
                          htmlFor="switcher-menu-scroll"
                        >
                          {t("switcherTab.scrollable")}
                        </label>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="menu-positions"
                          id="switcher-menu-scroll"
                          checked={
                            local_varaiable.dataMenuPosition == "scrollable"
                          }
                          onChange={(_e) => {}}
                          onClick={() => switcherdata.scrollMenu(ThemeChanger)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="">
                  <p className="switcher-style-head">
                    {" "}
                    {t("switcherTab.headerPositions")}:
                  </p>
                  <div className="row switcher-style gx-0">
                    <div className="col-4">
                      <div className="form-check switch-select">
                        <label
                          className="form-check-label"
                          htmlFor="switcher-header-fixed"
                        >
                          {t("switcherTab.fixed")}
                        </label>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="header-positions"
                          id="switcher-header-fixed"
                          checked={
                            local_varaiable.dataHeaderPosition == "fixed"
                          }
                          onChange={(_e) => {}}
                          onClick={() =>
                            switcherdata.Headerpostionfixed(ThemeChanger)
                          }
                        />
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="form-check switch-select">
                        <label
                          className="form-check-label"
                          htmlFor="switcher-header-scroll"
                        >
                          {t("switcherTab.scrollable")}
                        </label>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="header-positions"
                          checked={
                            local_varaiable.dataHeaderPosition == "scrollable"
                          }
                          onChange={(_e) => {}}
                          onClick={() =>
                            switcherdata.Headerpostionscroll(ThemeChanger)
                          }
                          id="switcher-header-scroll"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="firebase">
                <div>
                  <div className="theme-colors">
                    <p className="switcher-style-head">
                      {" "}
                      {t("switcherTab.menuColors")}:
                    </p>
                    <div className="d-flex switcher-style pb-2">
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-white"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Light Menu"
                          type="radio"
                          name="menu-colors"
                          checked={local_varaiable.dataMenuStyles == "light"}
                          onChange={(_e) => {}}
                          onClick={() => switcherdata.lightMenu(ThemeChanger)}
                          id="switcher-menu-light"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-dark"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Dark Menu"
                          type="radio"
                          name="menu-colors"
                          checked={local_varaiable.dataMenuStyles == "dark"}
                          onChange={(_e) => {}}
                          onClick={() => switcherdata.darkMenu(ThemeChanger)}
                          id="switcher-menu-dark"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-primary"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Color Menu"
                          type="radio"
                          name="menu-colors"
                          checked={local_varaiable.dataMenuStyles == "color"}
                          onChange={(_e) => {}}
                          onClick={() => switcherdata.colorMenu(ThemeChanger)}
                          id="switcher-menu-primary"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-gradient"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Gradient Menu"
                          type="radio"
                          name="menu-colors"
                          checked={local_varaiable.dataMenuStyles == "gradient"}
                          onChange={(_e) => {}}
                          onClick={() =>
                            switcherdata.gradientMenu(ThemeChanger)
                          }
                          id="switcher-menu-gradient"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-transparent"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Transparent Menu"
                          checked={
                            local_varaiable.dataMenuStyles == "transparent"
                          }
                          onChange={(_e) => {}}
                          onClick={() =>
                            switcherdata.transparentMenu(ThemeChanger)
                          }
                          type="radio"
                          name="menu-colors"
                          id="switcher-menu-transparent"
                        />
                      </div>
                    </div>
                    <div className="px-4 pb-3 text-muted fs-11">
                      {t("switcherTab.menuColorsNote")}
                    </div>
                  </div>
                  <div className="theme-colors">
                    <p className="switcher-style-head">
                      {t("switcherTab.headerColors")}:
                    </p>
                    <div className="d-flex switcher-style pb-2">
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-white"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Light Header"
                          type="radio"
                          name="header-colors"
                          checked={local_varaiable.dataHeaderStyles == "light"}
                          onChange={(_e) => {}}
                          id="switcher-header-light"
                          onClick={() => switcherdata.lightHeader(ThemeChanger)}
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-dark"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Dark Header"
                          type="radio"
                          name="header-colors"
                          checked={local_varaiable.dataHeaderStyles == "dark"}
                          onChange={(_e) => {}}
                          onClick={() => switcherdata.darkHeader(ThemeChanger)}
                          id="switcher-header-dark"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-primary"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Color Header"
                          type="radio"
                          name="header-colors"
                          checked={local_varaiable.dataHeaderStyles == "color"}
                          onChange={(_e) => {}}
                          onClick={() => switcherdata.colorHeader(ThemeChanger)}
                          id="switcher-header-primary"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-gradient"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Gradient Header"
                          type="radio"
                          name="header-colors"
                          checked={
                            local_varaiable.dataHeaderStyles == "gradient"
                          }
                          onChange={(_e) => {}}
                          onClick={() =>
                            switcherdata.gradientHeader(ThemeChanger)
                          }
                          id="switcher-header-gradient"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-transparent"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Transparent Header"
                          type="radio"
                          name="header-colors"
                          checked={
                            local_varaiable.dataHeaderStyles == "transparent"
                          }
                          onChange={(_e) => {}}
                          onClick={() =>
                            switcherdata.transparentHeader(ThemeChanger)
                          }
                          id="switcher-header-transparent"
                        />
                      </div>
                    </div>
                    <div className="px-4 pb-3 text-muted fs-11">
                      {" "}
                      {t("switcherTab.headerColorsNote")}
                    </div>
                  </div>
                  <div className="theme-colors">
                    <p className="switcher-style-head">
                      {" "}
                      {t("switcherTab.themePrimary")}:
                    </p>
                    <div className="d-flex flex-wrap align-items-center switcher-style">
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-primary-1"
                          type="radio"
                          checked={
                            local_varaiable.colorPrimaryRgb == "58, 88, 146"
                          }
                          onChange={(_e) => {}}
                          onClick={() =>
                            switcherdata.primaryColor1(ThemeChanger)
                          }
                          name="theme-primary"
                          id="switcher-primary"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-primary-2"
                          type="radio"
                          checked={
                            local_varaiable.colorPrimaryRgb == "92, 144, 163"
                          }
                          onChange={(_e) => {}}
                          onClick={() =>
                            switcherdata.primaryColor2(ThemeChanger)
                          }
                          name="theme-primary"
                          id="switcher-primary1"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-primary-3"
                          type="radio"
                          name="theme-primary"
                          checked={
                            local_varaiable.colorPrimaryRgb == "161, 90, 223"
                          }
                          onChange={(_e) => {}}
                          onClick={() =>
                            switcherdata.primaryColor3(ThemeChanger)
                          }
                          id="switcher-primary2"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-primary-4"
                          type="radio"
                          name="theme-primary"
                          checked={
                            local_varaiable.colorPrimaryRgb == "78, 172, 76"
                          }
                          onChange={(_e) => {}}
                          onClick={() =>
                            switcherdata.primaryColor4(ThemeChanger)
                          }
                          id="switcher-primary3"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-primary-5"
                          type="radio"
                          name="theme-primary"
                          checked={
                            local_varaiable.colorPrimaryRgb == "223, 90, 90"
                          }
                          onChange={(_e) => {}}
                          onClick={() =>
                            switcherdata.primaryColor5(ThemeChanger)
                          }
                          id="switcher-primary4"
                        />
                      </div>
                      <div className="form-check switch-select ps-0 mt-1 color-primary-light">
                        <div className="theme-container-primary">
                          <button className="">nano</button>
                        </div>
                        <div className="pickr-container-primary">
                          <div className="pickr">
                            <Button
                              className="pcr-button"
                              onClick={(ele) => {
                                if (ele.target.querySelector("input")) {
                                  ele.target.querySelector("input").click();
                                }
                              }}
                            >
                              <Themeprimarycolor
                                theme={local_varaiable}
                                actionfunction={ThemeChanger}
                              />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab.Pane>
              <div className="d-flex justify-content-between canvas-footer flex-wrap">
                <Link
                  href="#!"
                  id="reset-all"
                  className="btn btn-danger m-1 w-100"
                  onClick={() => switcherdata.Reset(ThemeChanger)}
                >
                  {t("buttons.reset")}
                </Link>
              </div>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>
    </Fragment>
  );
};
Switcher.defaultProps = {};

const mapStateToProps = (state) => ({
  local_varaiable: state
});

export default connect(mapStateToProps, { ThemeChanger })(Switcher);
