import React from 'react'
import {BallTriangle} from 'react-loader-spinner'

export default function PageLoader() {
  return (
    <div className='page-loader'>
      <BallTriangle
        height={200}
        width={200}
        radius={5}
        color="#990012"
        ariaLabel="ball-triangle-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
    </div>
  )
}
