import React from 'react'
import { Button } from 'react-bootstrap'

function OutlineButton({label, onCancel}) {
  return (
    <Button onClick={onCancel} className='btn-outline-custom'>{label}</Button>
  )
}

export default OutlineButton