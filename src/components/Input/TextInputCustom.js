import React from 'react';
import { Form } from 'react-bootstrap';

const TextInputCustom = React.forwardRef(({
  label,
  type = 'text',
  placeholder = '',
  isForm = false,
  required = false,
  readOnly = false,
  disabled = false,
  ...rest
}, ref) => {
  return (
    <Form.Group className={`custom-input ${isForm ? 'flex-container' : ''}`}>
      <Form.Label className={`custom-label ${required ? 'margin-left-18' : ''}`}>
         {required && <span className="text-danger">*</span>} {label}
      </Form.Label>
      <Form.Control
        className='custom-control'
        type={type}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        ref={ref}
        {...rest}
      />
    </Form.Group>
  );
});

export default TextInputCustom;
