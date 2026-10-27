import React, { useEffect, useId, useRef, useState } from 'react'
import { CiLogout } from "react-icons/ci";
import { FiChevronDown, FiShield } from "react-icons/fi";
import { useHistory } from 'react-router-dom';
import { formatDisplayName } from '../../utils/formatName';

function User({ compact = false }) {
  const history = useHistory();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownId = useId();
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

    const handleEscape = event => {
      if (event.key === 'Escape' && dropdownRef.current?.contains(document.activeElement)) {
        setDropdownOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    history.push("/");
  };
  
  return (
    <div className={`user-div${compact ? ' user-div--compact' : ''}`} ref={dropdownRef}>
      <div className='user-div__inner'>
        {!compact && <div className='user-summary'>
          <strong className='user-summary__name'>{name || 'User'}</strong>
          {role && <span className='user-summary__role'>{role}</span>}
        </div>}
        <button
          type="button"
          ref={buttonRef}
          aria-controls={dropdownOpen ? dropdownId : undefined}
          className={`user-menu-button${dropdownOpen ? ' is-open' : ''}`}
          aria-label={`Open account menu for ${name || 'user'}`}
          aria-expanded={dropdownOpen}
          onClick={() => setDropdownOpen((isOpen) => !isOpen)}
        >
          <span className='user-avatar' aria-hidden='true'>{initials}</span>
          {compact && <span className='admin-account-summary'><strong>{name || 'Administrator'}</strong><span><FiShield aria-hidden='true' /> Administrator</span></span>}
          <FiChevronDown className='user-menu-chevron' aria-hidden='true' />
        </button>

        {dropdownOpen && (
          <div className='user-dropdown' id={dropdownId}>
            {compact && <div className='admin-account-dropdown-heading'><span>Signed in as</span><strong>{name || 'Administrator'}</strong><span className='admin-account-access'><FiShield aria-hidden='true' /> Administrator access</span></div>}
            {!compact && role === 'Administrator' && <button type="button" className='user-dropdown-item' onClick={() => {setDropdownOpen(false);history.push('/admin');}}>Admin Portal</button>}
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
