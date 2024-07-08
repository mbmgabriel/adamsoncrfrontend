import React from 'react'
import { Container, Navbar, Col, Dropdown } from 'react-bootstrap'
import schoolLogo from '../../assets/icons/logo8.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import user from '../../assets/icons/user.svg'

function Header() {

  const logout = async () => {
    await window.localStorage.clear()
    window.location.href = "/";
  }


  return (
    <Navbar expand="lg" className='top-header'>
      <Container fluid className="justify-content-between">
        <div className="d-flex">
          <Navbar.Brand >
            <FontAwesomeIcon icon={faBars} />
          </Navbar.Brand>
          {/* <form className="input-group w-auto my-auto d-none d-sm-flex">
            <input
              autoComplete="off"
              type="search"
              className="form-control"
              placeholder="Search for..."
            />
            <span className="input-group-text border-0 d-none d-lg-flex">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </form> */}
        </div>
        <Dropdown className='header-top'>
          <Dropdown.Toggle className='user-dropdown'>
            <img src={user} height="50" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item> Profile</Dropdown.Item>
            <Dropdown.Item onClick={() => logout()} > Log Out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

      </Container>
    </Navbar>
  )
}

export default Header