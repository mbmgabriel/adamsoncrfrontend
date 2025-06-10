import React from 'react'
import { FaUserCircle } from "react-icons/fa";

function User() {
  return (
    <div className='user-div'>
      <span>Hello, John Doe <FaUserCircle className='user-icon' /> </span>
    </div>
  )
}

export default User