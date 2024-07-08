import React, { useState } from 'react';
import styled from 'styled-components';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SideBarData } from './SidebarData';
import SubMenu from './SubMenu';
import { Dropdown } from 'react-bootstrap';
import user from '../../assets/icons/user.svg'
import school from '../../assets/icons/logo.png'

const Nav = styled.div`
  background: #990012;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
`;

const NavIcon = styled(Link)`
  margin-left: 2rem;
  font-size: 2rem;
  height: 80px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: #fff;

  &:hover {
    color: #fff;
  }
`;

const CloseIcon = styled(NavIcon)`
  position: absolute;
  right: 1rem;
  top: -5rem;
`;

const SidebarNav = styled.nav`
  background: #990012;
  width: 250px;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: ${({ sideBar }) => (sideBar ? '0' : '-100%')};
  transition: 700ms ease-in;
  transition: 700ms ease-out;
  z-index: 1000;
  overflow-y:scroll;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent; 
  }
`;


const SidebarWrap = styled.div`
  width: 100%;
  position: relative;
  margin-top: 5rem;
`;

const SideBar = () => {
  const [sideBar, setSideBar] = useState(false);

  const showSideBar = () => setSideBar(!sideBar);
  const closeSideBar = () => setSideBar(false);

  const logout = async () => {
    await window.localStorage.clear()
    window.location.href = "/";
  }

  return (
    <>
      <Nav>

        <NavIcon to='#'>
          <FontAwesomeIcon icon={faBars} onMouseEnter={showSideBar} />
        </NavIcon>

        <Dropdown >
          <Dropdown.Toggle className='user-dropdown'>
            <img src={user} height="80" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item> Profile</Dropdown.Item>
            <Dropdown.Item onClick={() => logout()} > Log Out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

      </Nav>
      <SidebarNav sideBar={sideBar} onMouseLeave={closeSideBar}>
        <SidebarWrap className='school-wrap'>
          <img src={school} height="90" className="school-logo" />
          <CloseIcon to='#'>
            <FontAwesomeIcon icon={faTimes} onClick={closeSideBar} />
          </CloseIcon>
          <p className="school-name">HeadStart University</p>
          <hr />
          {SideBarData.map((item, index) => {
            return <SubMenu item={item} key={index} closeSideBar={closeSideBar} />
          })}
        </SidebarWrap>
      </SidebarNav>
    </>
  );
};

export default SideBar;


