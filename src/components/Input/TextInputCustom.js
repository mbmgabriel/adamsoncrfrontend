import React from 'react';
import { Form } from 'react-bootstrap';

const TextInputCustom = React.forwardRef(({
  label,
  type = 'text',
  placeholder = '',
  required = false,
  readOnly = false,
  disabled = false,
  ...rest
}, ref) => {
  return (
    <Form.Group>
      <Form.Label>
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      <Form.Control
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
