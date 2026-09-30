import React from 'react'
import { MdArrowForward } from 'react-icons/md'

function CardCustom({icon, title, footer, path, isVisible}) {
  if (!isVisible) {
    return null;
  }

  return (
    <button type='button' className='card-custom' onClick={path}>
      <span className='card-custom-icon' aria-hidden='true'>{icon}</span>
      <span className='card-custom-content'>{title}</span>
      <span className='card-custom-footer'>
        <span>{footer}</span>
        <MdArrowForward aria-hidden='true' />
      </span>
    </button>
  )
}

export default CardCustom
