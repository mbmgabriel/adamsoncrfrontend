import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";
import Home from '../views//Home'
import AuthRoute from "./components/AuthRoute";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from '../views/Dashboard/Dashboard'

export default function Routing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = window.localStorage.getItem("token")
    console.log({token})
    if(token != null){
      setIsLoggedIn(true)
      setLoading(false)
    }
  }, [])

  return (
    <div className="content">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/dashboard' element={<Dashboard/>} />
          {/* {
            !loading && isLoggedIn ? (
              <>
                <Route path='/home' element={<Home/>}/>
              </>
            ) : (
              <>
                <Route path='/home' element={<Home/>}/>
              </>
            )
          } */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}