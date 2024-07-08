import React from 'react'
import { BallTriangle } from 'react-loader-spinner'


export default function ActivityLoader() {
  return (
    <div className='absolute-loader'>
      <BallTriangle
        height={100}
        width={100}
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
