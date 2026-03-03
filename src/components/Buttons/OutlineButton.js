import React from 'react'
import { Button } from 'react-bootstrap'

function OutlineButton({label, onCancel, type}) {
  return (
    <Button onClick={onCancel} type={type} className='btn-outline-custom'>{label}</Button>
  )
}

export default OutlineButton