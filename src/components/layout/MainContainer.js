import React from 'react'
import Header from '../Header/Header'
import User from '../Header/User'
import Footer from '../Footer/Footer'
import { isAdministrator } from '../../utils/userLanding'

function MainContainer({ children, headerVisible = true, fluid, loading = false, activeHeader, style, compactHeader = false }) {

  return (
    <div className='main-container' >
      <Header compact={compactHeader} activeHeader={activeHeader} visible={headerVisible} />
      {!isAdministrator(localStorage.getItem('role')) && <User />}
      <div className={`content${style ? ` ${style}` : ''}`}>
        <div>{children}</div>
      </div>
      <Footer />
    </div>
  )
}

export default MainContainer