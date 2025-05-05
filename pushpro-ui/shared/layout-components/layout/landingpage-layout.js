import React from 'react'
import { Provider } from 'react-redux'
import store from '../../redux/store'
import Customswitcher from '../switcher/customswitcher'

const Landingpagelayout = ({ children }) => {

  return (
    <>
      <Provider store={store}>
        <Customswitcher />
        <div>
          {children}
        </div>
        <div id="responsive-overlay"></div>
      </Provider>
    </>
  )
}

export default Landingpagelayout;
