import React from 'react'

function CardCustom({icon, title, footer, path}) {
  return (
    <div className='card-custom cursor-pointer' onClick={path}>
      <div className='card-custom-content'>
        <span className='icon'>{icon}</span>
        <span>{title}</span>
        </div>
      <div className='card-custom-footer'>{footer}</div>
    </div>
  )
}

export default CardCustom