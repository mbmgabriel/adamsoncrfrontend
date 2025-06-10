import React from 'react'

function CardCustom({icon, title, footer}) {
  return (
    <div className='card-custom'>
      <div className='card-custom-content'>
        <span className='icon'>{icon}</span>
        <span>{title}</span>
        </div>
      <div className='card-custom-footer'>{footer}</div>
    </div>
  )
}

export default CardCustom