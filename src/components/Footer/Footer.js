import React from 'react';
import Logo from '../../assets/image/adamson_logo.png';
import { MdLocationPin, MdEmail, MdLocalPhone } from "react-icons/md";
import { FaFacebook, FaCopyright, FaRegRegistered } from "react-icons/fa";

function Footer() {
  return (
    <footer className='footer'>
      <div className='footer__inner'>
        <div className='footer__school'>
          <img src={Logo} alt='Adamson University seal' className='footer__logo' />
          <div className='footer__name'>
            <span className='footer__adamson'>ADAMSON</span>
            <span className='footer__university'>UNIVERSITY</span>
          </div>
        </div>

        <div className='footer__contact'>
          <h5>Contact Us</h5>
          <div className='footer__contact-info'>
            <div className='footer__contact-info__item'>
              <div aria-hidden="true"><MdLocationPin size={20} className='footer__icons' /></div>
              <div>
                <a className="footer__map-link" href="https://www.google.com/maps/search/?api=1&query=Adamson%20University%2C%20900%20San%20Marcelino%20St.%2C%20Ermita%2C%20Manila%2C%20Philippines%201000" target="_blank" rel="noopener noreferrer">
                  2nd Flr., CoPoTy Bldg., Adamson University, 900 San Marcelino St., Ermita, Manila, Philippines 1000
                </a>
              </div>
            </div>
            <div className='footer__contact-info__item'>
              <div aria-hidden="true"><MdEmail size={20} className='footer__icons' /></div>
              <div><a href="mailto:adu_crd@adamson.edu.ph">adu_crd@adamson.edu.ph</a></div>
            </div>
            <div className='footer__contact-info__item'>
              <div aria-hidden="true"><MdLocalPhone size={20} className='footer__icons' /></div>
              <div>Direct Line - (02) 85250604 Local - 8524-20-11 Loc. 153</div>
            </div>
            <div className='footer__contact-info__item'>
              <div aria-hidden="true"><FaFacebook size={20} className='footer__icons' /></div>
              <div>
                <a href="https://www.facebook.com/aducrd" target="_blank" rel="noopener noreferrer">Adamson University - Center for Research and Development</a>
              </div>
            </div>
          </div>
        </div>

        <div className='footer__legal'>
          <p><FaCopyright size={15} aria-hidden="true" />Copyright 2025</p>
          <p><FaRegRegistered size={15} aria-hidden="true" />All rights reserved</p>
          <p>Powered by: ____________</p>
          <p>Trademark Notice</p>
          <p><a className="footer__map-link" href="https://www.google.com/maps/search/?api=1&query=Adamson%20University%2C%20900%20San%20Marcelino%20St.%2C%20Ermita%2C%20Manila%2C%20Philippines%201000" target="_blank" rel="noopener noreferrer">Site Map</a></p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
