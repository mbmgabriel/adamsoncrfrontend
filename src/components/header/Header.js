import React, { useId, useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi';
import Logo from '../../assets/image/crd-logo.png'
import { useHistory } from 'react-router-dom'; 
import { toast } from 'react-toastify';

function Header({ activeHeader }) {
  const history = useHistory();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigationId = useId();

  const navData = [
    { name: 'Home', path: '/dashboard' },
    { name: 'Research Proposal', path: '/research' },
    { name: 'Research Presentation and Publication', underDevelopment: true },
    { name: 'FAQs', underDevelopment: true },
    { name: 'About CRD', underDevelopment: true },
  ];

  const handleNavigation = (item) => {
    setMenuOpen(false);
    if (item.underDevelopment) {
      toast.info(`${item.name} is under development.`);
      return;
    }

    history.push(item.path);
  };

  return (
    <header className='header'>
      <div className='top-header'>
        <div className='school_logo'>
          <img src={Logo} alt='Adamson University Center for Research and Development' className='logo' />
          <div className='text-container'>
            <span className='school_name'>
              Adamson University <br />
              Center for Research and Development
            </span>
            <p className='site_name'>Research Management Portal</p>
          </div>
        </div>

      </div>

      <nav className={`header_nav${menuOpen ? ' is-open' : ''}`} aria-label='Primary navigation'>
        <button type="button" className="nav-toggle" aria-expanded={menuOpen} aria-controls={navigationId} onClick={() => setMenuOpen(open => !open)}>
          {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          <span>Menu</span>
          <span className="nav-toggle-current">{activeHeader || 'Explore the portal'}</span>
        </button>
        <div className='nav_bar' id={navigationId}>
          {navData.map((item) => (
            <button
              type='button'
              key={item.name}
              aria-current={activeHeader === item.name ? 'page' : undefined}
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
    </header>
  );
}

export default Header;
