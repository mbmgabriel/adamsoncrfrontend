import React, { useEffect, useRef, useState } from 'react'
import { CiLogout } from "react-icons/ci";
import { FiChevronDown } from "react-icons/fi";
import { useHistory } from 'react-router-dom';
import { formatDisplayName } from '../../utils/formatName';

function User() {
  const history = useHistory();
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const name = formatDisplayName(window.localStorage.getItem('name'))
  const role = window.localStorage.getItem('role')
  const nameParts = name.split(' ').filter(Boolean)
  const initials = nameParts.length
    ? `${nameParts[0][0]}${nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : ''}`.toUpperCase()
    : 'U'

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    history.push("/");
  };
  
  return (
    <div className='user-div' ref={dropdownRef}>
      <div className='user-div__inner'>
        <div className='user-summary'>
          <span className='user-summary__label'>Signed in as</span>
          <strong className='user-summary__name'>{name || 'User'}</strong>
          {role && <span className='user-summary__role'>{role}</span>}
        </div>
        <button
          type="button"
          className={`user-menu-button${dropdownOpen ? ' is-open' : ''}`}
          aria-label={`Open account menu for ${name || 'user'}`}
          aria-expanded={dropdownOpen}
          onClick={() => setDropdownOpen((isOpen) => !isOpen)}
        >
          <span className='user-avatar' aria-hidden='true'>{initials}</span>
          <FiChevronDown className='user-menu-chevron' aria-hidden='true' />
        </button>

        {dropdownOpen && (
          <div className='user-dropdown'>
            <button type="button" className='user-dropdown-item' onClick={handleLogout}>
              <CiLogout className='logout-icon' />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default User
