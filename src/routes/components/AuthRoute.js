import React, { useContext, useEffect } from 'react'
import { Route } from 'react-router'
import { UserContext } from '../../context/UserContext'

export default function AuthRoute(props) {

  const userContext = useContext(UserContext)
  const {user} = userContext.data

  useEffect(() => {
    if(user != null){
      // if(user.isSystemAdmin) return window.location.href = "/dashboard"
       return window.location.href = "/dashboard"

      
    // if(user.isTeacher && user.isAssessment_status == "true" )  return window.location.href = "/dashboard"

    // if(user.isTeacher && user.isAssessment_status == "false") return window.location.href = "/assessmentpage1"
      
      // if(user.isTeacher && user.isAssessment_status){
      //   return window.location.href = "/dashboard"
      // }else{
      //   if
      // }
      }
  }, [user])

  if(user == null) return (
    <Route {...props}/>
  )
  return <div/>

}
