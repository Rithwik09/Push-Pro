//Icons
import React from 'react';
import { useTranslation } from 'react-i18next';

const icon1 = <i className="bx bx-home side-menu__icon icon-color"></i>
const icon2 = <i className="bx bxs-file side-menu__icon icon-color"></i>

//Badges
const badge2 = <span className="badge bg-warning-transparent ms-2">12</span>

export const MENUITEMS = [
  {
    Items: [
      {
        path: "/dashboard",
        title: "Dashboard",
        icon: icon1,
        badgetxt: '',
        type: "link",
        active: true,
        selected: true,
      },
      
    ],
  },
  {
    Items: [
      {
        path: "/myprojects",
        title: "myProjects",
        icon: icon2,
        badgetxt: '',
        type: "link",
        active: true,
        selected: true,
      },
    ],
  },
];
