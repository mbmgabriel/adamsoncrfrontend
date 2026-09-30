import React from 'react'
import { TbBellRinging2Filled } from "react-icons/tb";


function Notifications({ item }) {
  return (
    <section className='notif'>
      <div className='notif-header'>
        <div>
          <span>Recent activity</span>
          <h2 className='notif-title'>Notifications</h2>
        </div>
        <span className='notif-count'>{item.length}</span>
      </div>
      <div className='notif-container' role='list'>
        {item.map((notification, index) => (
          <article
            className='notif-div'
            role='listitem'
            key={`${notification.date}-${notification.time}-${index}`}
          >
            <span className='notif-icon' aria-hidden='true'>
              <TbBellRinging2Filled />
            </span>
            <div className='notif-details'>
              <span className='time-stamp'>
                <strong>{notification.date}</strong>
                <span>{notification.time}</span>
              </span>
              <p className='description'>{notification.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Notifications
