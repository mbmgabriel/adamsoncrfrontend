import React from 'react'
import { Button } from 'react-bootstrap'

function ConfirmationButton({label, onProceed}) {
  return (
    <Button onClick={onProceed} className='btn-confirmation-custom'>{label}</Button>
  )
}

export default ConfirmationButton