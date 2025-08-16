import React from 'react'

export default function FormCard({children, className}) {
  return (
    <div className={`form-card ${className}`}>{children}</div>
  )
}
