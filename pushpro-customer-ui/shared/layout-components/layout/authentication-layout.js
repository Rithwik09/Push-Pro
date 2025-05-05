import React, { Fragment } from "react";
import store from "../../redux/store";
import { Provider } from "react-redux";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Authenticationswitcher from "../switcher/authenticationswitcher";

function Authenticationlayout({ children }) {
  return (
    <Fragment>
      <Provider store={store}>
        <HelmetProvider>
          <Helmet>
            <body className=""></body>
          </Helmet>
          <Authenticationswitcher />
          {children}
        </HelmetProvider>
      </Provider>
    </Fragment>
  );
}

export default Authenticationlayout;
