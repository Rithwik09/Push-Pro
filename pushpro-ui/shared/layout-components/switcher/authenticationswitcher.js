import { Fragment, useEffect } from "react";
import Themeprimarycolor, * as switcherdata from "../../../shared/data/switcherdata/switcherdata";
import { connect } from "react-redux";
import { ThemeChanger } from "../../redux/action";
import { Button, Nav, Tab } from "react-bootstrap";
import Link from "next/link";
import { HelmetProvider, Helmet } from "react-helmet-async";
const Authenticationswitcher = ({ local_varaiable, ThemeChanger }) => {
  useEffect(() => {
    switcherdata.LocalStorageBackup(ThemeChanger);
  }, []);

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
            data-theme-mode={local_varaiable.dataThemeMode}
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
            Switcher
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
                      Theme Styles
                    </Button>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link className="p-0" eventKey="firebase">
                    {" "}
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
                  <p className="switcher-style-head">Theme Color Mode:</p>
                  <div className="row switcher-style gx-0">
                    <div className="col-4">
                      <div className="form-check switch-select">
                        <label
                          className="form-check-label"
                          htmlFor="switcher-light-theme"
                        >
                          Light
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
                          Dark
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
                  <p className="switcher-style-head">Directions:</p>
                  <div className="row switcher-style gx-0">
                    <div className="col-4">
                      <div className="form-check switch-select">
                        <label
                          className="form-check-label"
                          htmlFor="switcher-ltr"
                        >
                          LTR
                        </label>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="direction"
                          id="switcher-ltr"
                          checked={local_varaiable.dir == "ltr"}
                          onChange={(_e) => {}}
                          onClick={() => {
                            switcherdata.Ltr(ThemeChanger);
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="form-check switch-select">
                        <label
                          className="form-check-label"
                          htmlFor="switcher-rtl"
                        >
                          RTL
                        </label>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="direction"
                          id="switcher-rtl"
                          checked={local_varaiable.dir == "rtl"}
                          onChange={(_e) => {}}
                          onClick={() => {
                            switcherdata.Rtl(ThemeChanger);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="">
                  <p className="switcher-style-head">Navigation Styles:</p>
                  <div className="row switcher-style gx-0">
                    <div className="col-4">
                      <div className="form-check switch-select">
                        <label
                          className="form-check-label"
                          htmlFor="switcher-vertical"
                        >
                          Vertical
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
                          Horizontal
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
              </Tab.Pane>
              <Tab.Pane eventKey="firebase">
                <div>
                  <div className="theme-colors">
                    <p className="switcher-style-head">Theme Primary:</p>
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
                  <div className="theme-colors">
                    <p className="switcher-style-head">Theme Background:</p>
                    <div className="d-flex flex-wrap align-items-center switcher-style">
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-bg-1"
                          type="radio"
                          onClick={() =>
                            switcherdata.backgroundColor1(ThemeChanger)
                          }
                          checked={local_varaiable.bodyBg1 == "20, 30, 96"}
                          onChange={(_e) => {}}
                          name="theme-background"
                          id="switcher-background"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-bg-2"
                          type="radio"
                          onClick={() =>
                            switcherdata.backgroundColor2(ThemeChanger)
                          }
                          checked={local_varaiable.bodyBg1 == "8, 78, 115"}
                          onChange={(_e) => {}}
                          name="theme-background"
                          id="switcher-background1"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-bg-3"
                          type="radio"
                          name="theme-background"
                          onClick={() =>
                            switcherdata.backgroundColor3(ThemeChanger)
                          }
                          checked={local_varaiable.bodyBg1 == "90, 37, 135"}
                          onChange={(_e) => {}}
                          id="switcher-background2"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-bg-4"
                          type="radio"
                          onClick={() =>
                            switcherdata.backgroundColor4(ThemeChanger)
                          }
                          checked={local_varaiable.bodyBg1 == "24, 101, 51"}
                          onChange={(_e) => {}}
                          name="theme-background"
                          id="switcher-background3"
                        />
                      </div>
                      <div className="form-check switch-select me-3">
                        <input
                          className="form-check-input color-input color-bg-5"
                          type="radio"
                          onClick={() =>
                            switcherdata.backgroundColor5(ThemeChanger)
                          }
                          checked={local_varaiable.bodyBg1 == "120, 66, 20"}
                          onChange={(_e) => {}}
                          name="theme-background"
                          id="switcher-background4"
                        />
                      </div>
                      <div className="form-check switch-select ps-0 mt-1 tooltip-static-demo color-bg-transparent">
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
                              <switcherdata.Themebackgroundcolor
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
                  href="#"
                  id="reset-all"
                  className="btn btn-danger m-1 w-100"
                  onClick={() => switcherdata.Reset(ThemeChanger)}
                >
                  Reset
                </Link>
              </div>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>
    </Fragment>
  );
};
Authenticationswitcher.defaultProps = {};

const mapStateToProps = (state) => ({
  local_varaiable: state
});

export default connect(mapStateToProps, { ThemeChanger })(
  Authenticationswitcher
);
