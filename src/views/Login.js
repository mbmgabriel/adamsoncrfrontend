import React, { useEffect, useState, useContext } from "react";
import {Col, Row, Form, Container, InputGroup, Button} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faEnvelope} from '@fortawesome/free-solid-svg-icons'
import {faLock} from '@fortawesome/free-solid-svg-icons'
import { faEye, faSchoolCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { faEyeSlash} from '@fortawesome/free-solid-svg-icons'
import { useHistory } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import Swal from 'sweetalert2';
import errorIcon from '../assets/icons/error.gif';

import admin from '../assets/icons/admin.svg'
import logo from '../assets/icons/logo.png'
import Auth from "../api/Auth";

function Login() {
  const [password, setPassword] = useState('')
  const [username, setUserName] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [showPassword, setShowPassword] = useState(false);
  const history = useHistory()

  const userContext = useContext(UserContext);
  const {user, refreshUser} = userContext.data

  const handleLogin = async(e) => {
    e.preventDefault()
    const data = {
      "username": username,
      "password": password,
      "schoolCode": schoolCode
    }
    const response = await new Auth().login(data)
    if(response.ok){
      localStorage.setItem("token", response?.data?.token)
      localStorage.setItem("userId", response?.data?.id)
      localStorage.setItem('roleName', response?.data?.roleCode )
      localStorage.setItem('roleId', response?.data?.roleId )
      refreshUser()
    }else{
      Swal.fire({
      imageUrl: errorIcon, 
      imageWidth: 200,  
      imageHeight: 200,
      title: 'ERROR', 
        text: 'Invalid credentials, please try again.',  
        confirmButtonText: 'TRY AGAIN',
        customClass: {
          popup: 'custom-swal-popup',  
          title: 'custom-swal-title',  
          content: 'custom-swal-text',
          confirmButton: 'custom-confirm-button' 
      }
      });
    }
  }



  const handleClickLogin = () =>{
    history.push('/dashboard')

  } 

  // console.log('user:', user)

    return (
      <Container fluid>
        <Row>
          <Col sm={12} md={12} lg={6} xl={6}>
            <div className='left-side'>
              <div className='form-container'>
                <h1 className="school-title"> <img src={logo} className='school-logo' /> HeadStart University</h1>
                <Form onSubmit={(e) => handleLogin(e)} className='form'>
                  <InputGroup className='mb-2' controlId="formBasicUsername">
                    <div className="icon">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </div>
                    <Form.Control
                      required
                      type="text"
                      placeholder="Email or username"
                      className="icon-input"
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </InputGroup>
                  <InputGroup className="mb-2">
                    <div className="icon">
                      <FontAwesomeIcon icon={faLock} />
                    </div>
                    <Form.Control
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                      <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                    </span>
                  </InputGroup>
                  <InputGroup className='mb-2' controlId="formBasicUsername">
                    <div className="icon">
                      <FontAwesomeIcon icon={faSchoolCircleExclamation} />
                    </div>
                    <Form.Control
                      required
                      type="text"
                      placeholder="School Code"
                      className="icon-input"
                      onChange={(e) => setSchoolCode(e.target.value)}
                    />
                  </InputGroup>

                  <Form.Group className='mt-4 text-center'>
                    <Button className='submit-btn' type='submit'>LOGIN</Button>
                  </Form.Group>
                </Form>

              </div>
            </div>
          </Col>

          <Col className='right-side' sm={12} md={12} lg={6} xl={6}>
              <img src={admin} alt='' className='right-image' />
          </Col>
        </Row>

        <Row>
        <Col className='footer-col' sm={12} md={12} lg={12} xl={12}>
          <div class="container mt-3">
            <footer class="footer text-center">
              <p class="mb-0">&copy;2019 All Rights Reserved. HeadStart University</p>
            </footer>
          </div>
        </Col>
      </Row>

      </Container>
    );
}

export default Login;

