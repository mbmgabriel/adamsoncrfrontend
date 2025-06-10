import React from 'react'
import { TbBellRinging2Filled } from "react-icons/tb";


function Notifications({ item }) {
  return (
    <div className='notif'>
      <div className='notif-title'>
        Notifications
      </div>
      <div className='notif-container'>
        {item.map((item) => (
          <div className='notif-div'>
            <TbBellRinging2Filled size={50} />
            <div className='notif-details'>
              <span className='time-stamp'>{item.date} {item.time}</span>
              <span className='description'>{item.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Notifications