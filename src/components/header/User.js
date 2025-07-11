import React from 'react'
import { FaUserCircle } from "react-icons/fa";

function User() {
  const name = window.localStorage.getItem('name')
  const role = window.localStorage.getItem('role')
  return (
    <div className='user-div'>
      <span>Hello {role}, {name} <FaUserCircle className='user-icon' /> </span>
    </div>
  )
}

export default User