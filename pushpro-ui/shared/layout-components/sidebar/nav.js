//Icons
import React from "react";

const icon1 = (
  <i className="bi bi-house-door-fill side-menu__icon icon-color d-flex"></i>
);
const icon2 = (
  <i className="bi bi-file-text-fill side-menu__icon icon-color d-flex"></i>
);
const icon3 = (
  <i className="bi bi-people-fill side-menu__icon icon-color d-flex"></i>
);
const icon4 = (
  <i className="bi bi-diagram-3-fill side-menu__icon icon-color d-flex"></i>
);
const icon5 = (
  <i class="bi bi-person-badge side-menu__icon icon-color d-flex"></i>
);

//Badges
const badge2 = <span className="badge bg-warning-transparent ms-2">12</span>;

export const MENUITEMS = [
  {
    Items: [
      {
        path: "/dashboard",
        title: "Dashboard",
        icon: icon1,
        badgetxt: "",
        type: "link",
        active: false,
        selected: false
      }
    ]
  },
  {
    Items: [
      {
        path: "/myprojects",
        title: "myProjects",
        icon: icon2,
        badgetxt: "",
        type: "link",
        active: false,
        selected: false
      }
    ]
  },
  {
    Items: [
      {
        path: "/my-contractors",
        title: "myContractors",
        icon: icon3,
        badgetxt: "",
        type: "link",
        active: false,
        selected: false
      }
    ]
  },
  {
    Items: [
      {
        path: "/my-customers",
        title: "myCustomers",
        icon: icon5,
        badgetxt: "",
        type: "link",
        active: false,
        selected: false
      }
    ]
  },
  {
    Items: [
      {
        path: "/items",
        title: "items",
        icon: icon4,
        badgetxt: "",
        type: "link",
        active: false,
        selected: false
      }
    ]
  }
];
