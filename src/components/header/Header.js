import React from 'react'
import Logo from '../../assets/image/crd-logo.png'
import { IoIosSearch } from "react-icons/io";
import { Form, InputGroup } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'; 
import { toast } from 'react-toastify';

function Header({ activeHeader }) {
  const history = useHistory();

  const navData = [
    { name: 'Home', path: '/dashboard' },
    { name: 'Research Proposal', path: '/research' },
    { name: 'Research Presentation and Publication', underDevelopment: true },
    { name: 'FAQs', underDevelopment: true },
    { name: 'About CRD', underDevelopment: true },
  ];

  const handleNavigation = (item) => {
    if (item.underDevelopment) {
      toast.info(`${item.name} is under development.`);
      return;
    }

    history.push(item.path);
  };

  return (
    <div className='header'>
      <div className='top-header'>
        <div className='school_logo'>
          <img src={Logo} alt='logo' className='logo' />
          <div className='text-container'>
            <span className='school_name'>
              Adamson University <br />
              Center for Research and Development
            </span>
            <p className='site_name'>Research Management Portal</p>
          </div>
        </div>

        <div className='search-div'>
          <InputGroup>
            <InputGroup.Text><IoIosSearch className='icon' /></InputGroup.Text>
            <Form.Control
              className='header-search'
              placeholder="(Search within AdU-CRD REMAP)"
              aria-label="Search within AdU-CRD REMAP"
            />
          </InputGroup>
        </div>
      </div>

      <nav className='header_nav' aria-label='Primary navigation'>
        <div className='nav_bar'>
          {navData.map((item) => (
            <button
              type='button'
              key={item.name}
              className={activeHeader === item.name ? "nav-pill-active" : "nav-pill"}
              onClick={() => handleNavigation(item)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </nav>

      <div className='header_title'>
        <div className='title_container'>
          <h1 className='title'>Take the lead</h1>
          <span className='sub'>
            — write, present, and publish your research to inspire change and drive innovation.
          </span>
        </div>
      </div>
    </div>
  );
}

export default Header;
