import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaLock, FaEyeSlash, FaEye, FaUser } from "react-icons/fa";
import { TiInfoOutline } from "react-icons/ti";
import Logo from "../assets/image/CRD_Logo.jpg";
import CustomModal from "../components/Modal/CustomModal";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import ConfirmationButton from "../components/Buttons/ConfirmationButton";
import { useNavigate } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [privacyModal, setPrivacyModal] = useState(false);
  const [accountResetModal, setAccountResetModal] = useState(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false)
  const navigate = useNavigate();

  const onHide = () => setForgotPasswordModal(false)

  const privacyAndTerms = () => (
    <CustomModal
      title="Privacy and Terms of Use"
      size="xl"
      onClose={() => setPrivacyModal(false)}
    >
      <div>
        <h5>Who may use the services?</h5>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          velit sem, posuere eu libero eu, condimentum finibus nisi. In luctus
          id ipsum ut gravida. Cras nibh erat, varius ut neque non, laoreet
          pharetra urna. Etiam interdum venenatis ultrices. Mauris quis
          sollicitudin arcu. Aliquam vitae dignissim massa. Nam id orci sit amet
          velit condimentum rhoncus. Sed eget ex hendrerit, aliquam elit ut,
          pharetra lacus. Integer rutrum, libero quis imperdiet venenatis, purus
          magna efficitur risus, non fermentum sem dui vitae ante. Fusce a ex
          nec magna tincidunt aliquet.
        </p>
        <h5>Privacy</h5>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          velit sem, posuere eu libero eu, condimentum finibus nisi. In luctus
          id ipsum ut gravida. Cras nibh erat, varius ut neque non, laoreet
          pharetra urna. Etiam interdum venenatis ultrices. Mauris quis
          sollicitudin arcu. Aliquam vitae dignissim massa. Nam id orci sit amet
          velit condimentum rhoncus. Sed eget ex hendrerit, aliquam elit ut,
          pharetra lacus. Integer rutrum, libero quis imperdiet venenatis, purus
          magna efficitur risus, non fermentum sem dui vitae ante. Fusce a ex
          nec magna tincidunt aliquet.
        </p>
      </div>
    </CustomModal>
  );

  const accountReset = () => (
    <CustomModal
      title="Account Reset or Reactivation"
      size="xl"
      onClose={() => setAccountResetModal(false)}
    >
      <div className="account_reset">
        <div className="info_icon">
          <TiInfoOutline />
        </div>
        <div>
          For reset or reactivation concern on your AdU CRD - REMAP account,
          send an e-mail to <b>adu_crd@adamson.edu.ph</b> your ID number & full
          name from 8-5pm Monday - Friday only.
        </div>
      </div>
      <div className="center">
        <ConfirmationButton label="Ok" onProceed={() => setAccountResetModal(false)} />
      </div>
    </CustomModal>
  );



  return (
    <div className="login_container">
      <div className="login_logo">
        <img src={Logo} alt="logo" className="logo" />
        <h1 className="text-center login_title">Research Management Portal</h1>
      </div>
      <div className="login_form_container">
        <Form className="login_form">
          <h3>Welcome Back! Please Sign In your credentials to start.</h3>

          <Form.Group style={{ position: "relative" }}>
            <Form.Label>Username</Form.Label>
            <Form.Control
              className="password_input"
              type="text"
              placeholder="(Enter you username)"
            />
            <span className="input_icon">
              <FaUser />
            </span>
          </Form.Group>

          <Form.Group style={{ position: "relative" }}>
            <Form.Label>Password</Form.Label>
            <Form.Control
              className="password_input"
              type={showPassword ? "text" : "password"}
              placeholder="(Enter you password)"
            />
            <span
              className="show_password_icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
            <span className="input_icon">
              <FaLock />
            </span>
          </Form.Group>
          <div>
          <p className="forgot_password" onClick={() => setForgotPasswordModal(true)}>Forgot Password?</p>
          </div>

          <Button className="primary" onClick={() => navigate('/dashboard')}> Sign In</Button>
          <Button className="secondary">Sign In with Outlook</Button>

          <div className="between">
            <span 
            onClick={() => setPrivacyModal(true)}
            className="login-hover">
              Privacy and Terms of Use
            </span>
            <span
              onClick={() => setAccountResetModal(true)}
              className="text-end login-hover"
            >
              Account Reset or Reactivation
            </span>
          </div>
        </Form>
      </div>

      {privacyModal && privacyAndTerms()}
      {accountResetModal && accountReset()}
      {forgotPasswordModal && 
      <ForgotPassword
      onHide={() => onHide()}
       />}
    </div>
  );
}

export default Login;
