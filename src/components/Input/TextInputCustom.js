import React from 'react'
import { Form } from 'react-bootstrap'

function TextInputCustom({label, type = 'text', placeholder = ''}) {
  return (
    <Form.Group>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={type}
        placeholder={placeholder}
        />
    </Form.Group>
  )
}

export default TextInputCustom