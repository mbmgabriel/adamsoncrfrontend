import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap'
import CustomModal from '../../components/Modal/CustomModal';
import OutlineButton from '../../components/Buttons/OutlineButton';
import ConfirmationButton from '../../components/Buttons/ConfirmationButton';
import OTPInput from 'react-otp-input';
import { TiInfoOutline } from "react-icons/ti";

function ForgotPassword({ onHide }) {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('')
  const stepTitles = {
    1: "Forgot Password",
    2: "One Time Passcode",
    3: "Reset Password",
    4: "Successfully Reset Password",
  };

  const handleSubmitStep1 = () => {
    setStep(2);
  };

  const handleSubmitStep2 = () => {
    setStep(3);
  };

  const handleSubmitStep3 = () => {
    setStep(4);
  };


  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <p>
              Enter your <em>First Name</em>, <em>Last Name</em>, and <em>Email Address</em> to change the password.
              You need an active email address associated with your account to receive instructions.
              Your current password remains active until you change it.
            </p>
            <Row className='center'>
              <Col sm={12} md={5}>
                <div className='forgot_password_form'>
                  <Form.Group>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control name="firstName" placeholder="(Enter your first name)" />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control name="lastName" placeholder="(Enter your last name)" />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control name="email" placeholder="(Enter your email)" />
                  </Form.Group>
                </div>
                <div className="between mt-5">
                  <OutlineButton onCancel={() => onHide()} label="Cancel" />
                  <ConfirmationButton onProceed={() => handleSubmitStep1()} label="Submit" />
                </div>
              </Col>
            </Row>
          </div>
        );
      case 2:
        return (
          <div>
            <p>Enter the One-Time Passcode (OTP) sent to your email to reset your password.</p>
            <div className='center gap-10'>
              <OTPInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                inputStyle="otp_input"
                renderSeparator={<span>&nbsp; &nbsp; &nbsp;</span>}
                renderInput={(props) => <input {...props} />}
              />
            </div>
            <p className='text-center'><small onClick={() => handleSubmitStep2()}>Resend (OTP) in <strong>120 seconds</strong></small></p>
          </div>
        );
      case 3:
        return (
          <div>
            <p>Enter your new password.</p>
            <Row className='center'>
              <Col sm={12} md={5}>
                <div className='forgot_password_form'>
                  <Form.Group>
                    <Form.Label>New Password</Form.Label>
                    <Form.Control name="password" placeholder="(Enter your password)" />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Re-Type New Password</Form.Label>
                    <Form.Control name="retypePassword" placeholder="(Re-type your password)" />
                  </Form.Group>
                </div>
                <div className="between mt-5">
                  <OutlineButton onCancel={() => onHide()} label="Cancel" />
                  <ConfirmationButton onProceed={() => handleSubmitStep3()} label="Submit" />
                </div>
              </Col>
            </Row>
          </div>
        );
      case 4:
        return (
          <div>
            <div className="account_reset">
              <div className="info_icon">
                <TiInfoOutline />
              </div>
              <div>
                Reset password successfully.
              </div>
            </div>
            <div className="center">
              <ConfirmationButton label="Ok" onProceed={() => onHide()} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <CustomModal
      title={stepTitles[step]}
      size="xl" onClose={onHide}>
      {renderStep()}
    </CustomModal>
  );
}

export default ForgotPassword;
