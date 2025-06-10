import React from 'react'
import { Modal } from 'react-bootstrap'
import { IoClose } from "react-icons/io5";

function CustomModal({ title, onClose, size, children }) {
  return (
    <Modal 
    show={true} 
    centered 
    size={size}
    keyboard={false}
    className='custom_modal'
    >
      <Modal.Header className='modal_header'>
        {title} <span><IoClose onClick={onClose} className='close_btn' /></span>
      </Modal.Header>
      <Modal.Body className='modal_body'>
        {children}
      </Modal.Body>
    </Modal>
  )
}

export default CustomModal