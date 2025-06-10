import React from 'react';
import Logo from '../../assets/image/adamson_logo.png';
import { MdLocationPin, MdEmail, MdLocalPhone } from "react-icons/md";
import { FaFacebook, FaCopyright, FaRegRegistered } from "react-icons/fa";

function Footer() {
  return (
    <div className='footer'>
      <div className='footer__school'>
        <img src={Logo} alt='Adamson' className='footer__logo' />
        <div className='footer__name'>
          <span className='footer__adamson'>ADAMSON</span>
          <span className='footer__university'>UNIVERSITY</span>
        </div>
      </div>

      <div className='footer__contact'>
        <h5>Contact Us</h5>
        <div className='footer__contact-info'>
          <div className='footer__contact-info__item'>
            <div><MdLocationPin size={20} className='footer__icons' /></div>
            <div>
              2nd Flr., CoPoTy Bldg., Adamson University, 900 San Marcelino St., Ermita, Manila, Philippines 1000
            </div>
          </div>
          <div className='footer__contact-info__item'>
            <div><MdEmail size={20} className='footer__icons' /></div>
            <div><u>adu_crd@adamson.edu.ph</u></div>
          </div>
          <div className='footer__contact-info__item'>
            <div><MdLocalPhone size={20} className='footer__icons' /></div>
            <div>Direct Line - (02) 85250604 Local - 8524-20-11 Loc. 153</div>
          </div>
          <div className='footer__contact-info__item'>
            <div><FaFacebook size={20} className='footer__icons' /></div>
            <div>
              <u>Adamson University - Center for Research and Development</u>
            </div>
          </div>
        </div>
      </div>

      <div className='footer__legal'>
        <p><FaCopyright size={15} />&nbsp; &nbsp;Copyright 2025</p>
        <p><FaRegRegistered size={15} />&nbsp; &nbsp;All rights reserved</p>
        <p>&nbsp; &nbsp; &nbsp; &nbsp;Powered by: ____________</p>
        <p>&nbsp; &nbsp; &nbsp; &nbsp;Trademark Notice</p>
        <p>&nbsp; &nbsp; &nbsp; &nbsp;Site Map</p>
      </div>
    </div>
  );
}

export default Footer;
