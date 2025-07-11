import React from 'react'
import Logo from '../../assets/image/crd-logo.png'
import { IoIosSearch } from "react-icons/io";
import { Form, InputGroup } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'; 

function Header({activeHeader}) {
  const history = useHistory();
  const navData = [
    {
      name: 'Home',
      path: '/dashboard',
    },
    {
      name: 'Research Proposal',
      path: '/research'
    },
    {
      name: 'Research Presentation and Publication',
      path: '/'
    },
    {
      name: 'FAQs',
      path: '/'
    },
    {
      name: 'About CRD',
      path: '/'
    },
  ]
  return (
    <div className='header'>
      <div className='top-header'>
        <div className='school_logo'>
          <img src={Logo} alt='logo' className='logo' />
          <div className='text-container'>
            <span className='school_name'>Adamson University <br />
              Center for Research and Development</span>
            <p className='site_name'>Research Management Portal</p>
          </div>
        </div>
        <div className='search-div'>
          <InputGroup className="mb-3">
            <InputGroup.Text><IoIosSearch className='icon' /></InputGroup.Text>
            <Form.Control
              className='header-search'
              placeholder="(Search within AdU-CRD REMAP)"
              aria-label="Username"
              aria-describedby="basic-addon1"
            />
          </InputGroup>
        </div>
      </div>
      <div className='header_nav'>
        <div className='nav_bar'>
          {navData.map((item) => {
            return (
              <div className={activeHeader === item.name ? `nav-pill-active` : `nav-pill`}
              onClick={() => history.push(item.path)}>{item.name}</div>
            )
          })}
        </div>
      </div>
      <div className='header_title'>
        <div className='title_container'>
          <h1 className='title'>Take the lead</h1>
          <span className='sub'>— write, present, and publish your research to inspire change and drive innovation.</span>
        </div>
      </div>
    </div>
  )
}

export default Header