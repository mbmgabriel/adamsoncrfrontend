import React, { useState } from 'react';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import styled from 'styled-components';

const SubMenu = ({ item, closeSideBar }) => {
  const SideBarLink = styled(Link)`
    display: flex;
    color: #fff;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    list-style: none;
    height: 60px;
    text-decoration: none;
    font-size: 18px;
    margin-bottom:0.5rem;
    margin-left:6px;
    &:hover {
      background-color: #f8f8f8;
      cursor: pointer;
			color: #990012;
    }

    &.active {
      background-color: white;
      color: #990012;
    }
  `;

  const SideBarLabel = styled.span`
    margin-left: 16px;
  `;

  const DropdownLink = styled(Link)`
	height: 60px;
	padding-left: 3rem;
	display: flex;
	align-items: center;
	text-decoration: none;
	color: #fff;
	font-size: 18px;
  margin-left:6px;
	&:hover {
		background: #fff;
		cursor: pointer;
		color: #990012;
	}
	`;

  const [subnav, setSubnav] = useState(false);

  const showSubNav = () => setSubnav(!subnav);

  return (
    <>
      <SideBarLink
        to={item.path}
        onClick={() => {
          if (item.subNav && showSubNav) {
            showSubNav();
          }
          if (window.location.pathname === item.path) {
            closeSideBar();
          }
        }}
        className={subnav ? 'active' : ''}
      >
        <div>
          {item.icon}
          <SideBarLabel>{item.title}</SideBarLabel>
        </div>
        <div>{item.subNav && subnav ? item.iconOpened : item.subNav ? item.iconClosed : null}</div>
      </SideBarLink>
      {subnav && item.subNav.map((item, index) => {
        return (
          <DropdownLink
            to={item.path}
            key={index}
            onClick={() => {
              if (window.location.pathname === item.path) {
                showSubNav();
                closeSideBar();
              }
            }}
          >
            {item.icon}
            <SideBarLabel>{item.title}</SideBarLabel>
          </DropdownLink>
        )
      })}
    </>
  );
};

export default SubMenu;
