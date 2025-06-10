import React from 'react'
import Header from '../Header/Header'
import User from '../Header/User'
import Footer from '../Footer/Footer'

function MainContainer({ children, headerVisible = true, fluid, loading = false, activeHeader, style }) {

  return (
    <div className='main-container' >
      <Header activeHeader={activeHeader} visible={headerVisible} />
      <User />
      <div className={`content ${style}`}>
        <div>{children}</div>
      </div>
      <Footer />
    </div>
  )
}

export default MainContainer