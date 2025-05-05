import React from 'react'
import Sidebar from "../sidebar/sidebar"
import TabToTop from "../tab-to-top/tab-to-top"
import Footer from "../footer/footer"
import Header2 from "../header/header"
const Switcher_layout = () => {
  return (
    <div className="horizontalMenucontainer">
      <div className="page">
        <Header2 />
        <Sidebar />
        <div className="main-content side-content">
          <div className="main-container container-fluid" >
            <div className="inner-body" >
              {children}
            </div>
          </div>
        </div>
      </div>
      <TabToTop />
      <Footer />
    </div>
  )
}

export default Switcher_layout
