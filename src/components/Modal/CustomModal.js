import React, { useId } from 'react'
import { Modal } from 'react-bootstrap'
import { IoClose } from "react-icons/io5";

function CustomModal({ title, onClose, size, children, className = '', keyboard = false, scrollable = false }) {
  const titleId = useId();
  return (
    <Modal 
    show={true} 
    centered 
    size={size}
    keyboard={keyboard}
    scrollable={scrollable}
    onHide={onClose}
    aria-labelledby={titleId}
    className={`custom_modal ${className}`}
    >
      <Modal.Header className='modal_header'>
        <Modal.Title id={titleId}>{title}</Modal.Title>
        <button type="button" aria-label="Close" className="modal_close" onClick={onClose}><IoClose className='close_btn' aria-hidden="true" /></button>
      </Modal.Header>
      <Modal.Body className='modal_body'>
        {children}
      </Modal.Body>
    </Modal>
  )
}

export default CustomModal
