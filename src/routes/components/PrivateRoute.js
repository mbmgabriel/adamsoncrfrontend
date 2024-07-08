import React, { useContext, useEffect, useMemo } from 'react'
import { Route } from 'react-router'
import { UserContext } from '../../context/UserContext'

export default function PrivateRoute(props) {

  const userContext = useContext(UserContext)
  const {user} = userContext.data

  useEffect(() => {
    if(user == null){
     window.location.href = '/'
     return 
    }
  }, [user])

  if(user != null) return (
    <Route {...props}/>
  )

  return <div/>
}