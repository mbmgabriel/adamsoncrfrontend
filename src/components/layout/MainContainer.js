import React from 'react'
import SideBarMenu from '../sidenav/SideBarMenu'
import { Container, Row, Col } from 'react-bootstrap'
import Header from '../header/Header'
import SideNav from '../sidenav/SideBar'

function MainContainer({children, headerVisible = true, fluid, loading = false, activeHeader, style}) {

  return (
    <div className='main-container' >
      <SideNav />
      <div className={`content ${style}`}>
        {/* <Header /> */}
        <Row>
            {/* <Col className='col-auto col-sm-2 bg-color d-flex flex-column justify-content-between min-vh-100 border-r ' >
              <SideBarMenu  activeHeader={activeHeader} />
              </Col> */}
            <Col>{children}</Col>
        </Row>        
      </div>
    </div>
  )
}

export default MainContainer